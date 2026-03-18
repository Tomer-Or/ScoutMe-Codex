from datetime import timezone

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlmodel import Session, select

from app.models.comment import Comment
from app.models.endorsement import Endorsement
from app.models.player import Achievement, ClubHistory, HighlightVideo, PlayerProfile, PlayerStats
from app.models.post import Post
from app.models.user import User, UserRole
from app.schemas.player import CommentRead, FeedItemRead, PlayerCardRead, PlayerProfileRead, PostRead
from app.services.seed import SCOUT_CLUBS, club_avatar_path


SCOUT_DEMO_IDENTITIES = {club["email"]: {"name": club["name"], "avatar_url": club_avatar_path(club["name"])} for club in SCOUT_CLUBS}


def ensure_player_profile_owner(current_user: User, profile: PlayerProfile) -> None:
    if current_user.role != UserRole.player or current_user.id != profile.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owning player can modify this profile",
        )


def get_player_profile_or_404(session: Session, player_id: int) -> PlayerProfile:
    profile = session.get(PlayerProfile, player_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
    return profile


def serialize_player_card(session: Session, profile: PlayerProfile) -> PlayerCardRead:
    stats = session.exec(select(PlayerStats).where(PlayerStats.player_profile_id == profile.id)).first()
    endorsement_count = session.exec(
        select(func.count(Endorsement.id)).where(Endorsement.player_profile_id == profile.id)
    ).one()
    comments_count = session.exec(
        select(func.count(Comment.id)).where(Comment.player_profile_id == profile.id)
    ).one()

    return PlayerCardRead(
        id=profile.id,
        user_id=profile.user_id,
        full_name=profile.full_name,
        phone=profile.phone,
        city=profile.city,
        country=profile.country,
        profile_image_url=profile.profile_image_url,
        primary_position=profile.primary_position,
        secondary_position=profile.secondary_position,
        age=profile.age,
        height=profile.height,
        weight=profile.weight,
        dominant_foot=profile.dominant_foot,
        bio=profile.bio,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
        endorsement_count=int(endorsement_count or 0),
        comments_count=int(comments_count or 0),
        matches_played=stats.matches_played if stats else 0,
        goals=stats.goals if stats else 0,
        assists=stats.assists if stats else 0,
    )


def serialize_comments(session: Session, player_id: int) -> list[CommentRead]:
    comments = session.exec(
        select(Comment).where(Comment.player_profile_id == player_id).order_by(Comment.created_at.desc())
    ).all()
    authors = {
        user.id: user.email
        for user in session.exec(select(User).where(User.id.in_([comment.author_user_id for comment in comments]))).all()
    } if comments else {}
    return [
        CommentRead(
            id=comment.id,
            author_user_id=comment.author_user_id,
            author_email=authors.get(comment.author_user_id, "Unknown"),
            content=comment.content,
            created_at=comment.created_at,
        )
        for comment in comments
    ]


def serialize_player_profile(session: Session, profile: PlayerProfile) -> PlayerProfileRead:
    card = serialize_player_card(session, profile)
    clubs = session.exec(
        select(ClubHistory).where(ClubHistory.player_profile_id == profile.id).order_by(ClubHistory.start_date.desc())
    ).all()
    achievements = session.exec(
        select(Achievement).where(Achievement.player_profile_id == profile.id).order_by(Achievement.year.desc())
    ).all()
    highlights = session.exec(
        select(HighlightVideo).where(HighlightVideo.player_profile_id == profile.id).order_by(HighlightVideo.created_at.desc())
    ).all()
    stats = session.exec(select(PlayerStats).where(PlayerStats.player_profile_id == profile.id)).first()
    comments = serialize_comments(session, profile.id)
    return PlayerProfileRead(
        **card.model_dump(),
        clubs=[club.model_dump() for club in clubs],
        stats=stats.model_dump() if stats else None,
        achievements=[achievement.model_dump() for achievement in achievements],
        highlights=[highlight.model_dump() for highlight in highlights],
        comments=[comment.model_dump() for comment in comments],
    )


def get_profile_by_user_id(session: Session, user_id: int) -> PlayerProfile | None:
    return session.exec(select(PlayerProfile).where(PlayerProfile.user_id == user_id)).first()


def get_author_meta(session: Session, user: User) -> dict[str, str | int | None]:
    profile = get_profile_by_user_id(session, user.id)
    if profile:
        return {
            "author_user_id": user.id,
            "author_name": profile.full_name,
            "author_role": user.role.value,
            "author_avatar_url": profile.profile_image_url,
            "author_position": profile.primary_position,
            "author_location": ", ".join([value for value in [profile.city, profile.country] if value]) or None,
            "player_profile_id": profile.id,
        }

    scout_identity = SCOUT_DEMO_IDENTITIES.get(user.email)
    author_name = scout_identity["name"] if scout_identity else user.email.split("@")[0].replace(".", " ").title()
    author_avatar_url = scout_identity["avatar_url"] if scout_identity else None
    return {
        "author_user_id": user.id,
        "author_name": author_name,
        "author_role": user.role.value,
        "author_avatar_url": author_avatar_url,
        "author_position": "Scout / Club" if user.role == UserRole.scout else None,
        "author_location": None,
        "player_profile_id": None,
    }


def serialize_post(session: Session, post: Post) -> PostRead:
    user = session.get(User, post.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post author not found")
    highlight = session.get(HighlightVideo, post.highlight_video_id) if post.highlight_video_id else None
    author_meta = get_author_meta(session, user)
    return PostRead(
        id=post.id,
        title=post.title,
        content=post.content,
        post_type=post.post_type.value,
        created_at=post.created_at,
        highlight_video_id=post.highlight_video_id,
        video_url=highlight.video_url if highlight else None,
        thumbnail_url=highlight.thumbnail_url if highlight else None,
        **author_meta,
    )


def serialize_feed(session: Session, limit: int = 20) -> list[FeedItemRead]:
    posts = session.exec(select(Post).order_by(Post.created_at.desc())).all()
    linked_highlight_ids = {post.highlight_video_id for post in posts if post.highlight_video_id}
    highlights = session.exec(select(HighlightVideo).order_by(HighlightVideo.created_at.desc())).all()

    items: list[FeedItemRead] = []
    for post in posts:
        serialized = serialize_post(session, post)
        items.append(
            FeedItemRead(
                id=f"post-{serialized.id}",
                item_type="post",
                title=serialized.title,
                content=serialized.content,
                post_type=serialized.post_type,
                created_at=serialized.created_at,
                video_url=serialized.video_url,
                thumbnail_url=serialized.thumbnail_url,
                author_user_id=serialized.author_user_id,
                author_name=serialized.author_name,
                author_role=serialized.author_role,
                author_avatar_url=serialized.author_avatar_url,
                author_position=serialized.author_position,
                author_location=serialized.author_location,
                player_profile_id=serialized.player_profile_id,
            )
        )

    for highlight in highlights:
        if highlight.id in linked_highlight_ids:
            continue
        profile = session.get(PlayerProfile, highlight.player_profile_id)
        if not profile:
            continue
        user = session.get(User, profile.user_id)
        if not user:
            continue
        author_meta = get_author_meta(session, user)
        items.append(
            FeedItemRead(
                id=f"highlight-{highlight.id}",
                item_type="highlight",
                title=highlight.title,
                content=highlight.description,
                post_type="highlight",
                created_at=highlight.created_at,
                video_url=highlight.video_url,
                thumbnail_url=highlight.thumbnail_url,
                **author_meta,
            )
        )

    def sort_key(item: FeedItemRead):
        created_at = item.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        return created_at

    items.sort(key=sort_key, reverse=True)
    return items[:limit]
