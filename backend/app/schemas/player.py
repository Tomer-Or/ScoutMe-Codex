from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class ClubHistoryCreate(BaseModel):
    club_name: str
    start_date: date
    end_date: Optional[date] = None
    position: Optional[str] = None
    notes: Optional[str] = None


class ClubHistoryRead(ClubHistoryCreate):
    id: int


class PlayerStatsUpdate(BaseModel):
    matches_played: int = 0
    goals: int = 0
    assists: int = 0
    minutes_played: int = 0
    clean_sheets: int = 0
    custom_notes: Optional[str] = None


class PlayerStatsRead(PlayerStatsUpdate):
    id: int


class AchievementCreate(BaseModel):
    title: str
    year: int
    description: Optional[str] = None


class AchievementRead(AchievementCreate):
    id: int


class HighlightVideoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None


class HighlightVideoRead(HighlightVideoCreate):
    id: int
    created_at: datetime


class PostCreate(BaseModel):
    title: str
    content: str
    highlight_video_id: Optional[int] = None


class PostRead(BaseModel):
    id: int
    title: str
    content: str
    post_type: str
    created_at: datetime
    highlight_video_id: Optional[int] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    author_user_id: int
    author_name: str
    author_role: str
    author_avatar_url: Optional[str] = None
    author_position: Optional[str] = None
    author_location: Optional[str] = None
    player_profile_id: Optional[int] = None


class FeedItemRead(BaseModel):
    id: str
    item_type: str
    title: str
    content: Optional[str] = None
    post_type: Optional[str] = None
    created_at: datetime
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    author_user_id: int
    author_name: str
    author_role: str
    author_avatar_url: Optional[str] = None
    author_position: Optional[str] = None
    author_location: Optional[str] = None
    player_profile_id: Optional[int] = None


class PlayerProfileBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    profile_image_url: Optional[str] = None
    primary_position: str
    secondary_position: Optional[str] = None
    age: int
    height: Optional[int] = None
    weight: Optional[int] = None
    dominant_foot: Optional[str] = None
    bio: Optional[str] = None


class PlayerProfileCreate(PlayerProfileBase):
    pass


class PlayerProfileUpdate(PlayerProfileBase):
    pass


class CommentCreate(BaseModel):
    content: str


class CommentRead(BaseModel):
    id: int
    author_user_id: int
    author_email: str
    content: str
    created_at: datetime


class PlayerCardRead(PlayerProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    endorsement_count: int
    comments_count: int
    matches_played: int = 0
    goals: int = 0
    assists: int = 0


class PlayerProfileRead(PlayerCardRead):
    clubs: list[ClubHistoryRead]
    stats: Optional[PlayerStatsRead] = None
    achievements: list[AchievementRead]
    highlights: list[HighlightVideoRead]
    comments: list[CommentRead]
