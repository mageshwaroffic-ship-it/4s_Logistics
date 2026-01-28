"""
Verify jobs table structure and relationships
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

# Check jobs table columns
print("=" * 60)
print("JOBS TABLE COLUMNS")
print("=" * 60)
cursor.execute("""
    SELECT column_name, data_type, character_maximum_length, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'jobs'
    ORDER BY ordinal_position
""")
for row in cursor.fetchall():
    col_name, data_type, max_len, nullable = row
    type_str = f"{data_type}({max_len})" if max_len else data_type
    print(f"  {col_name:20} | {type_str:25} | Nullable: {nullable}")

# Check foreign keys
print("\n" + "=" * 60)
print("JOBS TABLE FOREIGN KEYS")
print("=" * 60)
cursor.execute("""
    SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'jobs'
""")
for row in cursor.fetchall():
    print(f"  {row[1]} -> {row[2]}.{row[3]} (constraint: {row[0]})")

# Check customers table
print("\n" + "=" * 60)
print("CUSTOMERS TABLE COLUMNS")
print("=" * 60)
cursor.execute("""
    SELECT column_name, data_type
    FROM information_schema.columns 
    WHERE table_name = 'customers'
    ORDER BY ordinal_position
""")
for row in cursor.fetchall():
    print(f"  {row[0]:20} | {row[1]}")

# Check if any jobs exist
print("\n" + "=" * 60)
print("EXISTING JOBS")
print("=" * 60)
cursor.execute("SELECT id, job_no, customer_id, pod, eta, status FROM jobs LIMIT 5")
rows = cursor.fetchall()
if rows:
    for row in rows:
        print(f"  ID: {row[0]}, Job: {row[1]}, Customer: {row[2]}, Port: {row[3]}, ETA: {row[4]}, Status: {row[5]}")
else:
    print("  No jobs found in database")

cursor.close()
conn.close()
print("\n" + "=" * 60)
print("VERIFICATION COMPLETE")
print("=" * 60)
