from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import Column, DateTime, Text
from sqlmodel import Field, SQLModel


class PostType(str, Enum):
    player_update = "player_update"
    club_announcement = "club_announcement"


class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", nullable=False, index=True)
    player_profile_id: Optional[int] = Field(default=None, foreign_key="playerprofile.id")
    highlight_video_id: Optional[int] = Field(default=None, foreign_key="highlightvideo.id")
    title: str
    content: str = Field(sa_column=Column(Text, nullable=False))
    post_type: PostType = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
