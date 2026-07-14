import sqlite3

def migrate():
    print("Connecting to database...")
    conn = sqlite3.connect("lifeos.db")
    cursor = conn.cursor()

    try:
        # Add income_type column
        cursor.execute("ALTER TABLE incomes ADD COLUMN income_type VARCHAR(20) DEFAULT 'Active'")
        print("Successfully added income_type column to incomes table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column income_type already exists.")
        else:
            print(f"Error adding column: {e}")
            return

    # Backfill passive income
    print("Backfilling Passive income for investments...")
    cursor.execute("UPDATE incomes SET income_type = 'Passive' WHERE category = 'investments'")
    
    conn.commit()
    print(f"Migration completed. {cursor.rowcount} records updated to Passive.")
    conn.close()

if __name__ == "__main__":
    migrate()
