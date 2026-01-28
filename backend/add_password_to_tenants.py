"""
Run migration to add password_hash to tenants table
"""
import psycopg2

# Connect to database
conn = psycopg2.connect(
    host="103.14.121.15",
    port=5432,
    database="4s_logistics ",
    user="sql_developer",
    password="Dev@123"
)

cursor = conn.cursor()

# Add password_hash column to tenants
try:
    cursor.execute("""
        ALTER TABLE tenants 
        ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    """)
    conn.commit()
    print("✅ Added password_hash column to tenants table")
except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()

# Verify column exists
cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'tenants'
    ORDER BY ordinal_position
""")
print("\n=== TENANTS TABLE COLUMNS ===")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]}")

cursor.close()
conn.close()
