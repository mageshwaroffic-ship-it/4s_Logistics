import psycopg2
from db_connection import get_connection, release_connection

def setup_clients_feature():
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        print("🔨 Setting up Client Management System...")
        
        # 1. Create 'clients' table
        print("   Creating 'clients' table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS clients (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            address TEXT,
            contact_person TEXT,
            email TEXT,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        # 2. Add 'client_id' to 'rms_import_details' if not exists
        print("   Updating 'rms_import_details' schema...")
        cursor.execute("""
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name='rms_import_details' AND column_name='client_id') THEN 
                ALTER TABLE rms_import_details ADD COLUMN client_id INTEGER REFERENCES clients(id); 
            END IF; 
        END $$;
        """)
        
        # 3. Migrate existing importers
        print("   Migrating existing importers to Clients...")
        # Get unique importer names
        cursor.execute('SELECT DISTINCT "Name of the Importer" FROM rms_import_details WHERE "Name of the Importer" IS NOT NULL')
        importers = cursor.fetchall()
        
        migrated_count = 0
        for (importer_name,) in importers:
            importer_name = importer_name.strip()
            if not importer_name:
                continue
                
            # Insert into clients (ignore if exists)
            cursor.execute("""
                INSERT INTO clients (name) VALUES (%s) 
                ON CONFLICT (name) DO NOTHING 
                RETURNING id
            """, (importer_name,))
            
            # If inserted or already existed, get ID
            client_id_row = cursor.fetchone()
            if not client_id_row:
                # Need to fetch if it existed
                cursor.execute("SELECT id FROM clients WHERE name = %s", (importer_name,))
                client_id_row = cursor.fetchone()
            
            if client_id_row:
                client_id = client_id_row[0]
                # Update jobs
                cursor.execute("""
                    UPDATE rms_import_details 
                    SET client_id = %s 
                    WHERE "Name of the Importer" = %s AND client_id IS NULL
                """, (client_id, importer_name))
                migrated_count += 1
        
        conn.commit()
        print(f"✅ Setup Complete! Migrated {migrated_count} distinct importers.")
        
    except Exception as e:
        print(f"❌ Error setting up clients: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            release_connection(conn)

if __name__ == "__main__":
    setup_clients_feature()
