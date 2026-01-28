"""
Database Migration Runner for 4S Logistics
Executes SQL migration scripts against the PostgreSQL database
"""

import os
import sys
import psycopg2

# Add parent directory to import config
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_CONFIG

def run_migration(sql_file: str):
    """Execute a SQL migration file."""
    print(f"\n{'='*60}")
    print(f"Running Migration: {os.path.basename(sql_file)}")
    print(f"{'='*60}")
    
    # Read SQL file
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    conn = None
    try:
        # Connect to database
        print(f"Connecting to: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Execute migration
        cursor.execute(sql_content)
        
        # Fetch any results (like our success message)
        try:
            result = cursor.fetchone()
            if result:
                print(f"\n[OK] {result[0]}")
        except:
            pass
        
        conn.commit()
        print(f"\n[SUCCESS] Migration completed successfully!")
        
        # Show created tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print(f"\nTables in database ({len(tables)} total):")
        print("-" * 40)
        for t in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {t[0]}")
            count = cursor.fetchone()[0]
            print(f"  - {t[0]}: {count} rows")
        
    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()
            print(f"\nDatabase connection closed.")
    
    return True


def main():
    migrations_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Get all SQL files in order
    sql_files = sorted([
        os.path.join(migrations_dir, f) 
        for f in os.listdir(migrations_dir) 
        if f.endswith('.sql')
    ])
    
    if not sql_files:
        print("No migration files found!")
        return
    
    print(f"Found {len(sql_files)} migration file(s)")
    
    for sql_file in sql_files:
        success = run_migration(sql_file)
        if not success:
            print("Migration stopped due to error.")
            break


if __name__ == "__main__":
    main()
