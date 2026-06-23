from datetime import date
from decimal import Decimal

def test_debt_calc():
    data = {
        "name": "Bike Loan",
        "type": "vehicle_loan",
        "principal": 500000,
        "current_balance": None,
        "interest_rate": 10,
        "monthly_payment": None,
        "tenure_months": 60,
        "start_date": date.fromisoformat("2026-06-10"),
        "due_date": date.fromisoformat("2026-07-10"),
        "contact_info": ""
    }
    
    tenure_months = data.pop("tenure_months", None)
    principal = float(data.get("principal", 0))
    interest_rate = float(data.get("interest_rate", 0))
    
    # 1. Calculate EMI if not provided but tenure is given
    if not data.get("monthly_payment") and tenure_months:
        if interest_rate > 0:
            r = interest_rate / 100 / 12
            emi = principal * r * ((1 + r) ** tenure_months) / (((1 + r) ** tenure_months) - 1)
            data["monthly_payment"] = Decimal(str(round(emi, 2)))
        else:
            data["monthly_payment"] = Decimal(str(round(principal / tenure_months, 2)))
            
    # 2. Calculate Current Balance if not provided
    if data.get("current_balance") is None:
        start_date = data.get("start_date")
        if start_date:
            today = date.today()
            months_passed = (today.year - start_date.year) * 12 + today.month - start_date.month
            if months_passed < 0:
                months_passed = 0
            
            emi = float(data.get("monthly_payment") or 0)
            
            if months_passed == 0:
                data["current_balance"] = Decimal(str(principal))
            else:
                if interest_rate > 0 and emi > 0:
                    r = interest_rate / 100 / 12
                    balance = principal * ((1 + r) ** months_passed) - emi * (((1 + r) ** months_passed) - 1) / r
                    if balance < 0:
                        balance = 0
                    data["current_balance"] = Decimal(str(round(balance, 2)))
                else:
                    balance = principal - (emi * months_passed)
                    if balance < 0:
                        balance = 0
                    data["current_balance"] = Decimal(str(round(balance, 2)))
        else:
            data["current_balance"] = Decimal(str(principal))

    print("Success")
    print("EMI:", data["monthly_payment"])
    print("Balance:", data["current_balance"])

test_debt_calc()
