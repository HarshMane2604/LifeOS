"""Debt management CRUD with payment tracking."""

from datetime import date
from typing import Optional
from uuid import UUID
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.finance import Debt, DebtPayment
from app.schemas.finance import (
    DebtCreate,
    DebtUpdate,
    DebtResponse,
    DebtPaymentCreate,
    DebtPaymentResponse,
    DebtAnalyticsResponse,
    DebtStrategyResponse,
    EMICalendarResponse,
)

router = APIRouter(prefix="/debts", tags=["Debts"])

@router.get("/analytics", response_model=DebtAnalyticsResponse)
async def get_debt_analytics(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Get advanced debt analytics for the dashboard."""
    query = select(Debt).where(Debt.status == "active").where(~Debt.type.in_(["lent"]))
    result = await db.execute(query)
    active_debts = result.scalars().all()

    total_debt = sum(d.current_balance for d in active_debts)
    total_principal = sum(d.principal for d in active_debts)
    monthly_emi = sum(d.monthly_payment or 0 for d in active_debts)
    
    # Rough estimate of remaining interest (assuming average remaining term of 36 months)
    total_interest_remaining = sum((d.current_balance * (d.interest_rate/100) / 12) * 36 for d in active_debts)

    progress = 0.0
    if total_principal > 0:
        progress = float((total_principal - total_debt) / total_principal) * 100

    # Breakdown
    type_map = {}
    for d in active_debts:
        type_map[d.type.value] = type_map.get(d.type.value, 0) + float(d.current_balance)
    breakdown = [{"name": k.replace("_", " ").title(), "value": v} for k, v in type_map.items()]

    return DebtAnalyticsResponse(
        total_debt=total_debt,
        monthly_emi=monthly_emi,
        total_interest_remaining=total_interest_remaining,
        active_debts_count=len(active_debts),
        debt_free_progress=progress,
        debt_to_income_ratio=0.0, # Will be calculated by frontend combining income
        health_score=85, # Default mock, frontend or AI can enrich
        breakdown_by_type=breakdown,
        reduction_trend=[] # Can be populated with historical balance data later
    )


@router.get("/strategy", response_model=DebtStrategyResponse)
async def get_debt_strategy(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Returns sorted debts based on Snowball and Avalanche methods."""
    query = select(Debt).where(Debt.status == "active").where(~Debt.type.in_(["lent"]))
    result = await db.execute(query)
    debts = result.scalars().all()

    # Snowball: Smallest balance first
    snowball = sorted(debts, key=lambda d: d.current_balance)
    
    # Avalanche: Highest interest rate first
    avalanche = sorted(debts, key=lambda d: d.interest_rate, reverse=True)

    return DebtStrategyResponse(
        snowball=[{"id": str(d.id), "name": d.name, "balance": float(d.current_balance), "rate": float(d.interest_rate)} for d in snowball],
        avalanche=[{"id": str(d.id), "name": d.name, "balance": float(d.current_balance), "rate": float(d.interest_rate)} for d in avalanche]
    )

@router.get("/calendar", response_model=EMICalendarResponse)
async def get_emi_calendar(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Calendar view of upcoming and overdue EMIs."""
    query = select(Debt).where(Debt.status == "active").where(Debt.due_date.isnot(None))
    result = await db.execute(query)
    debts = result.scalars().all()

    today = date.today()
    calendar = []
    for d in debts:
        if d.due_date:
            # Normalize to this month for upcoming
            this_month_due = d.due_date.replace(year=today.year, month=today.month)
            status = "upcoming"
            if this_month_due < today:
                status = "overdue"
            # Could check DebtPayment to see if paid this month
            
            calendar.append({
                "date": str(this_month_due),
                "title": f"EMI: {d.name}",
                "amount": float(d.monthly_payment or 0),
                "status": status,
                "debt_id": str(d.id)
            })

    return EMICalendarResponse(calendar=calendar)



@router.get("", response_model=list[DebtResponse])
async def list_debts(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """List all debts with optional status filter."""
    query = select(Debt)
    if status:
        query = query.where(Debt.status == status)
    query = query.order_by(Debt.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=DebtResponse, status_code=201)
async def create_debt(
    body: DebtCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Create a new debt record."""
    data = body.model_dump()
    tenure_months = data.pop("tenure_months", None)
    
    principal = float(data.get("principal", 0))
    interest_rate = float(data.get("interest_rate", 0))
    
    # 1. Calculate EMI if not provided but tenure is given
    if not data.get("monthly_payment") and tenure_months:
        if interest_rate > 0:
            r = interest_rate / 100 / 12
            emi = principal * r * ((1 + r) ** tenure_months) / (((1 + r) ** tenure_months) - 1)
            data["monthly_payment"] = Decimal(str(round(emi, 2)))
        else:
            data["monthly_payment"] = Decimal(str(round(principal / tenure_months, 2)))
            
    # 2. Calculate Current Balance if not provided
    if data.get("current_balance") is None:
        start_date = data.get("start_date")
        if start_date:
            today = date.today()
            # Calculate months passed
            months_passed = (today.year - start_date.year) * 12 + today.month - start_date.month
            if months_passed < 0:
                months_passed = 0
            
            emi = float(data.get("monthly_payment") or 0)
            
            if months_passed == 0:
                data["current_balance"] = Decimal(str(principal))
            else:
                if interest_rate > 0 and emi > 0:
                    r = interest_rate / 100 / 12
                    # Remaining balance formula: P(1+r)^p - E[((1+r)^p - 1)/r]
                    balance = principal * ((1 + r) ** months_passed) - emi * (((1 + r) ** months_passed) - 1) / r
                    if balance < 0:
                        balance = 0
                    data["current_balance"] = Decimal(str(round(balance, 2)))
                else:
                    balance = principal - (emi * months_passed)
                    if balance < 0:
                        balance = 0
                    data["current_balance"] = Decimal(str(round(balance, 2)))
        else:
            # If no start date, default to principal
            data["current_balance"] = Decimal(str(principal))

    debt = Debt(**data)
    db.add(debt)
    await db.flush()
    await db.refresh(debt)
    return debt


@router.get("/{debt_id}", response_model=DebtResponse)
async def get_debt(
    debt_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Get a single debt."""
    result = await db.execute(select(Debt).where(Debt.id == debt_id))
    debt = result.scalar_one_or_none()
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    return debt


@router.put("/{debt_id}", response_model=DebtResponse)
async def update_debt(
    debt_id: UUID,
    body: DebtUpdate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Update a debt record."""
    result = await db.execute(select(Debt).where(Debt.id == debt_id))
    debt = result.scalar_one_or_none()
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(debt, key, value)
    await db.flush()
    await db.refresh(debt)
    return debt


@router.delete("/{debt_id}", status_code=204)
async def delete_debt(
    debt_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Delete a debt."""
    result = await db.execute(select(Debt).where(Debt.id == debt_id))
    debt = result.scalar_one_or_none()
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    await db.delete(debt)


# ──────────────── Payments ────────────────

@router.get("/{debt_id}/payments", response_model=list[DebtPaymentResponse])
async def list_payments(
    debt_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """List all payments for a debt."""
    result = await db.execute(
        select(DebtPayment)
        .where(DebtPayment.debt_id == debt_id)
        .order_by(DebtPayment.date.desc())
    )
    return result.scalars().all()


@router.post("/{debt_id}/payments", response_model=DebtPaymentResponse, status_code=201)
async def create_payment(
    debt_id: UUID,
    body: DebtPaymentCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Record a debt payment and update the debt balance."""
    # Verify debt exists
    result = await db.execute(select(Debt).where(Debt.id == debt_id))
    debt = result.scalar_one_or_none()
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")

    # Create payment
    payment = DebtPayment(debt_id=debt_id, **body.model_dump())
    db.add(payment)

    # Update balance
    debt.current_balance = max(debt.current_balance - body.amount, 0)
    if debt.current_balance == 0:
        debt.status = "paid_off"

    await db.flush()
    await db.refresh(payment)
    return payment
