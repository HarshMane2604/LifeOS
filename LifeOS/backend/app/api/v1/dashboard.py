"""Dashboard aggregation endpoint."""

from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.finance import (
    Expense,
    ExpenseCategory,
    Income,
    Investment,
    Debt,
    FinancialGoal,
)
from app.models.goals import Project, Task, Dream, JournalEntry, LifeGoal
from app.schemas.dashboard import DashboardData

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardData)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Aggregate all key metrics into a single dashboard response."""
    today = date.today()
    month_start = today.replace(day=1)

    # ── Monthly Income ──
    r = await db.execute(
        select(func.coalesce(func.sum(Income.amount), 0)).where(
            Income.date >= month_start
        )
    )
    monthly_income = r.scalar()

    # ── Monthly Expenses ──
    r = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.date >= month_start
        )
    )
    monthly_expenses = r.scalar()

    monthly_savings = monthly_income - monthly_expenses
    savings_rate = (
        (monthly_savings / monthly_income * 100) if monthly_income > 0 else Decimal("0")
    )

    # ── Investments (assets) ──
    r = await db.execute(
        select(func.coalesce(func.sum(Investment.current_value), 0))
    )
    total_investments = r.scalar()

    # ── Financial Goals (cash savings) ──
    r = await db.execute(
        select(func.coalesce(func.sum(FinancialGoal.current_amount), 0))
    )
    total_savings = r.scalar()

    total_assets = total_investments + total_savings

    # ── Debts (liabilities) ──
    r = await db.execute(
        select(func.coalesce(func.sum(Debt.current_balance), 0)).where(
            Debt.status == "active"
        )
    )
    total_liabilities = r.scalar()

    net_worth = total_assets - total_liabilities

    # ── Counts ──
    r = await db.execute(select(func.count(FinancialGoal.id)))
    active_goals_count = r.scalar() or 0

    r = await db.execute(
        select(func.count(Project.id)).where(
            Project.status.in_(["backlog", "planning", "in_progress"])
        )
    )
    active_projects_count = r.scalar() or 0

    r = await db.execute(
        select(func.count(Task.id)).where(Task.status.in_(["todo", "in_progress"]))
    )
    pending_tasks_count = r.scalar() or 0

    r = await db.execute(select(func.count(Dream.id)))
    total_dreams = r.scalar() or 0

    # ── Financial Health Score (simple heuristic) ──
    score = 50
    if monthly_savings > 0:
        score += 15
    if savings_rate > 20:
        score += 10
    if total_liabilities == 0:
        score += 15
    if total_investments > 0:
        score += 10
    score = min(score, 100)

    # ── Expense trend (last 7 days) ──
    week_ago = today - timedelta(days=7)
    r = await db.execute(
        select(Expense.date, func.sum(Expense.amount).label("total"))
        .where(Expense.date >= week_ago)
        .group_by(Expense.date)
        .order_by(Expense.date)
    )
    expense_trend = [
        {"date": str(row[0]), "amount": float(row[1])} for row in r.all()
    ]

    # ── Income vs Expense (last 6 months) ──
    six_months_ago = today.replace(day=1) - timedelta(days=180)
    income_vs_expense = []
    # Income by month
    r_inc = await db.execute(
        select(
            func.strftime("%Y-%m", Income.date).label("month"),
            func.sum(Income.amount).label("total"),
        )
        .where(Income.date >= six_months_ago)
        .group_by("month")
        .order_by("month")
    )
    inc_map = {str(row[0].date()): float(row[1]) for row in r_inc.all()}

    r_exp = await db.execute(
        select(
            func.strftime("%Y-%m", Expense.date).label("month"),
            func.sum(Expense.amount).label("total"),
        )
        .where(Expense.date >= six_months_ago)
        .group_by("month")
        .order_by("month")
    )
    exp_map = {str(row[0].date()): float(row[1]) for row in r_exp.all()}

    all_months = sorted(set(list(inc_map.keys()) + list(exp_map.keys())))
    for m in all_months:
        income_vs_expense.append({
            "month": m,
            "income": inc_map.get(m, 0),
            "expense": exp_map.get(m, 0),
        })

    # ── Top expenses (this month by category) ──
    r = await db.execute(
        select(
            ExpenseCategory.name,
            func.sum(Expense.amount).label("total"),
        )
        .join(ExpenseCategory, Expense.category_id == ExpenseCategory.id, isouter=True)
        .where(Expense.date >= month_start)
        .group_by(ExpenseCategory.name)
        .order_by(func.sum(Expense.amount).desc())
        .limit(5)
    )
    top_expenses = [
        {"category": row[0] or "Other", "amount": float(row[1])}
        for row in r.all()
    ]

    # ── Goal progress ──
    r = await db.execute(
        select(FinancialGoal).order_by(FinancialGoal.created_at.desc()).limit(5)
    )
    goals = r.scalars().all()
    goal_progress = [
        {
            "name": g.name,
            "target": float(g.target_amount),
            "current": float(g.current_amount),
            "progress": int(
                (g.current_amount / g.target_amount * 100) if g.target_amount else 0
            ),
        }
        for g in goals
    ]

    # ── Upcoming tasks ──
    r = await db.execute(
        select(Task)
        .where(Task.status.in_(["todo", "in_progress"]))
        .order_by(Task.due_date.asc().nullslast())
        .limit(5)
    )
    tasks = r.scalars().all()
    upcoming_tasks = [
        {
            "title": t.title,
            "due_date": str(t.due_date) if t.due_date else None,
            "priority": str(t.priority.value) if t.priority else "medium",
            "status": str(t.status.value) if t.status else "todo",
        }
        for t in tasks
    ]

    # ── Recent journal entries ──
    r = await db.execute(
        select(JournalEntry)
        .order_by(JournalEntry.date.desc())
        .limit(3)
    )
    journals = r.scalars().all()
    recent_journal = [
        {
            "date": str(j.date),
            "mood": str(j.mood.value) if j.mood else None,
            "energy_level": j.energy_level,
            "thoughts_preview": (j.thoughts[:100] + "...") if j.thoughts and len(j.thoughts) > 100 else j.thoughts,
        }
        for j in journals
    ]

    return DashboardData(
        net_worth=net_worth,
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        monthly_savings=monthly_savings,
        savings_rate=savings_rate,
        active_goals_count=active_goals_count,
        active_projects_count=active_projects_count,
        pending_tasks_count=pending_tasks_count,
        total_dreams=total_dreams,
        financial_health_score=score,
        expense_trend=expense_trend,
        income_vs_expense=income_vs_expense,
        top_expenses=top_expenses,
        goal_progress=goal_progress,
        upcoming_tasks=upcoming_tasks,
        recent_journal=recent_journal,
    )
