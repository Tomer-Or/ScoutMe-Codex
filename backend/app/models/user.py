from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING, Optional

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.comment import Comment
    from app.models.endorsement import Endorsement
    from app.models.player import PlayerProfile


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserRole(str, Enum):
    player = "player"
    scout = "scout"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: EmailStr = Field(index=True, unique=True)
    password_hash: str
    role: UserRole
    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)

    player_profile: Optional["PlayerProfile"] = Relationship(back_populates="user")
    comments: list["Comment"] = Relationship(back_populates="author")
    endorsements: list["Endorsement"] = Relationship(back_populates="user")
