from datetime import date, datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.comment import Comment
    from app.models.endorsement import Endorsement
    from app.models.user import User


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class PlayerProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, index=True)
    full_name: str
    phone: Optional[str] = None
    city: Optional[str] = Field(default=None, index=True)
    country: Optional[str] = Field(default=None, index=True)
    profile_image_url: Optional[str] = None
    primary_position: str = Field(index=True)
    secondary_position: Optional[str] = Field(default=None, index=True)
    age: int = Field(index=True)
    height: Optional[int] = Field(default=None, index=True)
    weight: Optional[int] = None
    dominant_foot: Optional[str] = Field(default=None, index=True)
    bio: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)

    user: Optional["User"] = Relationship(back_populates="player_profile")
    club_history: list["ClubHistory"] = Relationship(back_populates="player_profile")
    stats: Optional["PlayerStats"] = Relationship(back_populates="player_profile")
    achievements: list["Achievement"] = Relationship(back_populates="player_profile")
    highlights: list["HighlightVideo"] = Relationship(back_populates="player_profile")
    comments: list["Comment"] = Relationship(back_populates="player_profile")
    endorsements: list["Endorsement"] = Relationship(back_populates="player_profile")


class ClubHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_profile_id: int = Field(foreign_key="playerprofile.id", index=True)
    club_name: str = Field(index=True)
    start_date: date
    end_date: Optional[date] = None
    position: Optional[str] = None
    notes: Optional[str] = None

    player_profile: Optional["PlayerProfile"] = Relationship(back_populates="club_history")


class PlayerStats(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_profile_id: int = Field(foreign_key="playerprofile.id", unique=True, index=True)
    matches_played: int = 0
    goals: int = 0
    assists: int = 0
    minutes_played: int = 0
    clean_sheets: int = 0
    custom_notes: Optional[str] = None

    player_profile: Optional["PlayerProfile"] = Relationship(back_populates="stats")


class Achievement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_profile_id: int = Field(foreign_key="playerprofile.id", index=True)
    title: str
    year: int
    description: Optional[str] = None

    player_profile: Optional["PlayerProfile"] = Relationship(back_populates="achievements")


class HighlightVideo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_profile_id: int = Field(foreign_key="playerprofile.id", index=True)
    title: str
    description: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now, nullable=False)

    player_profile: Optional["PlayerProfile"] = Relationship(back_populates="highlights")
