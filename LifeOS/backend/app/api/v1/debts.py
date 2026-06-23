"""Debt management CRUD with payment tracking."""

from datetime import date
from typing import Optional
from uuid import UUID

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
)

router = APIRouter(prefix="/debts", tags=["Debts"])


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
    debt = Debt(**body.model_dump())
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
