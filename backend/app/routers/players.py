from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, func, or_
from sqlmodel import Session, select

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.models.comment import Comment
from app.models.endorsement import Endorsement
from app.models.player import Achievement, ClubHistory, HighlightVideo, PlayerProfile, PlayerStats
from app.models.post import Post, PostType
from app.models.user import User, UserRole
from app.schemas.player import (
    AchievementCreate,
    AchievementRead,
    ClubHistoryCreate,
    ClubHistoryRead,
    CommentCreate,
    CommentRead,
    FeedItemRead,
    HighlightVideoCreate,
    HighlightVideoRead,
    PlayerCardRead,
    PlayerProfileCreate,
    PlayerProfileRead,
    PlayerProfileUpdate,
    PostCreate,
    PostRead,
    PlayerStatsRead,
    PlayerStatsUpdate,
)
from app.services.players import (
    ensure_player_profile_owner,
    get_player_profile_or_404,
    get_profile_by_user_id,
    serialize_comments,
    serialize_feed,
    serialize_player_card,
    serialize_player_profile,
    serialize_post,
)


router = APIRouter()


@router.get("/feed", response_model=list[FeedItemRead], tags=["feed"])
def get_feed(limit: int = Query(default=20, le=50), session: Session = Depends(get_session)):
    return serialize_feed(session, limit=limit)


