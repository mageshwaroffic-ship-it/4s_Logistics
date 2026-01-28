"""
Customer Routes - API endpoints for managing customers (importers/exporters)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from db_connection import get_connection, release_connection

router = APIRouter()


# ============== Pydantic Models ==============

class CustomerCreate(BaseModel):
    tenant_id: int = Field(..., description="Tenant ID")
    company_name: str = Field(..., description="Company name")
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gst_no: Optional[str] = None


class CustomerUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gst_no: Optional[str] = None


class CustomerResponse(BaseModel):
    id: int
    tenant_id: int
    company_name: str
    contact_person: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    gst_no: Optional[str]
    created_at: Optional[str]


# ============== Routes ==============

@router.get("/customers", response_model=dict)
def get_all_customers(tenant_id: Optional[int] = None):
    """Get all customers, optionally filtered by tenant."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        if tenant_id:
            cursor.execute("""
                SELECT id, tenant_id, company_name, contact_person, phone, email, gst_no, created_at 
                FROM customers WHERE tenant_id = %s ORDER BY company_name ASC
            """, (tenant_id,))
        else:
            cursor.execute("""
                SELECT id, tenant_id, company_name, contact_person, phone, email, gst_no, created_at 
                FROM customers ORDER BY company_name ASC
            """)
        
        customers = []
        columns = ['id', 'tenant_id', 'company_name', 'contact_person', 'phone', 'email', 'gst_no', 'created_at']
        
        for row in cursor.fetchall():
            customer = dict(zip(columns, row))
            if customer['created_at']:
                customer['created_at'] = customer['created_at'].isoformat()
            customers.append(customer)
            
        return {"customers": customers, "count": len(customers)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch customers: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.post("/customers", response_model=CustomerResponse)
def create_customer(customer: CustomerCreate):
    """Create a new customer."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO customers (tenant_id, company_name, contact_person, phone, email, gst_no) 
            VALUES (%s, %s, %s, %s, %s, %s) 
            RETURNING id, tenant_id, company_name, contact_person, phone, email, gst_no, created_at
        """, (customer.tenant_id, customer.company_name, customer.contact_person, 
              customer.phone, customer.email, customer.gst_no))
        
        row = cursor.fetchone()
        conn.commit()
        
        columns = ['id', 'tenant_id', 'company_name', 'contact_person', 'phone', 'email', 'gst_no', 'created_at']
        result = dict(zip(columns, row))
        if result['created_at']:
            result['created_at'] = result['created_at'].isoformat()
        
        return result
        
    except Exception as e:
        if conn:
            conn.rollback()
        if "foreign key" in str(e).lower():
            raise HTTPException(status_code=400, detail="Tenant not found")
        raise HTTPException(status_code=500, detail=f"Failed to create customer: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int):
    """Get a specific customer."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, tenant_id, company_name, contact_person, phone, email, gst_no, created_at 
            FROM customers WHERE id = %s
        """, (customer_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
        
        columns = ['id', 'tenant_id', 'company_name', 'contact_person', 'phone', 'email', 'gst_no', 'created_at']
        result = dict(zip(columns, row))
        if result['created_at']:
            result['created_at'] = result['created_at'].isoformat()
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch customer: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.put("/customers/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, customer: CustomerUpdate):
    """Update a customer."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if customer.company_name: updates.append("company_name = %s"); params.append(customer.company_name)
        if customer.contact_person is not None: updates.append("contact_person = %s"); params.append(customer.contact_person)
        if customer.phone is not None: updates.append("phone = %s"); params.append(customer.phone)
        if customer.email is not None: updates.append("email = %s"); params.append(customer.email)
        if customer.gst_no is not None: updates.append("gst_no = %s"); params.append(customer.gst_no)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(customer_id)
        
        cursor.execute(f"""
            UPDATE customers SET {', '.join(updates)} WHERE id = %s
            RETURNING id, tenant_id, company_name, contact_person, phone, email, gst_no, created_at
        """, tuple(params))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
        
        conn.commit()
        
        columns = ['id', 'tenant_id', 'company_name', 'contact_person', 'phone', 'email', 'gst_no', 'created_at']
        result = dict(zip(columns, row))
        if result['created_at']:
            result['created_at'] = result['created_at'].isoformat()
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update customer: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.delete("/customers/{customer_id}")
def delete_customer(customer_id: int):
    """Delete a customer."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM customers WHERE id = %s RETURNING id", (customer_id,))
        deleted = cursor.fetchone()
        
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
        
        conn.commit()
        return {"message": f"Customer {customer_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete customer: {str(e)}")
    finally:
        if conn:
            release_connection(conn)
