"""Journal CRUD endpoints."""

from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.goals import JournalEntry
from app.schemas.journal import (
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryResponse,
)

router = APIRouter(prefix="/journal", tags=["Journal"])


@router.get("", response_model=list[JournalEntryResponse])
async def list_journal_entries(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(JournalEntry).order_by(JournalEntry.date.desc())
    )
    return result.scalars().all()


@router.post("", response_model=JournalEntryResponse, status_code=201)
async def create_journal_entry(
    body: JournalEntryCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    # Ensure only one entry per date
    existing = await db.execute(
        select(JournalEntry).where(JournalEntry.date == body.date)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Journal entry already exists for this date.")

    entry = JournalEntry(**body.model_dump())
    db.add(entry)
    await db.flush()
    await db.refresh(entry)
    return entry


@router.get("/{entry_id_or_date}", response_model=JournalEntryResponse)
async def get_journal_entry(
    entry_id_or_date: str,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    # Check if it's a date or UUID
    try:
        # Try parsing as UUID
        entry_id = UUID(entry_id_or_date)
        query = select(JournalEntry).where(JournalEntry.id == entry_id)
    except ValueError:
        # Try parsing as date
        try:
            target_date = date.fromisoformat(entry_id_or_date)
            query = select(JournalEntry).where(JournalEntry.date == target_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid ID or date format.")

    result = await db.execute(query)
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry


@router.put("/{entry_id}", response_model=JournalEntryResponse)
async def update_journal_entry(
    entry_id: UUID,
    body: JournalEntryUpdate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(select(JournalEntry).where(JournalEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(entry, key, value)
    await db.flush()
    await db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
async def delete_journal_entry(
    entry_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(select(JournalEntry).where(JournalEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    await db.delete(entry)
