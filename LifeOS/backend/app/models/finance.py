"""SQLAlchemy models for the Financial module."""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    JSON,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

import enum


# ──────────────── Enums ────────────────

class DebtType(str, enum.Enum):
    PERSONAL_LOAN = "personal_loan"
    HOME_LOAN = "home_loan"
    VEHICLE_LOAN = "vehicle_loan"
    EDUCATION_LOAN = "education_loan"
    BUSINESS_LOAN = "business_loan"
    BNPL = "bnpl"
    OTHER = "other"
    BORROWED = "borrowed"
    LENT = "lent"
    CREDIT_CARD = "credit_card"


class DebtStatus(str, enum.Enum):
    ACTIVE = "active"
    PAID_OFF = "paid_off"
    DEFAULTED = "defaulted"


class InvestmentType(str, enum.Enum):
    STOCKS = "stocks"
    MUTUAL_FUNDS = "mutual_funds"
    SIP = "sip"
    GOLD = "gold"
    FIXED_DEPOSIT = "fixed_deposit"
    REAL_ESTATE = "real_estate"
    CRYPTO = "crypto"
    BUSINESS = "business"
    OTHER = "other"


class IncomeCategory(str, enum.Enum):
    SALARY = "salary"
    FREELANCING = "freelancing"
    CONSULTING = "consulting"
    BUSINESS = "business"
    RENTAL_INCOME = "rental_income"
    DIVIDEND = "dividend"
    INTEREST = "interest"
    MUTUAL_FUND = "mutual_fund"
    STOCK_PROFIT = "stock_profit"
    YOUTUBE = "youtube"
    COURSE_SALES = "course_sales"
    AFFILIATE_MARKETING = "affiliate_marketing"
    ROYALTIES = "royalties"
    PENSION = "pension"
    CASHBACK = "cashback"
    REFUND = "refund"
    GIFT = "gift"
    INVESTMENTS = "investments"
    BONUS = "bonus"
    SIDE_INCOME = "side_income"
    OTHER = "other"


class IdeaStatus(str, enum.Enum):
    DRAFT = "draft"
    EXPLORING = "exploring"
    IN_PROGRESS = "in_progress"
    IMPLEMENTED = "implemented"
    ARCHIVED = "archived"


class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# ──────────────── Models ────────────────

class ExpenseCategory(Base):
    """Expense categories (Food, Travel, etc.)."""

    __tablename__ = "expense_categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[Optional[str]] = mapped_column(String(50))
    color: Mapped[Optional[str]] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    expenses: Mapped[list["Expense"]] = relationship(back_populates="category")


class Expense(Base):
    """Individual expense records."""

    __tablename__ = "expenses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("expense_categories.id", ondelete="SET NULL")
    )
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    recurrence_pattern: Mapped[Optional[str]] = mapped_column(String(50))
    receipt_url: Mapped[Optional[str]] = mapped_column(String(500))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    category: Mapped[Optional["ExpenseCategory"]] = relationship(
        back_populates="expenses"
    )
    tags: Mapped[list["Tag"]] = relationship(
        secondary="expense_tag_map", back_populates="expenses"
    )


class Income(Base):
    """Income records."""

    __tablename__ = "incomes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source: Mapped[str] = mapped_column(String(200), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    category: Mapped[IncomeCategory] = mapped_column(
        SAEnum(IncomeCategory), default=IncomeCategory.SALARY
    )
    income_type: Mapped[str] = mapped_column(String(20), default="Active")
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    month: Mapped[Optional[int]] = mapped_column(Integer)
    year: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Debt(Base):
    """Debt tracking (loans, credit cards, money lent/borrowed)."""

    __tablename__ = "debts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[DebtType] = mapped_column(SAEnum(DebtType), nullable=False)
    principal: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    interest_rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), default=Decimal("0.00")
    )
    current_balance: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    monthly_payment: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2))
    due_date: Mapped[Optional[date]] = mapped_column(Date)
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    lent_to: Mapped[Optional[str]] = mapped_column(String(200))
    borrowed_from: Mapped[Optional[str]] = mapped_column(String(200))
    contact_info: Mapped[Optional[str]] = mapped_column(String(200))
    status: Mapped[DebtStatus] = mapped_column(
        SAEnum(DebtStatus), default=DebtStatus.ACTIVE
    )
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    plan_canvas_data: Mapped[Optional[dict]] = mapped_column(JSON)

    # Relationships
    payments: Mapped[list["DebtPayment"]] = relationship(
        back_populates="debt", cascade="all, delete-orphan"
    )


class DebtPayment(Base):
    """Individual debt payment records."""

    __tablename__ = "debt_payments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    debt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("debts.id", ondelete="CASCADE"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    debt: Mapped["Debt"] = relationship(back_populates="payments")


class Investment(Base):
    """Investment portfolio items."""

    __tablename__ = "investments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[InvestmentType] = mapped_column(
        SAEnum(InvestmentType), nullable=False
    )
    invested_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    current_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    platform: Mapped[Optional[str]] = mapped_column(String(200))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    date_invested: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class FinancialGoal(Base):
    """Financial savings goals."""

    __tablename__ = "financial_goals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    target_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    current_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0.00")
    )
    deadline: Mapped[Optional[date]] = mapped_column(Date)
    icon: Mapped[Optional[str]] = mapped_column(String(50))
    color: Mapped[Optional[str]] = mapped_column(String(20))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class FinancialIdea(Base):
    """Business / investment / side hustle ideas vault."""

    __tablename__ = "financial_ideas"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    status: Mapped[IdeaStatus] = mapped_column(
        SAEnum(IdeaStatus), default=IdeaStatus.DRAFT
    )
    priority: Mapped[Priority] = mapped_column(
        SAEnum(Priority), default=Priority.MEDIUM
    )
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ──────────────── Tags (shared) ────────────────

class Tag(Base):
    """Universal tags usable across expenses, notes, ideas, etc."""

    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    color: Mapped[Optional[str]] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    expenses: Mapped[list["Expense"]] = relationship(
        secondary="expense_tag_map", back_populates="tags"
    )


class ExpenseTagMap(Base):
    """Join table for expenses ↔ tags many-to-many."""

    __tablename__ = "expense_tag_map"

    expense_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("expenses.id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    )