@router.post("/posts", response_model=PostRead, status_code=status.HTTP_201_CREATED, tags=["posts"])
def create_post(
    payload: PostCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    player_profile = get_profile_by_user_id(session, current_user.id)
    highlight = session.get(HighlightVideo, payload.highlight_video_id) if payload.highlight_video_id else None
    if payload.highlight_video_id and not highlight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Highlight not found")
    if payload.highlight_video_id and current_user.role != UserRole.player:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only players can attach highlights to posts")
    if payload.highlight_video_id and player_profile and highlight and highlight.player_profile_id != player_profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Can only attach your own highlights")

    post = Post(
        user_id=current_user.id,
        player_profile_id=player_profile.id if player_profile else None,
        highlight_video_id=payload.highlight_video_id,
        title=payload.title,
        content=payload.content,
        post_type=PostType.player_update if current_user.role == UserRole.player else PostType.club_announcement,
    )
    session.add(post)
    session.commit()
    session.refresh(post)
    return serialize_post(session, post)


@router.get("/players", response_model=list[PlayerCardRead], tags=["players"])
def list_players(session: Session = Depends(get_session)):
    profiles = session.exec(select(PlayerProfile).order_by(desc(PlayerProfile.created_at))).all()
    return [serialize_player_card(session, profile) for profile in profiles]


@router.post("/players", response_model=PlayerProfileRead, status_code=status.HTTP_201_CREATED, tags=["players"])
def create_player_profile(
    payload: PlayerProfileCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.player:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only players can create profiles")
    existing = session.exec(select(PlayerProfile).where(PlayerProfile.user_id == current_user.id)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Player profile already exists")

    profile = PlayerProfile(user_id=current_user.id, **payload.model_dump())
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return serialize_player_profile(session, profile)


@router.get("/players/{id}", response_model=PlayerProfileRead, tags=["players"])
def get_player(id: int, session: Session = Depends(get_session)):
    return serialize_player_profile(session, get_player_profile_or_404(session, id))


@router.put("/players/{id}", response_model=PlayerProfileRead, tags=["players"])
def update_player(
    id: int,
    payload: PlayerProfileUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    profile = get_player_profile_or_404(session, id)
    ensure_player_profile_owner(current_user, profile)
    for key, value in payload.model_dump().items():
        setattr(profile, key, value)
    profile.updated_at = datetime.now(timezone.utc)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return serialize_player_profile(session, profile)


@router.post("/players/{id}/clubs", response_model=ClubHistoryRead, status_code=status.HTTP_201_CREATED, tags=["clubs"])
def create_club(
    id: int,
    payload: ClubHistoryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    profile = get_player_profile_or_404(session, id)
    ensure_player_profile_owner(current_user, profile)
    club = ClubHistory(player_profile_id=id, **payload.model_dump())
    session.add(club)
    session.commit()
    session.refresh(club)
    return club


@router.put("/clubs/{id}", response_model=ClubHistoryRead, tags=["clubs"])
def update_club(
    id: int,
    payload: ClubHistoryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    club = session.get(ClubHistory, id)
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club entry not found")
    profile = get_player_profile_or_404(session, club.player_profile_id)
    ensure_player_profile_owner(current_user, profile)
    for key, value in payload.model_dump().items():
        setattr(club, key, value)
    session.add(club)
    session.commit()
    session.refresh(club)
    return club


@router.delete("/clubs/{id}", status_code=status.HTTP_204_NO_CONTENT, tags=["clubs"])
def delete_club(id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    club = session.get(ClubHistory, id)
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club entry not found")
    profile = get_player_profile_or_404(session, club.player_profile_id)
    ensure_player_profile_owner(current_user, profile)
    session.delete(club)
    session.commit()


@router.put("/players/{id}/stats", response_model=PlayerStatsRead, tags=["stats"])
def upsert_stats(
    id: int,
    payload: PlayerStatsUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    profile = get_player_profile_or_404(session, id)
    ensure_player_profile_owner(current_user, profile)
    stats = session.exec(select(PlayerStats).where(PlayerStats.player_profile_id == id)).first()
    if not stats:
        stats = PlayerStats(player_profile_id=id, **payload.model_dump())
    else:
        for key, value in payload.model_dump().items():
            setattr(stats, key, value)
    session.add(stats)
    session.commit()
    session.refresh(stats)
    return stats


@router.post("/players/{id}/achievements", response_model=AchievementRead, status_code=status.HTTP_201_CREATED, tags=["achievements"])
def create_achievement(
    id: int,
    payload: AchievementCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    profile = get_player_profile_or_404(session, id)
    ensure_player_profile_owner(current_user, profile)
    achievement = Achievement(player_profile_id=id, **payload.model_dump())
    session.add(achievement)
    session.commit()
    session.refresh(achievement)
    return achievement


@router.put("/achievements/{id}", response_model=AchievementRead, tags=["achievements"])
def update_achievement(
    id: int,
    payload: AchievementCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    achievement = session.get(Achievement, id)
    if not achievement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
    profile = get_player_profile_or_404(session, achievement.player_profile_id)
    ensure_player_profile_owner(current_user, profile)
    for key, value in payload.model_dump().items():
        setattr(achievement, key, value)
    session.add(achievement)
    session.commit()
    session.refresh(achievement)
    return achievement


@router.delete("/achievements/{id}", status_code=status.HTTP_204_NO_CONTENT, tags=["achievements"])
def delete_achievement(id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    achievement = session.get(Achievement, id)
    if not achievement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
    profile = get_player_profile_or_404(session, achievement.player_profile_id)
    ensure_player_profile_owner(current_user, profile)
    session.delete(achievement)
    session.commit()


@router.post("/players/{id}/highlights", response_model=HighlightVideoRead, status_code=status.HTTP_201_CREATED, tags=["highlights"])
def create_highlight(
    id: int,
    payload: HighlightVideoCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    profile = get_player_profile_or_404(session, id)
    ensure_player_profile_owner(current_user, profile)
    highlight = HighlightVideo(player_profile_id=id, **payload.model_dump())
    session.add(highlight)
    session.commit()
    session.refresh(highlight)
    return highlight


@router.put("/highlights/{id}", response_model=HighlightVideoRead, tags=["highlights"])
def update_highlight(
    id: int,
    payload: HighlightVideoCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    highlight = session.get(HighlightVideo, id)
    if not highlight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Highlight not found")
    profile = get_player_profile_or_404(session, highlight.player_profile_id)
    ensure_player_profile_owner(current_user, profile)
    for key, value in payload.model_dump().items():
        setattr(highlight, key, value)
    session.add(highlight)
    session.commit()
    session.refresh(highlight)
    return highlight


@router.delete("/highlights/{id}", status_code=status.HTTP_204_NO_CONTENT, tags=["highlights"])
def delete_highlight(id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    highlight = session.get(HighlightVideo, id)
    if not highlight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Highlight not found")
    profile = get_player_profile_or_404(session, highlight.player_profile_id)
    ensure_player_profile_owner(current_user, profile)
    session.delete(highlight)
    session.commit()


@router.get("/players/{id}/comments", response_model=list[CommentRead], tags=["comments"])
def get_comments(id: int, session: Session = Depends(get_session)):
    get_player_profile_or_404(session, id)
    return serialize_comments(session, id)


@router.post("/players/{id}/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED, tags=["comments"])
def create_comment(
    id: int,
    payload: CommentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    get_player_profile_or_404(session, id)
    comment = Comment(player_profile_id=id, author_user_id=current_user.id, content=payload.content)
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return serialize_comments(session, id)[0]


@router.delete("/comments/{id}", status_code=status.HTTP_204_NO_CONTENT, tags=["comments"])
def delete_comment(id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    comment = session.get(Comment, id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if current_user.id != comment.author_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete this comment")
    session.delete(comment)
    session.commit()


@router.post("/players/{id}/endorse", status_code=status.HTTP_201_CREATED, tags=["endorsements"])
def endorse_player(id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    get_player_profile_or_404(session, id)
    existing = session.exec(
        select(Endorsement).where(Endorsement.player_profile_id == id, Endorsement.user_id == current_user.id)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already endorsed")
    endorsement = Endorsement(player_profile_id=id, user_id=current_user.id)
    session.add(endorsement)
    session.commit()
    return {"status": "endorsed"}


@router.delete("/players/{id}/endorse", status_code=status.HTTP_204_NO_CONTENT, tags=["endorsements"])
def remove_endorsement(id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    endorsement = session.exec(
        select(Endorsement).where(Endorsement.player_profile_id == id, Endorsement.user_id == current_user.id)
    ).first()
    if not endorsement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Endorsement not found")
    session.delete(endorsement)
    session.commit()


@router.get("/search/players", response_model=list[PlayerCardRead], tags=["search"])
def search_players(
    q: str | None = None,
    primary_position: str | None = None,
    secondary_position: str | None = None,
    min_age: int | None = None,
    max_age: int | None = None,
    min_height: int | None = None,
    max_height: int | None = None,
    dominant_foot: str | None = None,
    city: str | None = None,
    country: str | None = None,
    club_name: str | None = None,
    sort: str = Query(default="newest", pattern="^(newest|age_asc|age_desc|most_endorsed)$"),
    session: Session = Depends(get_session),
):
    statement = select(PlayerProfile)
    if q:
        like = f"%{q.lower()}%"
        statement = statement.where(
            or_(
                func.lower(PlayerProfile.full_name).like(like),
                func.lower(func.coalesce(PlayerProfile.bio, "")).like(like),
            )
        )
    if primary_position:
        statement = statement.where(PlayerProfile.primary_position == primary_position)
    if secondary_position:
        statement = statement.where(PlayerProfile.secondary_position == secondary_position)
    if min_age is not None:
        statement = statement.where(PlayerProfile.age >= min_age)
    if max_age is not None:
        statement = statement.where(PlayerProfile.age <= max_age)
    if min_height is not None:
        statement = statement.where(PlayerProfile.height >= min_height)
    if max_height is not None:
        statement = statement.where(PlayerProfile.height <= max_height)
    if dominant_foot:
        statement = statement.where(PlayerProfile.dominant_foot == dominant_foot)
    if city:
        statement = statement.where(PlayerProfile.city == city)
    if country:
        statement = statement.where(PlayerProfile.country == country)
    if club_name:
        statement = statement.join(ClubHistory).where(ClubHistory.club_name == club_name)

    if sort == "newest":
        statement = statement.order_by(desc(PlayerProfile.created_at))
    elif sort == "age_asc":
        statement = statement.order_by(PlayerProfile.age.asc())
    elif sort == "age_desc":
        statement = statement.order_by(PlayerProfile.age.desc())
    else:
        statement = statement.order_by(desc(PlayerProfile.created_at))

    profiles = session.exec(statement).all()
    cards = [serialize_player_card(session, profile) for profile in profiles]
    if sort == "most_endorsed":
        cards.sort(key=lambda card: card.endorsement_count, reverse=True)
    return cards
