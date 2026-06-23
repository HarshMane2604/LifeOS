"""Pydantic schemas for the Asset Planning System."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.assets import AssetCategory, AssetStatus, RiskLevel
from app.models.finance import Priority


# -----------------------------------------
# Asset Schemas
# -----------------------------------------
class AssetBase(BaseModel):
    name: str
    category: AssetCategory
    description: Optional[str] = None
    status: AssetStatus = AssetStatus.IDEA
    target_completion_date: Optional[date] = None
    expected_cost: Decimal = Field(default=Decimal("0.00"), max_digits=14, decimal_places=2)
    actual_invested: Decimal = Field(default=Decimal("0.00"), max_digits=14, decimal_places=2)
    expected_value: Decimal = Field(default=Decimal("0.00"), max_digits=14, decimal_places=2)
    expected_monthly_income: Decimal = Field(default=Decimal("0.00"), max_digits=14, decimal_places=2)
    actual_monthly_income: Decimal = Field(default=Decimal("0.00"), max_digits=14, decimal_places=2)
    priority: Priority = Priority.MEDIUM
    project_id: Optional[UUID] = None
    scalability: int = Field(default=5, ge=1, le=10)
    roadmap_canvas_data: Optional[Dict[str, Any]] = None


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[AssetCategory] = None
    description: Optional[str] = None
    status: Optional[AssetStatus] = None
    target_completion_date: Optional[date] = None
    expected_cost: Optional[Decimal] = None
    actual_invested: Optional[Decimal] = None
    expected_value: Optional[Decimal] = None
    expected_monthly_income: Optional[Decimal] = None
    actual_monthly_income: Optional[Decimal] = None
    priority: Optional[Priority] = None
    project_id: Optional[UUID] = None
    scalability: Optional[int] = None
    roadmap_canvas_data: Optional[Dict[str, Any]] = None


class AssetResponse(AssetBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# -----------------------------------------
# Asset Idea (Opportunity Vault) Schemas
# -----------------------------------------
class AssetIdeaBase(BaseModel):
    title: str
    estimated_cost: Decimal = Field(default=Decimal("0.00"), max_digits=14, decimal_places=2)
    estimated_time_months: int = Field(default=0)
    potential_roi_percent: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2)
    risk_level: RiskLevel = RiskLevel.MEDIUM
    priority: Priority = Priority.MEDIUM
    notes: Optional[str] = None
    research_links: Optional[str] = None


class AssetIdeaCreate(AssetIdeaBase):
    pass


class AssetIdeaUpdate(BaseModel):
    title: Optional[str] = None
    estimated_cost: Optional[Decimal] = None
    estimated_time_months: Optional[int] = None
    potential_roi_percent: Optional[Decimal] = None
    risk_level: Optional[RiskLevel] = None
    priority: Optional[Priority] = None
    notes: Optional[str] = None
    research_links: Optional[str] = None


class AssetIdeaResponse(AssetIdeaBase):
    id: UUID
    asset_score: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# -----------------------------------------
# Dashboard Response
# -----------------------------------------
class AssetDashboardResponse(BaseModel):
    total_assets_value: Decimal
    future_assets_value: Decimal
    total_monthly_income: Decimal
    expected_monthly_income: Decimal
    active_assets_count: int
    ideas_count: int
