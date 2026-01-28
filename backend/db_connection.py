"""
Database Connection Module for 4S Logistics
Uses centralized configuration from config.py
"""

import psycopg2
from psycopg2 import pool
from contextlib import contextmanager
from typing import Optional

# Import configuration
from config import DB_CONFIG, DEBUG


# Connection pool (optional - for better performance)
connection_pool: Optional[pool.SimpleConnectionPool] = None


def init_connection_pool(min_conn: int = 1, max_conn: int = 10):
    """Initialize a connection pool for better performance."""
    global connection_pool
    try:
        connection_pool = pool.SimpleConnectionPool(min_conn, max_conn, **DB_CONFIG)
        if DEBUG:
            print(f"✅ Database connection pool initialized ({min_conn}-{max_conn} connections)")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize connection pool: {e}")
        return False


def get_connection():
    """Get a database connection."""
    global connection_pool
    try:
        if connection_pool:
            return connection_pool.getconn()
        else:
            return psycopg2.connect(**DB_CONFIG)
    except Exception as e:
        raise Exception(f"Database connection failed: {str(e)}")


def release_connection(conn):
    """Release a connection back to the pool."""
    global connection_pool
    if conn:
        if connection_pool:
            connection_pool.putconn(conn)
        else:
            conn.close()


def close_all_connections():
    """Close all connections in the pool."""
    global connection_pool
    if connection_pool:
        connection_pool.closeall()
        if DEBUG:
            print("🔌 All database connections closed")


@contextmanager
def get_db_cursor(commit: bool = False):
    """Context manager for database operations."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        yield cursor
        if commit:
            conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            release_connection(conn)


def test_connection() -> dict:
    """Test the database connection."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        cursor.execute("SELECT current_database();")
        db_name = cursor.fetchone()[0]
        release_connection(conn)
        
        return {
            "status": "connected",
            "host": DB_CONFIG["host"],
            "port": DB_CONFIG["port"],
            "database": db_name,
            "server_version": version.split(",")[0] if version else "Unknown"
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}


if __name__ == "__main__":
    print("=" * 60)
    print("Testing Database Connection")
    print("=" * 60)
    result = test_connection()
    if result["status"] == "connected":
        print(f"✅ Connection successful!")
        print(f"   Host: {result['host']}:{result['port']}")
        print(f"   Database: {result['database']}")
    else:
        print(f"❌ Connection failed: {result['error']}")
