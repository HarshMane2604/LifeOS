"""Pydantic schemas for Second Brain (Notes)."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None
    category: Optional[str] = None
    is_favorite: bool = False


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    is_favorite: Optional[bool] = None


class NoteResponse(NoteBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
