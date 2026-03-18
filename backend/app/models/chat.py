from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column, DateTime, Text, UniqueConstraint
from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Conversation(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("participant_one_id", "participant_two_id", name="uq_conversation_pair"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    participant_one_id: int = Field(foreign_key="user.id", nullable=False, index=True)
    participant_two_id: int = Field(foreign_key="user.id", nullable=False, index=True)
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )


class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", nullable=False, index=True)
    sender_user_id: int = Field(foreign_key="user.id", nullable=False, index=True)
    content: str = Field(sa_column=Column(Text, nullable=False))
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
