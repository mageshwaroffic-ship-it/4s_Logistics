import psycopg2
from db_connection import get_connection, release_connection

def create_documents_table():
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        print("🔨 Creating 'job_documents' table...")
        
        create_table_query = """
        CREATE TABLE IF NOT EXISTS job_documents (
            id SERIAL PRIMARY KEY,
            job_id INTEGER REFERENCES rms_import_details(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            type TEXT,
            status TEXT CHECK (status IN ('uploaded', 'missing', 'rejected')),
            source TEXT CHECK (source IN ('customer', 'ops')),
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        cursor.execute(create_table_query)
        
        # Check if we need to seed data for Job ID 1 (if it exists)
        cursor.execute("SELECT id FROM rms_import_details LIMIT 1")
        result = cursor.fetchone()
        
        if result:
            job_id = result[0]
            print(f"🌱 Seeding documents for Job ID {job_id}...")
            
            # Check if documents already exist
            cursor.execute("SELECT COUNT(*) FROM job_documents WHERE job_id = %s", (job_id,))
            if cursor.fetchone()[0] == 0:
                seed_query = """
                INSERT INTO job_documents (job_id, name, type, status, source, uploaded_at) VALUES
                (%s, 'Bill of Lading', 'bl', 'uploaded', 'customer', NOW()),
                (%s, 'Commercial Invoice', 'invoice', 'missing', 'customer', NULL),
                (%s, 'Packing List', 'packing_list', 'uploaded', 'customer', NOW()),
                (%s, 'Certificate of Origin', 'coo', 'missing', 'customer', NULL);
                """
                cursor.execute(seed_query, (job_id, job_id, job_id, job_id))
                print("✅ Seed data inserted!")
            else:
                print("ℹ️ Documents already exist for this job.")
        
        conn.commit()
        print("✅ Table 'job_documents' is ready.")
        
    except Exception as e:
        print(f"❌ Error creating table: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            release_connection(conn)

if __name__ == "__main__":
    create_documents_table()
