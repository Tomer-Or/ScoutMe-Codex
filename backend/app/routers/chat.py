from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.models.user import User
from app.schemas.chat import ChatSearchResultRead, ConversationCreate, ConversationDetailRead, ConversationRead, MessageCreate, MessageRead
from app.services.chat import create_message, get_conversation_detail, get_or_create_conversation, list_conversations, search_chat_users


router = APIRouter()


@router.get("/chat/conversations", response_model=list[ConversationRead], tags=["chat"])
def get_conversations(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return list_conversations(session, current_user)


@router.post("/chat/conversations", response_model=ConversationRead, status_code=status.HTTP_201_CREATED, tags=["chat"])
def create_or_open_conversation(
    payload: ConversationCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return get_or_create_conversation(session, current_user, payload)


@router.get("/chat/conversations/{conversation_id}", response_model=ConversationDetailRead, tags=["chat"])
def get_conversation(
    conversation_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return get_conversation_detail(session, conversation_id, current_user)


@router.post("/chat/conversations/{conversation_id}/messages", response_model=MessageRead, status_code=status.HTTP_201_CREATED, tags=["chat"])
def send_message(
    conversation_id: int,
    payload: MessageCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return create_message(session, conversation_id, payload, current_user)


@router.get("/chat/search", response_model=list[ChatSearchResultRead], tags=["chat"])
def search_chat(
    q: str = Query(min_length=2),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return search_chat_users(session, current_user, q)
