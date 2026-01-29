"""
Run migration to add file path columns to jobs table
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

# Add bl_file_path column
try:
    cursor.execute("""
        ALTER TABLE jobs 
        ADD COLUMN IF NOT EXISTS bl_file_path VARCHAR(500)
    """)
    print("Added bl_file_path column")
except Exception as e:
    print(f"bl_file_path: {e}")

# Add packing_list_path column
try:
    cursor.execute("""
        ALTER TABLE jobs 
        ADD COLUMN IF NOT EXISTS packing_list_path VARCHAR(500)
    """)
    print("Added packing_list_path column")
except Exception as e:
    print(f"packing_list_path: {e}")

conn.commit()

# Verify columns
cursor.execute("""
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'jobs'
    ORDER BY ordinal_position
""")
print("\nJobs table columns:")
for row in cursor.fetchall():
    print(f"  - {row[0]}")

cursor.close()
conn.close()
print("\nMigration complete!")
