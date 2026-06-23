"""Pydantic schemas for the dashboard aggregation."""

from decimal import Decimal
from pydantic import BaseModel


class DashboardData(BaseModel):
    """Aggregated dashboard response."""

    # Financial snapshot
    net_worth: Decimal = Decimal("0")
    total_assets: Decimal = Decimal("0")
    total_liabilities: Decimal = Decimal("0")
    monthly_income: Decimal = Decimal("0")
    monthly_expenses: Decimal = Decimal("0")
    monthly_savings: Decimal = Decimal("0")
    savings_rate: Decimal = Decimal("0")

    # Counts
    active_goals_count: int = 0
    active_projects_count: int = 0
    pending_tasks_count: int = 0
    total_dreams: int = 0

    # Financial health (0-100)
    financial_health_score: int = 50

    # Recent data
    expense_trend: list[dict] = []
    income_vs_expense: list[dict] = []
    top_expenses: list[dict] = []
    goal_progress: list[dict] = []
    upcoming_tasks: list[dict] = []
    recent_journal: list[dict] = []
