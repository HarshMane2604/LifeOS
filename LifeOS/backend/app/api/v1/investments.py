"""Investment portfolio CRUD and analytics."""

from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.finance import Investment
from app.schemas.finance import (
    InvestmentCreate,
    InvestmentUpdate,
    InvestmentResponse,
    PortfolioSummary,
)

router = APIRouter(prefix="/investments", tags=["Investments"])


@router.get("", response_model=list[InvestmentResponse])
async def list_investments(
    type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """List all investments with optional type filter."""
    query = select(Investment)
    if type:
        query = query.where(Investment.type == type)
    query = query.order_by(Investment.current_value.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=InvestmentResponse, status_code=201)
async def create_investment(
    body: InvestmentCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Add a new investment."""
    inv = Investment(**body.model_dump())
    db.add(inv)
    await db.flush()
    await db.refresh(inv)
    return inv


@router.get("/portfolio", response_model=PortfolioSummary)
async def portfolio_summary(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Get aggregate portfolio metrics."""
    r = await db.execute(
        select(
            func.coalesce(func.sum(Investment.invested_amount), 0),
            func.coalesce(func.sum(Investment.current_value), 0),
        )
    )
    row = r.one()
    total_invested = row[0]
    total_current = row[1]
    profit_loss = total_current - total_invested
    roi = (profit_loss / total_invested * 100) if total_invested else Decimal("0")

    # By type breakdown
    r = await db.execute(
        select(
            Investment.type,
            func.sum(Investment.invested_amount).label("invested"),
            func.sum(Investment.current_value).label("current"),
        )
        .group_by(Investment.type)
        .order_by(func.sum(Investment.current_value).desc())
    )
    by_type = [
        {
            "type": str(row[0]),
            "invested": float(row[1]),
            "current": float(row[2]),
            "profit_loss": float(row[2] - row[1]),
            "allocation_pct": float(row[2] / total_current * 100) if total_current else 0,
        }
        for row in r.all()
    ]

    return PortfolioSummary(
        total_invested=total_invested,
        total_current_value=total_current,
        total_profit_loss=profit_loss,
        overall_roi=roi,
        by_type=by_type,
    )


@router.get("/{investment_id}", response_model=InvestmentResponse)
async def get_investment(
    investment_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Get a single investment."""
    result = await db.execute(
        select(Investment).where(Investment.id == investment_id)
    )
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Investment not found")
    return inv


@router.put("/{investment_id}", response_model=InvestmentResponse)
async def update_investment(
    investment_id: UUID,
    body: InvestmentUpdate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Update an investment."""
    result = await db.execute(
        select(Investment).where(Investment.id == investment_id)
    )
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Investment not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(inv, key, value)
    await db.flush()
    await db.refresh(inv)
    return inv


@router.delete("/{investment_id}", status_code=204)
async def delete_investment(
    investment_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Delete an investment."""
    result = await db.execute(
        select(Investment).where(Investment.id == investment_id)
    )
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Investment not found")
    await db.delete(inv)
