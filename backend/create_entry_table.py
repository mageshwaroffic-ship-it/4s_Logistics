import psycopg2
from db_connection import get_connection, release_connection
from datetime import date

def create_entry_table():
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        print("🔨 Creating 'job_entries' table...")
        
        # Table aligned with EntryScreen.tsx fields
        create_table_query = """
        CREATE TABLE IF NOT EXISTS job_entries (
            id SERIAL PRIMARY KEY,
            job_id INTEGER REFERENCES rms_import_details(id) ON DELETE CASCADE,
            
            -- Entry Information
            entry_number TEXT,
            entry_date DATE,
            port_of_entry TEXT,
            mode_of_transport TEXT,
            
            -- Parties
            importer_of_record TEXT,
            consignee TEXT,
            
            -- Transport Details
            vessel_name TEXT,
            voyage_number TEXT,
            arrival_date DATE,
            bill_of_lading TEXT,
            container_number TEXT,
            
            -- Goods Information
            hs_code TEXT,
            description TEXT,
            quantity TEXT,
            declared_value TEXT,
            
            -- Duty & Fee Estimates
            duty_rate TEXT,
            estimated_duty TEXT,
            hmf_mpf TEXT,
            total_estimate TEXT,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        cursor.execute(create_table_query)
        
        # Seed Data for Job ID 1
        cursor.execute("SELECT id FROM rms_import_details LIMIT 1")
        result = cursor.fetchone()
        
        if result:
            job_id = result[0]
            print(f"🌱 Seeding entry details for Job ID {job_id}...")
            
            cursor.execute("SELECT COUNT(*) FROM job_entries WHERE job_id = %s", (job_id,))
            if cursor.fetchone()[0] == 0:
                seed_query = """
                INSERT INTO job_entries (
                    job_id, 
                    entry_number, entry_date, port_of_entry, mode_of_transport,
                    importer_of_record, consignee,
                    vessel_name, voyage_number, arrival_date, bill_of_lading, container_number,
                    hs_code, description, quantity, declared_value,
                    duty_rate, estimated_duty, hmf_mpf, total_estimate
                ) VALUES (
                    %s,
                    'ENT-2024-001', '2024-01-26', 'Los Angeles, CA', 'Sea',
                    'TechCorp Solutions Inc.', 'TechCorp Warehouse',
                    'Maersk Alabama', 'VOY-2024-001', '2024-02-05', 'MAEU123456789', 'TRHU4567890',
                    '8517.62.00', 'Mobile Phone Accessories', '5,000 Units', '$75,000.00',
                    '2.5%', '$1,875.00', '$528.00', '$2,403.00'
                );
                """
                cursor.execute(seed_query, (job_id,))
                print("✅ Seed data inserted!")
            else:
                print("ℹ️ Entry details already exist for this job.")
        
        conn.commit()
        print("✅ Table 'job_entries' is ready.")
        
    except Exception as e:
        print(f"❌ Error creating table: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            release_connection(conn)

if __name__ == "__main__":
    create_entry_table()
