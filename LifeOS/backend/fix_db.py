from sqlalchemy import create_engine, text

# LifeOS uses lifeos.db
engine = create_engine('sqlite:///lifeos.db')

with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE debts ADD COLUMN plan_canvas_data JSON'))
        conn.commit()
        print("Successfully added plan_canvas_data column to debts table")
    except Exception as e:
        print(f"Error (column might already exist): {e}")
