"""Pydantic schemas for Dream Warehouse."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.finance import Priority


# ──────────────── Dream Images ────────────────

class DreamImageBase(BaseModel):
    image_url: str
    caption: Optional[str] = None
    order: int = 0


class DreamImageCreate(DreamImageBase):
    pass


class DreamImageResponse(DreamImageBase):
    id: UUID
    dream_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────── Dreams ────────────────

class DreamBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    estimated_cost: Optional[Decimal] = None
    priority: Priority = Priority.MEDIUM
    target_date: Optional[date] = None
    progress: int = Field(default=0, ge=0, le=100)
    notes: Optional[str] = None


class DreamCreate(DreamBase):
    pass


class DreamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    estimated_cost: Optional[Decimal] = None
    priority: Optional[Priority] = None
    target_date: Optional[date] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    notes: Optional[str] = None


class DreamResponse(DreamBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    images: list[DreamImageResponse] = []

    model_config = {"from_attributes": True}
