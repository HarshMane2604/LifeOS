"""Pydantic schemas for Journal."""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.goals import Mood


class JournalEntryBase(BaseModel):
    date: date
    thoughts: Optional[str] = None
    wins: Optional[str] = None
    lessons: Optional[str] = None
    failures: Optional[str] = None
    gratitude: Optional[str] = None
    mood: Optional[Mood] = None
    energy_level: Optional[int] = Field(None, ge=1, le=10)


class JournalEntryCreate(JournalEntryBase):
    pass


class JournalEntryUpdate(BaseModel):
    date: Optional[date] = None
    thoughts: Optional[str] = None
    wins: Optional[str] = None
    lessons: Optional[str] = None
    failures: Optional[str] = None
    gratitude: Optional[str] = None
    mood: Optional[Mood] = None
    energy_level: Optional[int] = Field(None, ge=1, le=10)


class JournalEntryResponse(JournalEntryBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
