"""
Quick debug script to check users table
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

# Check what columns exist in users table
cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users'
    ORDER BY ordinal_position
""")
print("=== USERS TABLE COLUMNS ===")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]}")

# Check users data
cursor.execute("SELECT id, tenant_id, name, email, password_hash, role FROM users LIMIT 5")
print("\n=== USERS DATA ===")
columns = ['id', 'tenant_id', 'name', 'email', 'password_hash', 'role']
for row in cursor.fetchall():
    print(dict(zip(columns, row)))

cursor.close()
conn.close()
