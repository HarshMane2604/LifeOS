"""Pydantic schemas for financial module."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ──────────────── Expense Category ────────────────

class ExpenseCategoryBase(BaseModel):
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None


class ExpenseCategoryCreate(ExpenseCategoryBase):
    pass


class ExpenseCategoryResponse(ExpenseCategoryBase):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────── Expense ────────────────

class ExpenseBase(BaseModel):
    amount: Decimal = Field(gt=0)
    description: Optional[str] = None
    date: date
    category_id: Optional[UUID] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    notes: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    tag_ids: Optional[list[UUID]] = None


class ExpenseUpdate(BaseModel):
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    date: Optional[date] = None
    category_id: Optional[UUID] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None
    notes: Optional[str] = None
    tag_ids: Optional[list[UUID]] = None


class ExpenseResponse(ExpenseBase):
    id: UUID
    receipt_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[ExpenseCategoryResponse] = None

    model_config = {"from_attributes": True}


# ──────────────── Income ────────────────

class IncomeBase(BaseModel):
    source: str
    amount: Decimal = Field(gt=0)
    date: date
    category: str = "salary"
    is_recurring: bool = False
    notes: Optional[str] = None


class IncomeCreate(IncomeBase):
    pass


class IncomeUpdate(BaseModel):
    source: Optional[str] = None
    amount: Optional[Decimal] = None
    date: Optional[date] = None
    category: Optional[str] = None
    is_recurring: Optional[bool] = None
    notes: Optional[str] = None


class IncomeResponse(IncomeBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ──────────────── Debt ────────────────

class DebtBase(BaseModel):
    name: str
    type: str
    principal: Decimal
    interest_rate: Decimal = Decimal("0.00")
    current_balance: Decimal
    monthly_payment: Optional[Decimal] = None
    due_date: Optional[date] = None
    lent_to: Optional[str] = None
    borrowed_from: Optional[str] = None
    notes: Optional[str] = None


class DebtCreate(DebtBase):
    pass


class DebtUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    principal: Optional[Decimal] = None
    interest_rate: Optional[Decimal] = None
    current_balance: Optional[Decimal] = None
    monthly_payment: Optional[Decimal] = None
    due_date: Optional[date] = None
    lent_to: Optional[str] = None
    borrowed_from: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class DebtResponse(DebtBase):
    id: UUID
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DebtPaymentCreate(BaseModel):
    amount: Decimal = Field(gt=0)
    date: date
    notes: Optional[str] = None


class DebtPaymentResponse(BaseModel):
    id: UUID
    debt_id: UUID
    amount: Decimal
    date: date
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────── Investment ────────────────

class InvestmentBase(BaseModel):
    name: str
    type: str
    invested_amount: Decimal
    current_value: Decimal
    platform: Optional[str] = None
    notes: Optional[str] = None
    date_invested: date


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    invested_amount: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    platform: Optional[str] = None
    notes: Optional[str] = None
    date_invested: Optional[date] = None


class InvestmentResponse(InvestmentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ──────────────── Financial Goal ────────────────

class FinancialGoalBase(BaseModel):
    name: str
    target_amount: Decimal
    current_amount: Decimal = Decimal("0.00")
    deadline: Optional[date] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    notes: Optional[str] = None


class FinancialGoalCreate(FinancialGoalBase):
    pass


class FinancialGoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[Decimal] = None
    current_amount: Optional[Decimal] = None
    deadline: Optional[date] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    notes: Optional[str] = None


class FinancialGoalResponse(FinancialGoalBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ──────────────── Financial Idea ────────────────

class FinancialIdeaBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    status: str = "draft"
    priority: str = "medium"
    notes: Optional[str] = None


class FinancialIdeaCreate(FinancialIdeaBase):
    pass


class FinancialIdeaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None


class FinancialIdeaResponse(FinancialIdeaBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ──────────────── Analytics ────────────────

class ExpenseAnalytics(BaseModel):
    total_today: Decimal = Decimal("0")
    total_this_week: Decimal = Decimal("0")
    total_this_month: Decimal = Decimal("0")
    total_this_year: Decimal = Decimal("0")
    by_category: list[dict] = []
    daily_trend: list[dict] = []


class IncomeAnalytics(BaseModel):
    total_this_month: Decimal = Decimal("0")
    total_this_year: Decimal = Decimal("0")
    by_source: list[dict] = []
    monthly_trend: list[dict] = []


class PortfolioSummary(BaseModel):
    total_invested: Decimal = Decimal("0")
    total_current_value: Decimal = Decimal("0")
    total_profit_loss: Decimal = Decimal("0")
    overall_roi: Decimal = Decimal("0")
    by_type: list[dict] = []
