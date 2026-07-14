"""Asset Planning CRUD endpoints."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.assets import Asset, AssetIdea, RiskLevel
from app.models.finance import Priority
from app.schemas.assets import (
    AssetCreate,
    AssetUpdate,
    AssetResponse,
    AssetIdeaCreate,
    AssetIdeaUpdate,
    AssetIdeaResponse,
    AssetDashboardResponse,
)

router = APIRouter(prefix="/assets", tags=["Asset Planning"])


def calculate_asset_score(idea: AssetIdea) -> int:
    """Calculate asset score (0-100) based on heuristics."""
    score = 50.0

    # Risk: Low (+10), Medium (0), High (-10)
    if idea.risk_level == RiskLevel.LOW:
        score += 10
    elif idea.risk_level == RiskLevel.HIGH:
        score -= 10

    # ROI: 0% -> 0, 100% -> +20, capped at +30
    roi_score = min(float(idea.potential_roi_percent) * 0.2, 30.0)
    score += roi_score

    # Priority: High (+10), Critical (+20)
    if idea.priority == Priority.HIGH:
        score += 10
    elif idea.priority == Priority.CRITICAL:
        score += 20
        
    # Time required: less time is better.
    if idea.estimated_time_months <= 1:
        score += 10
    elif idea.estimated_time_months > 12:
        score -= 10

    # Ensure bounds
    return int(max(0, min(100, score)))


# -----------------------------------------
# Dashboard
# -----------------------------------------
@router.get("/dashboard", response_model=AssetDashboardResponse)
async def get_asset_dashboard(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    assets_result = await db.execute(select(Asset))
    assets = assets_result.scalars().all()

    ideas_result = await db.execute(select(func.count()).select_from(AssetIdea))
    ideas_count = ideas_result.scalar() or 0

    total_value = sum(a.expected_value for a in assets if a.status in ["acquired", "active", "generating_income"])
    future_value = sum(a.expected_value for a in assets)
    total_income = sum(a.actual_monthly_income for a in assets)
    expected_income = sum(a.expected_monthly_income for a in assets)
    
    active_count = len([a for a in assets if a.status not in ["idea", "archived", "completed"]])

    return AssetDashboardResponse(
        total_assets_value=total_value,
        future_assets_value=future_value,
        total_monthly_income=total_income,
        expected_monthly_income=expected_income,
        active_assets_count=active_count,
        ideas_count=ideas_count,
    )


# -----------------------------------------
# Assets CRUD
# -----------------------------------------
@router.get("", response_model=list[AssetResponse])
async def list_assets(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Asset).order_by(Asset.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=AssetResponse, status_code=201)
async def create_asset(
    body: AssetCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    asset = Asset(**body.model_dump())
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    asset = await db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: UUID,
    body: AssetUpdate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    asset = await db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(asset, key, value)

    await db.commit()
    await db.refresh(asset)
    return asset


@router.delete("/{asset_id}", status_code=204)
async def delete_asset(
    asset_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    asset = await db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    await db.delete(asset)
    await db.commit()


# -----------------------------------------
# Asset Ideas CRUD
# -----------------------------------------
@router.get("/ideas", response_model=list[AssetIdeaResponse])
async def list_asset_ideas(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(select(AssetIdea).order_by(AssetIdea.created_at.desc()))
    ideas = result.scalars().all()
    
    response = []
    for idea in ideas:
        idea_dict = idea.__dict__.copy()
        idea_dict["asset_score"] = calculate_asset_score(idea)
        response.append(AssetIdeaResponse(**idea_dict))
        
    return response


@router.post("/ideas", response_model=AssetIdeaResponse, status_code=201)
async def create_asset_idea(
    body: AssetIdeaCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    idea = AssetIdea(**body.model_dump())
    db.add(idea)
    await db.commit()
    await db.refresh(idea)
    
    idea_dict = idea.__dict__.copy()
    idea_dict["asset_score"] = calculate_asset_score(idea)
    return AssetIdeaResponse(**idea_dict)


@router.put("/ideas/{idea_id}", response_model=AssetIdeaResponse)
async def update_asset_idea(
    idea_id: UUID,
    body: AssetIdeaUpdate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    idea = await db.get(AssetIdea, idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(idea, key, value)

    await db.commit()
    await db.refresh(idea)
    
    idea_dict = idea.__dict__.copy()
    idea_dict["asset_score"] = calculate_asset_score(idea)
    return AssetIdeaResponse(**idea_dict)


@router.delete("/ideas/{idea_id}", status_code=204)
async def delete_asset_idea(
    idea_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    idea = await db.get(AssetIdea, idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    await db.delete(idea)
    await db.commit()
