"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.core.database import engine, Base
from app.api.v1 import (
    auth, expenses, incomes, debts, investments, financial_goals, dashboard,
    life_goals, dreams, projects, tasks, journal, assets, second_brain
)
import app.models  # Ensure all models are registered

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle."""
    # Create tables on startup (dev convenience — use Alembic in prod)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed default expense categories
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.core.database import async_session
    from app.models.finance import ExpenseCategory
    from sqlalchemy import select

    async with async_session() as session:
        result = await session.execute(select(ExpenseCategory).limit(1))
        if not result.scalar_one_or_none():
            defaults = [
                ("Food", "🍕", "#f97316"),
                ("Travel", "✈️", "#06b6d4"),
                ("Fuel", "⛽", "#eab308"),
                ("Shopping", "🛒", "#8b5cf6"),
                ("Entertainment", "🎬", "#ec4899"),
                ("Family", "👨‍👩‍👧‍👦", "#f43f5e"),
                ("Health", "💊", "#10b981"),
                ("Education", "📚", "#3b82f6"),
                ("Business", "💼", "#6366f1"),
                ("Subscription", "🔄", "#a855f7"),
                ("Miscellaneous", "📦", "#64748b"),
            ]
            for name, icon, color in defaults:
                session.add(ExpenseCategory(name=name, icon=icon, color=color))
            await session.commit()

    yield

    # Cleanup
    await engine.dispose()


app = FastAPI(
    title="LifeOS API",
    description="Personal Life Operating System — Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
import os
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register routers
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(expenses.router, prefix=API_PREFIX)
app.include_router(incomes.router, prefix=API_PREFIX)
app.include_router(debts.router, prefix=API_PREFIX)
app.include_router(investments.router, prefix=API_PREFIX)
app.include_router(financial_goals.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)

app.include_router(life_goals.router, prefix=API_PREFIX)
app.include_router(dreams.router, prefix=API_PREFIX)
app.include_router(projects.router, prefix=API_PREFIX)
app.include_router(tasks.router, prefix=API_PREFIX)
app.include_router(journal.router, prefix=API_PREFIX)
app.include_router(assets.router, prefix=API_PREFIX)
app.include_router(second_brain.router, prefix=API_PREFIX)


@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "app": "LifeOS"}
