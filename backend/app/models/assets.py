"""SQLAlchemy models for the Asset Planning & Creation System."""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
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
from app.models.finance import Priority

import enum


class AssetCategory(str, enum.Enum):
    FINANCIAL = "financial"
    BUSINESS = "business"
    PHYSICAL = "physical"
    PERSONAL = "personal"


class AssetStatus(str, enum.Enum):
    IDEA = "idea"
    RESEARCH = "research"
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    UNDER_DEVELOPMENT = "under_development"
    ACQUIRED = "acquired"
    ACTIVE = "active"
    GENERATING_INCOME = "generating_income"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Asset(Base):
    """Assets tracked in the Asset Planning System."""

    __tablename__ = "assets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[AssetCategory] = mapped_column(SAEnum(AssetCategory), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[AssetStatus] = mapped_column(
        SAEnum(AssetStatus), default=AssetStatus.IDEA
    )
    
    target_completion_date: Mapped[Optional[date]] = mapped_column(Date)
    
    expected_cost: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.00"))
    actual_invested: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.00"))
    
    expected_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.00"))
    
    expected_monthly_income: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.00"))
    actual_monthly_income: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.00"))
    
    priority: Mapped[Priority] = mapped_column(SAEnum(Priority), default=Priority.MEDIUM)
    
    # Optional link to a Project (for the Kanban Roadmap)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL")
    )
    
    # Optional scalability rating 1-10
    scalability: Mapped[int] = mapped_column(Integer, default=5)

    # Store infinite canvas nodes and edges as JSON
    roadmap_canvas_data: Mapped[Optional[dict]] = mapped_column(JSON)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class AssetIdea(Base):
    """Opportunity Vault for future assets."""

    __tablename__ = "asset_ideas"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    estimated_cost: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.00"))
    estimated_time_months: Mapped[int] = mapped_column(Integer, default=0)
    
    potential_roi_percent: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    
    risk_level: Mapped[RiskLevel] = mapped_column(SAEnum(RiskLevel), default=RiskLevel.MEDIUM)
    priority: Mapped[Priority] = mapped_column(SAEnum(Priority), default=Priority.MEDIUM)
    
    notes: Mapped[Optional[str]] = mapped_column(Text)
    research_links: Mapped[Optional[str]] = mapped_column(Text)  # Store JSON array or text

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
