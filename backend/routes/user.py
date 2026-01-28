"""
User Routes - API endpoints for managing users (broker staff)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import hashlib

from db_connection import get_connection, release_connection

router = APIRouter()


# ============== Pydantic Models ==============

class UserCreate(BaseModel):
    tenant_id: int = Field(..., description="Tenant ID")
    name: str = Field(..., description="User full name")
    email: str = Field(..., description="Email address")
    password: str = Field(..., description="Password")
    role: Optional[str] = "staff"  # admin, staff, viewer


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    tenant_id: int
    name: str
    email: str
    role: str
    created_at: Optional[str]


# ============== Routes ==============

@router.get("/users", response_model=dict)
def get_all_users(tenant_id: Optional[int] = None):
    """Get all users, optionally filtered by tenant."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        if tenant_id:
            cursor.execute("""
                SELECT id, tenant_id, name, email, role, created_at 
                FROM users WHERE tenant_id = %s ORDER BY name ASC
            """, (tenant_id,))
        else:
            cursor.execute("""
                SELECT id, tenant_id, name, email, role, created_at 
                FROM users ORDER BY name ASC
            """)
        
        users = []
        columns = ['id', 'tenant_id', 'name', 'email', 'role', 'created_at']
        
        for row in cursor.fetchall():
            user = dict(zip(columns, row))
            if user['created_at']:
                user['created_at'] = user['created_at'].isoformat()
            users.append(user)
            
        return {"users": users, "count": len(users)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate):
    """Create a new user."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Simple password hashing (use bcrypt in production)
        password_hash = hashlib.sha256(user.password.encode()).hexdigest()
        
        cursor.execute("""
            INSERT INTO users (tenant_id, name, email, password_hash, role) 
            VALUES (%s, %s, %s, %s, %s) 
            RETURNING id, tenant_id, name, email, role, created_at
        """, (user.tenant_id, user.name, user.email, password_hash, user.role))
        
        row = cursor.fetchone()
        conn.commit()
        
        columns = ['id', 'tenant_id', 'name', 'email', 'role', 'created_at']
        result = dict(zip(columns, row))
        if result['created_at']:
            result['created_at'] = result['created_at'].isoformat()
        
        return result
        
    except Exception as e:
        if conn:
            conn.rollback()
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="User with this email already exists for this tenant")
        if "foreign key" in str(e).lower():
            raise HTTPException(status_code=400, detail="Tenant not found")
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int):
    """Get a specific user."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, tenant_id, name, email, role, created_at 
            FROM users WHERE id = %s
        """, (user_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        columns = ['id', 'tenant_id', 'name', 'email', 'role', 'created_at']
        result = dict(zip(columns, row))
        if result['created_at']:
            result['created_at'] = result['created_at'].isoformat()
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserUpdate):
    """Update a user."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if user.name: updates.append("name = %s"); params.append(user.name)
        if user.email: updates.append("email = %s"); params.append(user.email)
        if user.password: 
            password_hash = hashlib.sha256(user.password.encode()).hexdigest()
            updates.append("password_hash = %s"); params.append(password_hash)
        if user.role: updates.append("role = %s"); params.append(user.role)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(user_id)
        
        cursor.execute(f"""
            UPDATE users SET {', '.join(updates)} WHERE id = %s
            RETURNING id, tenant_id, name, email, role, created_at
        """, tuple(params))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        conn.commit()
        
        columns = ['id', 'tenant_id', 'name', 'email', 'role', 'created_at']
        result = dict(zip(columns, row))
        if result['created_at']:
            result['created_at'] = result['created_at'].isoformat()
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.delete("/users/{user_id}")
def delete_user(user_id: int):
    """Delete a user."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM users WHERE id = %s RETURNING id", (user_id,))
        deleted = cursor.fetchone()
        
        if not deleted:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        conn.commit()
        return {"message": f"User {user_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")
    finally:
        if conn:
            release_connection(conn)
