from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ConversationRead(BaseModel):
    id: int
    other_user_id: int
    other_user_name: str
    other_user_role: str
    other_user_avatar_url: Optional[str] = None
    other_user_position: Optional[str] = None
    other_user_location: Optional[str] = None
    last_message: str
    last_message_at: datetime


class ChatSearchResultRead(BaseModel):
    user_id: int
    name: str
    role: str
    avatar_url: Optional[str] = None
    position: Optional[str] = None
    location: Optional[str] = None


class ConversationCreate(BaseModel):
    target_user_id: int


class MessageCreate(BaseModel):
    content: str


class MessageRead(BaseModel):
    id: int
    sender_user_id: int
    sender_name: str
    sender_role: str
    sender_avatar_url: Optional[str] = None
    content: str
    created_at: datetime


class ConversationDetailRead(BaseModel):
    id: int
    other_user_id: int
    other_user_name: str
    other_user_role: str
    other_user_avatar_url: Optional[str] = None
    other_user_position: Optional[str] = None
    other_user_location: Optional[str] = None
    messages: list[MessageRead]
