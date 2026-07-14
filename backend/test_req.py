import urllib.request
import json

data = {
    "name": "Bike Loan",
    "type": "vehicle_loan",
    "principal": 500000,
    "current_balance": None,
    "interest_rate": 10,
    "monthly_payment": None,
    "tenure_months": 60,
    "start_date": "2026-06-10",
    "due_date": "2026-07-10",
    "contact_info": ""
}

req = urllib.request.Request("http://localhost:8000/api/v1/debts", data=json.dumps(data).encode(), headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req) as res:
        print("Status:", res.status)
        print("Body:", res.read().decode())
except urllib.error.HTTPError as e:
    print("Error:", e.code)
    print("Body:", e.read().decode())
