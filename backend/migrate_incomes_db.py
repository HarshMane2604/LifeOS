import sqlite3
conn = sqlite3.connect('lifeos.db')
try:
    conn.execute('ALTER TABLE incomes ADD COLUMN month INTEGER')
    conn.execute('ALTER TABLE incomes ADD COLUMN year INTEGER')
except Exception as e:
    print(e)
conn.execute("UPDATE incomes SET month = CAST(strftime('%m', date) AS INTEGER), year = CAST(strftime('%Y', date) AS INTEGER)")
conn.commit()
conn.close()
print("Migration done")
