"""
Client Routes - API endpoints for managing clients (Importers)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from db_connection import get_connection, release_connection

router = APIRouter()

# ============== Pydantic Models ==============

class ClientCreate(BaseModel):
    name: str = Field(..., description="Company Name")
    address: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class ClientResponse(BaseModel):
    id: int
    name: str
    address: Optional[str]
    contact_person: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    created_at: Optional[str]

class ClientListResponse(BaseModel):
    clients: List[ClientResponse]
    count: int

# ============== Routes ==============

@router.get("/clients", response_model=ClientListResponse)
def get_all_clients():
    """Get all clients ordered by name."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, address, contact_person, email, phone, created_at 
            FROM clients 
            ORDER BY name ASC
        """)
        
        clients = []
        columns = ['id', 'name', 'address', 'contact_person', 'email', 'phone', 'created_at']
        
        for row in cursor.fetchall():
            client_dict = dict(zip(columns, row))
            if client_dict['created_at']:
                client_dict['created_at'] = client_dict['created_at'].isoformat()
            clients.append(client_dict)
            
        return {"clients": clients, "count": len(clients)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch clients: {str(e)}")
    finally:
        if conn:
            release_connection(conn)

@router.post("/clients", response_model=ClientResponse)
def create_client(client: ClientCreate):
    """Create a new client."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        insert_query = """
            INSERT INTO clients (name, address, contact_person, email, phone) 
            VALUES (%s, %s, %s, %s, %s) 
            RETURNING id, created_at;
        """
        
        try:
            cursor.execute(insert_query, (
                client.name, client.address, client.contact_person, client.email, client.phone
            ))
            result = cursor.fetchone()
            conn.commit()
            
            return {
                "id": result[0],
                "name": client.name,
                "address": client.address,
                "contact_person": client.contact_person,
                "email": client.email,
                "phone": client.phone,
                "created_at": result[1].isoformat() if result[1] else None
            }
        except Exception as e:
            if "unique constraint" in str(e).lower():
                raise HTTPException(status_code=400, detail="Client with this name already exists")
            raise e
            
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create client: {str(e)}")
    finally:
        if conn:
            release_connection(conn)

@router.put("/clients/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, client: ClientUpdate):
    """Update an existing client."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Build dynamic update query
        update_fields = []
        params = []
        
        if client.name is not None:
            update_fields.append("name = %s")
            params.append(client.name)
        if client.address is not None:
            update_fields.append("address = %s")
            params.append(client.address)
        if client.contact_person is not None:
            update_fields.append("contact_person = %s")
            params.append(client.contact_person)
        if client.email is not None:
            update_fields.append("email = %s")
            params.append(client.email)
        if client.phone is not None:
            update_fields.append("phone = %s")
            params.append(client.phone)
            
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
            
        params.append(client_id)
        
        query = f"UPDATE clients SET {', '.join(update_fields)} WHERE id = %s RETURNING *"
        
        try:
            cursor.execute(query, tuple(params))
            row = cursor.fetchone()
            
            if not row:
                raise HTTPException(status_code=404, detail=f"Client {client_id} not found")
                
            conn.commit()
            
            columns = [desc[0] for desc in cursor.description]
            client_dict = dict(zip(columns, row))
            if client_dict['created_at']:
                client_dict['created_at'] = client_dict['created_at'].isoformat()
                
            return client_dict
            
        except Exception as e:
            if "unique constraint" in str(e).lower():
                raise HTTPException(status_code=400, detail="Client with this name already exists")
            raise e
            
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update client: {str(e)}")
    finally:
        if conn:
            release_connection(conn)

@router.delete("/clients/{client_id}")
def delete_client(client_id: int):
    """Delete a client."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if used in jobs
        cursor.execute("SELECT COUNT(*) FROM rms_import_details WHERE client_id = %s", (client_id,))
        count = cursor.fetchone()[0]
        
        if count > 0:
            raise HTTPException(status_code=400, detail=f"Cannot delete client. Used in {count} jobs.")
            
        cursor.execute("DELETE FROM clients WHERE id = %s RETURNING id", (client_id,))
        deleted = cursor.fetchone()
        
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Client {client_id} not found")
            
        conn.commit()
        return {"message": "Client deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete client: {str(e)}")
    finally:
        if conn:
            release_connection(conn)
