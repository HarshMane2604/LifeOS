"""Expense CRUD and analytics endpoints."""

from datetime import date, timedelta
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, extract, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.finance import Expense, ExpenseCategory
from app.schemas.finance import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    ExpenseCategoryCreate,
    ExpenseCategoryResponse,
    ExpenseAnalytics,
)

router = APIRouter(prefix="/expenses", tags=["Expenses"])


# ──────────────── Categories ────────────────

@router.get("/categories", response_model=list[ExpenseCategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """List all expense categories."""
    result = await db.execute(
        select(ExpenseCategory).order_by(ExpenseCategory.name)
    )
    return result.scalars().all()


@router.post("/categories", response_model=ExpenseCategoryResponse, status_code=201)
async def create_category(
    body: ExpenseCategoryCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Create a new expense category."""
    cat = ExpenseCategory(**body.model_dump())
    db.add(cat)
    await db.flush()
    await db.refresh(cat)
    return cat


# ──────────────── Expenses CRUD ────────────────

@router.get("", response_model=list[ExpenseResponse])
async def list_expenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    category_id: Optional[UUID] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """List expenses with filtering, search, and pagination."""
    query = select(Expense).options(selectinload(Expense.category))

    if category_id:
        query = query.where(Expense.category_id == category_id)
    if date_from:
        query = query.where(Expense.date >= date_from)
    if date_to:
        query = query.where(Expense.date <= date_to)
    if search:
        query = query.where(Expense.description.ilike(f"%{search}%"))

    query = query.order_by(Expense.date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=ExpenseResponse, status_code=201)
async def create_expense(
    body: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Create a new expense."""
    data = body.model_dump(exclude={"tag_ids"})
    expense = Expense(**data)
    db.add(expense)
    await db.flush()
    await db.refresh(expense, ["category"])
    return expense


@router.get("/analytics", response_model=ExpenseAnalytics)
async def expense_analytics(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Get expense analytics (daily, weekly, monthly, yearly totals)."""
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    year_start = today.replace(month=1, day=1)

    # Total today
    r = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.date == today
        )
    )
    total_today = r.scalar()

    # Total this week
    r = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.date >= week_start
        )
    )
    total_week = r.scalar()

    # Total this month
    r = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.date >= month_start
        )
    )
    total_month = r.scalar()

    # Total this year
    r = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.date >= year_start
        )
    )
    total_year = r.scalar()

    # By category (this month)
    r = await db.execute(
        select(
            ExpenseCategory.name,
            ExpenseCategory.color,
            func.sum(Expense.amount).label("total"),
        )
        .join(ExpenseCategory, Expense.category_id == ExpenseCategory.id, isouter=True)
        .where(Expense.date >= month_start)
        .group_by(ExpenseCategory.name, ExpenseCategory.color)
        .order_by(func.sum(Expense.amount).desc())
    )
    by_category = [
        {"name": row[0] or "Uncategorized", "color": row[1] or "#6366f1", "total": float(row[2])}
        for row in r.all()
    ]

    # Daily trend (last 30 days)
    thirty_days_ago = today - timedelta(days=30)
    r = await db.execute(
        select(
            Expense.date,
            func.sum(Expense.amount).label("total"),
        )
        .where(Expense.date >= thirty_days_ago)
        .group_by(Expense.date)
        .order_by(Expense.date)
    )
    daily_trend = [
        {"date": str(row[0]), "total": float(row[1])} for row in r.all()
    ]

    return ExpenseAnalytics(
        total_today=total_today,
        total_this_week=total_week,
        total_this_month=total_month,
        total_this_year=total_year,
        by_category=by_category,
        daily_trend=daily_trend,
    )


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Get a single expense by ID."""
    result = await db.execute(
        select(Expense)
        .options(selectinload(Expense.category))
        .where(Expense.id == expense_id)
    )
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: UUID,
    body: ExpenseUpdate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Update an expense."""
    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = body.model_dump(exclude_unset=True, exclude={"tag_ids"})
    for key, value in update_data.items():
        setattr(expense, key, value)

    await db.flush()
    await db.refresh(expense, ["category"])
    return expense


@router.delete("/{expense_id}", status_code=204)
async def delete_expense(
    expense_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Delete an expense."""
    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    await db.delete(expense)
