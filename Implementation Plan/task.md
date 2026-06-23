# LifeOS — Phase 1 Build Tasks

## Project Scaffolding
- [ ] Create project directory structure
- [ ] Initialize Vite + React + TypeScript frontend
- [ ] Install frontend dependencies (Tailwind v4, ShadCN, Framer Motion, Recharts, React Router, Zustand)
- [ ] Configure Tailwind v4 + ShadCN UI
- [ ] Set up path aliases (@/)
- [ ] Initialize Python backend (FastAPI)
- [ ] Install backend dependencies
- [ ] Set up Docker Compose for PostgreSQL

## Backend Core
- [ ] Config module (pydantic-settings)
- [ ] Database module (async SQLAlchemy engine/session)
- [ ] Security module (JWT, keyword auth)
- [ ] SQLAlchemy models (all Phase 1 tables)
- [ ] Pydantic schemas
- [ ] Alembic migrations setup

## Backend API Routes
- [ ] Auth endpoints (keyword login, verify, me)
- [ ] Expense CRUD + analytics
- [ ] Income CRUD + analytics
- [ ] Debt CRUD + payment tracking
- [ ] Investment CRUD + portfolio
- [ ] Financial Goals CRUD
- [ ] Financial Ideas CRUD
- [ ] Dashboard aggregation endpoint
- [ ] File upload endpoint

## Frontend Design System
- [ ] Global CSS + design tokens
- [ ] Theme provider (dark/light mode)
- [ ] ShadCN component installation

## Frontend Layout
- [ ] AppShell (main layout)
- [ ] Sidebar navigation
- [ ] Topbar
- [ ] Mobile navigation
- [ ] Protected route wrapper

## Frontend Auth
- [ ] Login page (keyword entry)
- [ ] Auth context + JWT management
- [ ] API client with interceptors

## Frontend Dashboard (Life Command Center)
- [ ] Dashboard page layout
- [ ] Net Worth card
- [ ] Monthly Savings card
- [ ] Financial Health Score gauge
- [ ] Active Goals widget
- [ ] Upcoming Tasks widget
- [ ] Quick Actions widget
- [ ] Motivation widget

## Frontend Financial Module
- [ ] Expenses page (table, filters, search, CRUD modal)
- [ ] Income page
- [ ] Debts page
- [ ] Investments page (portfolio view)
- [ ] Net Worth page
- [ ] Financial Goals page
- [ ] Financial Ideas page

## Verification
- [ ] Backend starts and connects to DB
- [ ] Frontend builds without errors
- [ ] Auth flow works end-to-end
- [ ] CRUD operations functional
- [ ] Dashboard displays aggregated data
- [ ] Responsive layout verified
