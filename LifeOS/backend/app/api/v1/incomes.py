"""Income CRUD and analytics endpoints."""

from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.finance import Income
from app.schemas.finance import (
    IncomeCreate,
    IncomeUpdate,
    IncomeResponse,
    IncomeAnalytics,
)

router = APIRouter(prefix="/incomes", tags=["Income"])


@router.get("", response_model=list[IncomeResponse])
async def list_incomes(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    category: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """List incomes with optional filters."""
    query = select(Income)
    if category:
        query = query.where(Income.category == category)
    if date_from:
        query = query.where(Income.date >= date_from)
    if date_to:
        query = query.where(Income.date <= date_to)
    query = query.order_by(Income.date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=IncomeResponse, status_code=201)
async def create_income(
    body: IncomeCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Create a new income record."""
    income = Income(**body.model_dump())
    db.add(income)
    await db.flush()
    await db.refresh(income)
    return income


@router.get("/analytics", response_model=IncomeAnalytics)
async def income_analytics(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Get income analytics."""
    today = date.today()
    month_start = today.replace(day=1)
    year_start = today.replace(month=1, day=1)

    # Total this month
    r = await db.execute(
        select(func.coalesce(func.sum(Income.amount), 0)).where(
            Income.date >= month_start
        )
    )
    total_month = r.scalar()

    # Total this year
    r = await db.execute(
        select(func.coalesce(func.sum(Income.amount), 0)).where(
            Income.date >= year_start
        )
    )
    total_year = r.scalar()

    # By source category
    r = await db.execute(
        select(
            Income.category,
            func.sum(Income.amount).label("total"),
        )
        .where(Income.date >= year_start)
        .group_by(Income.category)
        .order_by(func.sum(Income.amount).desc())
    )
    by_source = [
        {"name": str(row[0]), "total": float(row[1])} for row in r.all()
    ]

    # Monthly trend (last 12 months)
    r = await db.execute(
        select(
            extract("year", Income.date).label("year"),
            extract("month", Income.date).label("month"),
            func.sum(Income.amount).label("total"),
        )
        .group_by("year", "month")
        .order_by("year", "month")
        .limit(12)
    )
    monthly_trend = [
        {"year": int(row[0]), "month": int(row[1]), "total": float(row[2])}
        for row in r.all()
    ]

    return IncomeAnalytics(
        total_this_month=total_month,
        total_this_year=total_year,
        by_source=by_source,
        monthly_trend=monthly_trend,
    )


@router.get("/{income_id}", response_model=IncomeResponse)
async def get_income(
    income_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Get a single income by ID."""
    result = await db.execute(select(Income).where(Income.id == income_id))
    income = result.scalar_one_or_none()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    return income


@router.put("/{income_id}", response_model=IncomeResponse)
async def update_income(
    income_id: UUID,
    body: IncomeUpdate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Update an income record."""
    result = await db.execute(select(Income).where(Income.id == income_id))
    income = result.scalar_one_or_none()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(income, key, value)
    await db.flush()
    await db.refresh(income)
    return income


@router.delete("/{income_id}", status_code=204)
async def delete_income(
    income_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Delete an income record."""
    result = await db.execute(select(Income).where(Income.id == income_id))
    income = result.scalar_one_or_none()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    await db.delete(income)
