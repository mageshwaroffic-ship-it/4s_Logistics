"""
Authentication Routes - Login/Signup verification
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import hashlib

from db_connection import get_connection, release_connection

router = APIRouter()


# ============== Pydantic Models ==============

class LoginRequest(BaseModel):
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")


class LoginResponse(BaseModel):
    success: bool
    user: Optional[dict] = None
    tenant: Optional[dict] = None
    message: str


# ============== Routes ==============

@router.post("/auth/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """Authenticate user with email and password."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Hash the password the same way user.py does (SHA256)
        password_hash = hashlib.sha256(request.password.encode()).hexdigest()
        
        # Find user by email and password_hash
        cursor.execute("""
            SELECT u.id, u.tenant_id, u.name, u.email, u.role,
                   t.company_name, t.plan
            FROM users u
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.email = %s AND u.password_hash = %s
        """, (request.email, password_hash))
        
        row = cursor.fetchone()
        
        if not row:
            return LoginResponse(
                success=False,
                message="Invalid email or password"
            )
        
        user_id, tenant_id, name, email, role, company_name, plan = row
        
        # Return user and tenant info
        return LoginResponse(
            success=True,
            user={
                "id": user_id,
                "tenant_id": tenant_id,
                "name": name,
                "email": email,
                "role": role
            },
            tenant={
                "id": tenant_id,
                "company_name": company_name,
                "plan": plan
            },
            message="Login successful"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.post("/auth/verify-email")
def verify_email(email: str):
    """Check if email exists (for forgot password)."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, name FROM users WHERE email = %s", (email,))
        row = cursor.fetchone()
        
        if row:
            return {"exists": True, "name": row[1]}
        return {"exists": False}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")
    finally:
        if conn:
            release_connection(conn)
