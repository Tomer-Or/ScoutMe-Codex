from datetime import timezone

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.chat import Conversation, Message
from app.models.player import PlayerProfile
from app.models.user import User
from app.schemas.chat import (
    ChatSearchResultRead,
    ConversationCreate,
    ConversationDetailRead,
    ConversationRead,
    MessageCreate,
    MessageRead,
)
from app.services.players import get_author_meta


def normalize_conversation_pair(user_a_id: int, user_b_id: int) -> tuple[int, int]:
    return tuple(sorted((user_a_id, user_b_id)))


def get_conversation_or_404(session: Session, conversation_id: int, current_user: User) -> Conversation:
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    if current_user.id not in (conversation.participant_one_id, conversation.participant_two_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot access this conversation")
    return conversation


def serialize_chat_identity(session: Session, user: User) -> dict[str, str | int | None]:
    author_meta = get_author_meta(session, user)
    return {
        "other_user_id": user.id,
        "other_user_name": str(author_meta["author_name"]),
        "other_user_role": str(author_meta["author_role"]),
        "other_user_avatar_url": author_meta["author_avatar_url"],
        "other_user_position": author_meta["author_position"],
        "other_user_location": author_meta["author_location"],
    }


def serialize_search_result(session: Session, user: User) -> ChatSearchResultRead:
    author_meta = get_author_meta(session, user)
    return ChatSearchResultRead(
        user_id=user.id,
        name=str(author_meta["author_name"]),
        role=str(author_meta["author_role"]),
        avatar_url=author_meta["author_avatar_url"],
        position=author_meta["author_position"],
        location=author_meta["author_location"],
    )


def serialize_message(session: Session, message: Message) -> MessageRead:
    sender = session.get(User, message.sender_user_id)
    if not sender:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message sender not found")
    sender_meta = get_author_meta(session, sender)
    return MessageRead(
        id=message.id,
        sender_user_id=message.sender_user_id,
        sender_name=str(sender_meta["author_name"]),
        sender_role=str(sender_meta["author_role"]),
        sender_avatar_url=sender_meta["author_avatar_url"],
        content=message.content,
        created_at=message.created_at,
    )


def list_conversations(session: Session, current_user: User) -> list[ConversationRead]:
    conversations = session.exec(
        select(Conversation)
        .where(
            (Conversation.participant_one_id == current_user.id) | (Conversation.participant_two_id == current_user.id)
        )
        .order_by(Conversation.updated_at.desc())
    ).all()

    results: list[ConversationRead] = []
    for conversation in conversations:
        other_user_id = (
            conversation.participant_two_id
            if conversation.participant_one_id == current_user.id
            else conversation.participant_one_id
        )
        other_user = session.get(User, other_user_id)
        if not other_user:
            continue
        last_message = session.exec(
            select(Message).where(Message.conversation_id == conversation.id).order_by(Message.id.desc())
        ).first()
        results.append(
            ConversationRead(
                **serialize_chat_identity(session, other_user),
                id=conversation.id,
                last_message=last_message.content if last_message else "No messages yet.",
                last_message_at=last_message.created_at if last_message else conversation.updated_at,
            )
        )
    return results


def get_conversation_detail(session: Session, conversation_id: int, current_user: User) -> ConversationDetailRead:
    conversation = get_conversation_or_404(session, conversation_id, current_user)
    other_user_id = (
        conversation.participant_two_id if conversation.participant_one_id == current_user.id else conversation.participant_one_id
    )
    other_user = session.get(User, other_user_id)
    if not other_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation participant not found")
    messages = session.exec(
        select(Message).where(Message.conversation_id == conversation.id).order_by(Message.created_at.asc())
    ).all()
    return ConversationDetailRead(
        id=conversation.id,
        **serialize_chat_identity(session, other_user),
        messages=[serialize_message(session, message) for message in messages],
    )


def get_or_create_conversation(session: Session, current_user: User, payload: ConversationCreate) -> ConversationRead:
    if payload.target_user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot start a conversation with yourself")

    target_user = session.get(User, payload.target_user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found")

    participant_one_id, participant_two_id = normalize_conversation_pair(current_user.id, payload.target_user_id)
    conversation = session.exec(
        select(Conversation).where(
            Conversation.participant_one_id == participant_one_id,
            Conversation.participant_two_id == participant_two_id,
        )
    ).first()

    if not conversation:
        conversation = Conversation(
            participant_one_id=participant_one_id,
            participant_two_id=participant_two_id,
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

    last_message = session.exec(
        select(Message).where(Message.conversation_id == conversation.id).order_by(Message.id.desc())
    ).first()
    last_message_at = conversation.updated_at
    if last_message:
        last_message_at = last_message.created_at if last_message.created_at.tzinfo else last_message.created_at.replace(tzinfo=timezone.utc)

    return ConversationRead(
        id=conversation.id,
        **serialize_chat_identity(session, target_user),
        last_message=last_message.content if last_message else "Conversation started on ScoutMe.",
        last_message_at=last_message_at,
    )


def search_chat_users(session: Session, current_user: User, query: str) -> list[ChatSearchResultRead]:
    normalized_query = query.strip().lower()
    if len(normalized_query) < 2:
        return []

    users = session.exec(select(User).where(User.id != current_user.id)).all()
    player_profiles = session.exec(select(PlayerProfile)).all()
    profile_by_user_id = {profile.user_id: profile for profile in player_profiles}

    results: list[ChatSearchResultRead] = []
    for user in users:
        profile = profile_by_user_id.get(user.id)
        search_fields = [user.email.lower()]
        if profile:
            search_fields.extend(
                [
                    profile.full_name.lower(),
                    (profile.primary_position or "").lower(),
                    (profile.city or "").lower(),
                    (profile.country or "").lower(),
                ]
            )
        else:
            author_meta = get_author_meta(session, user)
            search_fields.extend(
                [
                    str(author_meta["author_name"]).lower(),
                    str(author_meta["author_position"] or "").lower(),
                ]
            )

        if any(normalized_query in field for field in search_fields if field):
            results.append(serialize_search_result(session, user))

    results.sort(key=lambda item: (item.role != "player", item.name))
    return results[:8]


def create_message(
    session: Session,
    conversation_id: int,
    payload: MessageCreate,
    current_user: User,
) -> MessageRead:
    conversation = get_conversation_or_404(session, conversation_id, current_user)
    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message content cannot be empty")

    message = Message(
        conversation_id=conversation.id,
        sender_user_id=current_user.id,
        content=content,
    )
    session.add(message)
    session.commit()
    session.refresh(message)

    conversation.updated_at = message.created_at if message.created_at.tzinfo else message.created_at.replace(tzinfo=timezone.utc)
    session.add(conversation)
    session.commit()

    return serialize_message(session, message)
