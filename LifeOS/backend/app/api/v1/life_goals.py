"""Life Timeline (Life Goals) CRUD endpoints."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.goals import LifeGoal
from app.schemas.goals import (
    LifeGoalCreate,
    LifeGoalUpdate,
    LifeGoalResponse,
)

router = APIRouter(prefix="/life-goals", tags=["Life Timeline"])


@router.get("", response_model=list[LifeGoalResponse])
async def list_life_goals(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(LifeGoal).order_by(LifeGoal.order.asc(), LifeGoal.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=LifeGoalResponse, status_code=201)
async def create_life_goal(
    body: LifeGoalCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    goal = LifeGoal(**body.model_dump())
    db.add(goal)
    await db.flush()
    await db.refresh(goal)
    return goal


@router.get("/{goal_id}", response_model=LifeGoalResponse)
async def get_life_goal(
    goal_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(select(LifeGoal).where(LifeGoal.id == goal_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Life Goal not found")
    return goal


@router.put("/{goal_id}", response_model=LifeGoalResponse)
async def update_life_goal(
    goal_id: UUID,
    body: LifeGoalUpdate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(select(LifeGoal).where(LifeGoal.id == goal_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Life Goal not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(goal, key, value)
    await db.flush()
    await db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=204)
async def delete_life_goal(
    goal_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(select(LifeGoal).where(LifeGoal.id == goal_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Life Goal not found")
    await db.delete(goal)
