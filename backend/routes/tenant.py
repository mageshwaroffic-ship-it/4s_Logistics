"""
Tenant Routes - API endpoints for managing SaaS tenants (broker companies)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import hashlib

from db_connection import get_connection, release_connection

router = APIRouter()


# ============== Pydantic Models ==============

class TenantCreate(BaseModel):
    company_name: str = Field(..., description="Broker company name")
    contact_name: Optional[str] = None
    email: str = Field(..., description="Contact email")
    phone: Optional[str] = None
    password: Optional[str] = Field(None, description="Account password for login")
    plan: Optional[str] = "basic"  # basic, pro, enterprise


class TenantUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None  # active, suspended, cancelled


class TenantResponse(BaseModel):
    id: int
    company_name: str
    contact_name: Optional[str]
    email: str
    phone: Optional[str]
    plan: str
    status: str
    created_at: Optional[str]


# ============== Routes ==============

@router.get("/tenants", response_model=dict)
def get_all_tenants():
    """Get all tenants."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, company_name, contact_name, email, phone, plan, status, created_at 
            FROM tenants ORDER BY company_name ASC
        """)
        
        tenants = []
        columns = ['id', 'company_name', 'contact_name', 'email', 'phone', 'plan', 'status', 'created_at']
        
        for row in cursor.fetchall():
            tenant = dict(zip(columns, row))
            if tenant['created_at']:
                tenant['created_at'] = tenant['created_at'].isoformat()
            tenants.append(tenant)
            
        return {"tenants": tenants, "count": len(tenants)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tenants: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.post("/tenants", response_model=TenantResponse)
def create_tenant(tenant: TenantCreate):
    """Create a new tenant and automatically create admin user with password."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Hash password if provided
        password_hash = None
        if tenant.password:
            password_hash = hashlib.sha256(tenant.password.encode()).hexdigest()
        
        # Insert tenant with password_hash
        cursor.execute("""
            INSERT INTO tenants (company_name, contact_name, email, phone, plan, password_hash) 
            VALUES (%s, %s, %s, %s, %s, %s) 
            RETURNING id, company_name, contact_name, email, phone, plan, status, created_at
        """, (tenant.company_name, tenant.contact_name, tenant.email, tenant.phone, tenant.plan, password_hash))
        
        row = cursor.fetchone()
        tenant_id = row[0]
        
        # Auto-create admin user with the same email and password (using foreign key relationship)
        if password_hash:
            cursor.execute("""
                INSERT INTO users (tenant_id, name, email, password_hash, role) 
                VALUES (%s, %s, %s, %s, %s) 
                RETURNING id
            """, (tenant_id, tenant.contact_name or tenant.company_name, tenant.email, password_hash, 'admin'))
            
            user_row = cursor.fetchone()
            user_id = user_row[0] if user_row else None
        
        conn.commit()
        
        columns = ['id', 'company_name', 'contact_name', 'email', 'phone', 'plan', 'status', 'created_at']
        result = dict(zip(columns, row))
        if result['created_at']:
            result['created_at'] = result['created_at'].isoformat()
        
        return result
        
    except Exception as e:
        if conn:
            conn.rollback()
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Tenant with this email already exists")
        raise HTTPException(status_code=500, detail=f"Failed to create tenant: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.get("/tenants/{tenant_id}", response_model=TenantResponse)
def get_tenant(tenant_id: int):
    """Get a specific tenant."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, company_name, contact_name, email, phone, plan, status, created_at 
            FROM tenants WHERE id = %s
        """, (tenant_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Tenant {tenant_id} not found")
        
        columns = ['id', 'company_name', 'contact_name', 'email', 'phone', 'plan', 'status', 'created_at']
        result = dict(zip(columns, row))
        if result['created_at']:
            result['created_at'] = result['created_at'].isoformat()
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tenant: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.put("/tenants/{tenant_id}", response_model=TenantResponse)
def update_tenant(tenant_id: int, tenant: TenantUpdate):
    """Update a tenant."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if tenant.company_name: updates.append("company_name = %s"); params.append(tenant.company_name)
        if tenant.contact_name is not None: updates.append("contact_name = %s"); params.append(tenant.contact_name)
        if tenant.email: updates.append("email = %s"); params.append(tenant.email)
        if tenant.phone is not None: updates.append("phone = %s"); params.append(tenant.phone)
        if tenant.plan: updates.append("plan = %s"); params.append(tenant.plan)
        if tenant.status: updates.append("status = %s"); params.append(tenant.status)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(tenant_id)
        
        cursor.execute(f"""
            UPDATE tenants SET {', '.join(updates)} WHERE id = %s
            RETURNING id, company_name, contact_name, email, phone, plan, status, created_at
        """, tuple(params))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Tenant {tenant_id} not found")
        
        conn.commit()
        
        columns = ['id', 'company_name', 'contact_name', 'email', 'phone', 'plan', 'status', 'created_at']
        result = dict(zip(columns, row))
        if result['created_at']:
            result['created_at'] = result['created_at'].isoformat()
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update tenant: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.delete("/tenants/{tenant_id}")
def delete_tenant(tenant_id: int):
    """Delete a tenant."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM tenants WHERE id = %s RETURNING id", (tenant_id,))
        deleted = cursor.fetchone()
        
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Tenant {tenant_id} not found")
        
        conn.commit()
        return {"message": f"Tenant {tenant_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete tenant: {str(e)}")
    finally:
        if conn:
            release_connection(conn)
