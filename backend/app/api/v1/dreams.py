"""Dream Warehouse CRUD endpoints."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.goals import Dream
from app.schemas.dreams import (
    DreamCreate,
    DreamUpdate,
    DreamResponse,
)

router = APIRouter(prefix="/dreams", tags=["Dreams"])


@router.get("", response_model=list[DreamResponse])
async def list_dreams(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Dream).options(selectinload(Dream.images)).order_by(Dream.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=DreamResponse, status_code=201)
async def create_dream(
    body: DreamCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    dream = Dream(**body.model_dump())
    db.add(dream)
    await db.flush()
    await db.refresh(dream)
    return dream


@router.get("/{dream_id}", response_model=DreamResponse)
async def get_dream(
    dream_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Dream).options(selectinload(Dream.images)).where(Dream.id == dream_id)
    )
    dream = result.scalar_one_or_none()
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    return dream


@router.put("/{dream_id}", response_model=DreamResponse)
async def update_dream(
    dream_id: UUID,
    body: DreamUpdate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Dream).options(selectinload(Dream.images)).where(Dream.id == dream_id)
    )
    dream = result.scalar_one_or_none()
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(dream, key, value)
    await db.flush()
    await db.refresh(dream)
    return dream


@router.delete("/{dream_id}", status_code=204)
async def delete_dream(
    dream_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Dream).where(Dream.id == dream_id))
    dream = result.scalar_one_or_none()
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    await db.delete(dream)
