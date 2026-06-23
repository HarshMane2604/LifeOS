"""Financial Goals CRUD endpoints."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.finance import FinancialGoal
from app.schemas.finance import (
    FinancialGoalCreate,
    FinancialGoalUpdate,
    FinancialGoalResponse,
)

router = APIRouter(prefix="/financial-goals", tags=["Financial Goals"])


@router.get("", response_model=list[FinancialGoalResponse])
async def list_goals(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(FinancialGoal).order_by(FinancialGoal.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=FinancialGoalResponse, status_code=201)
async def create_goal(
    body: FinancialGoalCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    goal = FinancialGoal(**body.model_dump())
    db.add(goal)
    await db.flush()
    await db.refresh(goal)
    return goal


@router.get("/{goal_id}", response_model=FinancialGoalResponse)
async def get_goal(
    goal_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(FinancialGoal).where(FinancialGoal.id == goal_id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.put("/{goal_id}", response_model=FinancialGoalResponse)
async def update_goal(
    goal_id: UUID,
    body: FinancialGoalUpdate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(FinancialGoal).where(FinancialGoal.id == goal_id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(goal, key, value)
    await db.flush()
    await db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=204)
async def delete_goal(
    goal_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(FinancialGoal).where(FinancialGoal.id == goal_id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    await db.delete(goal)
