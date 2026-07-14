import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from decimal import Decimal
from datetime import date
from app.models.finance import Debt, DebtType

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/lifeos"

async def test_insert():
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            data = {
                "name": "Bike Loan",
                "type": "vehicle_loan", # Wait, SAEnum expects string?
                "principal": Decimal('500000.0'),
                "current_balance": Decimal('500000.0'),
                "interest_rate": Decimal('10.0'),
                "monthly_payment": Decimal('10623.52'),
                "start_date": date.fromisoformat("2026-06-10"),
                "due_date": date.fromisoformat("2026-07-10"),
                "contact_info": ""
            }
            debt = Debt(**data)
            session.add(debt)
            await session.commit()
            print("Successfully committed")
        except Exception as e:
            print("Error:", type(e).__name__, str(e))

asyncio.run(test_insert())
