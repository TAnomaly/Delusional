"""Pydantic schemas for request/response validation."""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# --- Standardized Response ---
class APIResponse(BaseModel):
    data: Optional[dict | list] = None
    error: Optional[str] = None


# --- Auth ---
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    streak_days: int
    daily_usage_minutes: int
    theme: str = "light"
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=1000)
    avatar_url: Optional[str] = Field(None, max_length=500)
    theme: Optional[str] = Field(None, pattern="^(light|dark)$")


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Posts ---
class PostCreate(BaseModel):
    title: Optional[str] = Field(None, max_length=300)
    content: str = Field(..., min_length=1, max_length=10000)
    content_type: str = Field(default="note", pattern="^(note|tool|workflow|resource|learning)$")
    tags: list[str] = Field(default_factory=list, max_length=10)
    url: Optional[str] = Field(None, max_length=2000)
    duration_minutes: int = Field(default=0, ge=0)


class PostOut(BaseModel):
    id: uuid.UUID
    author_id: uuid.UUID
    title: Optional[str] = None
    content: str
    content_type: str
    tags: list[str]
    url: Optional[str] = None
    duration_minutes: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Focus Session ---
class FocusSessionCreate(BaseModel):
    task_description: str = Field(..., min_length=1, max_length=500)
    duration_minutes: int = Field(default=25, ge=1, le=120)


class FocusSessionEnd(BaseModel):
    completed: bool = True


class FocusSessionOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    task_description: str
    duration_minutes: int
    completed: bool
    started_at: datetime
    ended_at: Optional[datetime]

    class Config:
        from_attributes = True


# --- Analytics ---
class WeeklyAnalyticsOut(BaseModel):
    id: uuid.UUID
    week_start: datetime
    total_focus_minutes: int
    total_posts: int
    streak_days: int
    top_tags: dict
    ai_summary: Optional[str]
    ai_suggestions: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Kanban ---
class CardCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    content: Optional[str] = Field(None, max_length=5000)
    tags: list[str] = Field(default_factory=list)
    color: Optional[str] = None
    due_date: Optional[datetime] = None


class CardUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=300)
    content: Optional[str] = Field(None, max_length=5000)
    tags: Optional[list[str]] = None
    color: Optional[str] = None
    column_id: Optional[uuid.UUID] = None
    position: Optional[int] = None
    is_completed: Optional[bool] = None
    due_date: Optional[datetime] = None


class CardOut(BaseModel):
    id: uuid.UUID
    column_id: uuid.UUID
    title: str
    content: Optional[str] = None
    tags: Optional[list[str]] = None
    color: Optional[str] = None
    position: int
    due_date: Optional[datetime] = None
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ColumnCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)


class ColumnOut(BaseModel):
    id: uuid.UUID
    board_id: uuid.UUID
    title: str
    position: int
    cards: list[CardOut] = []

    class Config:
        from_attributes = True


class BoardCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    color: Optional[str] = None


class BoardOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str] = None
    color: Optional[str] = None
    is_archived: bool
    columns: list[ColumnOut] = []
    created_at: datetime

    class Config:
        from_attributes = True


class BoardListOut(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    color: Optional[str] = None
    is_archived: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Collections ---
class CollectionItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=2000)
    url: Optional[str] = Field(None, max_length=2000)
    resource_type: str = Field(default="tool", pattern="^(tool|app|workflow|article|note)$")
    tags: list[str] = Field(default_factory=list)


class CollectionItemOut(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    resource_type: str
    tags: Optional[list[str]] = None
    position: int
    created_at: datetime

    class Config:
        from_attributes = True


class CollectionCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    is_public: bool = True


class CollectionOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str] = None
    is_public: bool
    items: list[CollectionItemOut] = []
    created_at: datetime

    class Config:
        from_attributes = True
