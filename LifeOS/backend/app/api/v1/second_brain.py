"""API Router for Second Brain (Notes)."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.goals import Note
from app.schemas.second_brain import NoteCreate, NoteResponse, NoteUpdate

router = APIRouter(prefix="/notes", tags=["Second Brain"])


@router.get("/", response_model=list[NoteResponse])
async def read_notes(
    skip: int = 0,
    limit: int = 100,
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Retrieve all notes."""
    query = select(Note)
    if category:
        query = query.where(Note.category == category)
    query = query.order_by(Note.updated_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_in: NoteCreate,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new note."""
    note = Note(**note_in.model_dump())
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.get("/{note_id}", response_model=NoteResponse)
async def read_note(
    note_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get a specific note by ID."""
    query = select(Note).where(Note.id == note_id)
    result = await db.execute(query)
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: UUID,
    note_in: NoteUpdate,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update a note."""
    query = select(Note).where(Note.id == note_id)
    result = await db.execute(query)
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    update_data = note_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)

    await db.commit()
    await db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a note."""
    query = select(Note).where(Note.id == note_id)
    result = await db.execute(query)
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    await db.delete(note)
    await db.commit()
