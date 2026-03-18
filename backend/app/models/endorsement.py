from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.player import PlayerProfile
    from app.models.user import User


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Endorsement(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("player_profile_id", "user_id", name="uq_player_endorsement"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    player_profile_id: int = Field(foreign_key="playerprofile.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=utc_now, nullable=False)

    player_profile: Optional["PlayerProfile"] = Relationship(back_populates="endorsements")
    user: Optional["User"] = Relationship(back_populates="endorsements")
