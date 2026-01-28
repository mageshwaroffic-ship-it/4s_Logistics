"""
Transport Routes - API endpoints for managing transport/delivery
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from db_connection import get_connection, release_connection

router = APIRouter()


# ============== Pydantic Models ==============

class TransportCreate(BaseModel):
    job_id: int = Field(..., description="Job ID")
    transporter_name: Optional[str] = None
    vehicle_no: Optional[str] = None
    driver_phone: Optional[str] = None


class TransportUpdate(BaseModel):
    transporter_name: Optional[str] = None
    vehicle_no: Optional[str] = None
    driver_phone: Optional[str] = None
    gate_out_time: Optional[str] = None
    delivered_time: Optional[str] = None


# ============== Routes ==============

@router.get("/transport", response_model=dict)
def get_all_transport(job_id: Optional[int] = None):
    """Get all transport records, optionally filtered by job."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        if job_id:
            cursor.execute("""
                SELECT t.id, t.job_id, t.transporter_name, t.vehicle_no, t.driver_phone, 
                       t.gate_out_time, t.delivered_time, j.job_no
                FROM transport t
                JOIN jobs j ON t.job_id = j.id
                WHERE t.job_id = %s
            """, (job_id,))
        else:
            cursor.execute("""
                SELECT t.id, t.job_id, t.transporter_name, t.vehicle_no, t.driver_phone, 
                       t.gate_out_time, t.delivered_time, j.job_no
                FROM transport t
                JOIN jobs j ON t.job_id = j.id
            """)
        
        records = []
        columns = ['id', 'job_id', 'transporter_name', 'vehicle_no', 'driver_phone', 
                   'gate_out_time', 'delivered_time', 'job_no']
        
        for row in cursor.fetchall():
            record = dict(zip(columns, row))
            if record['gate_out_time']:
                record['gate_out_time'] = record['gate_out_time'].isoformat()
            if record['delivered_time']:
                record['delivered_time'] = record['delivered_time'].isoformat()
            records.append(record)
            
        return {"transport": records, "count": len(records)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch transport records: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.post("/transport", response_model=dict)
def create_transport(transport: TransportCreate):
    """Create a new transport record."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO transport (job_id, transporter_name, vehicle_no, driver_phone) 
            VALUES (%s, %s, %s, %s) 
            RETURNING id
        """, (transport.job_id, transport.transporter_name, transport.vehicle_no, transport.driver_phone))
        
        row = cursor.fetchone()
        conn.commit()
        
        return {"id": row[0], "message": "Transport record created successfully"}
        
    except Exception as e:
        if conn:
            conn.rollback()
        if "foreign key" in str(e).lower():
            raise HTTPException(status_code=400, detail="Job not found")
        raise HTTPException(status_code=500, detail=f"Failed to create transport record: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.get("/transport/{transport_id}", response_model=dict)
def get_transport(transport_id: int):
    """Get a specific transport record."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT t.id, t.job_id, t.transporter_name, t.vehicle_no, t.driver_phone, 
                   t.gate_out_time, t.delivered_time, j.job_no
            FROM transport t
            JOIN jobs j ON t.job_id = j.id
            WHERE t.id = %s
        """, (transport_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Transport {transport_id} not found")
        
        columns = ['id', 'job_id', 'transporter_name', 'vehicle_no', 'driver_phone', 
                   'gate_out_time', 'delivered_time', 'job_no']
        record = dict(zip(columns, row))
        if record['gate_out_time']:
            record['gate_out_time'] = record['gate_out_time'].isoformat()
        if record['delivered_time']:
            record['delivered_time'] = record['delivered_time'].isoformat()
        
        return {"transport": record}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch transport: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.put("/transport/{transport_id}", response_model=dict)
def update_transport(transport_id: int, transport: TransportUpdate):
    """Update a transport record."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if transport.transporter_name is not None: 
            updates.append("transporter_name = %s"); params.append(transport.transporter_name)
        if transport.vehicle_no is not None: 
            updates.append("vehicle_no = %s"); params.append(transport.vehicle_no)
        if transport.driver_phone is not None: 
            updates.append("driver_phone = %s"); params.append(transport.driver_phone)
        if transport.gate_out_time:
            try:
                gate_out = datetime.fromisoformat(transport.gate_out_time)
                updates.append("gate_out_time = %s"); params.append(gate_out)
            except ValueError:
                pass
        if transport.delivered_time:
            try:
                delivered = datetime.fromisoformat(transport.delivered_time)
                updates.append("delivered_time = %s"); params.append(delivered)
            except ValueError:
                pass
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(transport_id)
        
        cursor.execute(f"""
            UPDATE transport SET {', '.join(updates)} WHERE id = %s
            RETURNING id
        """, tuple(params))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Transport {transport_id} not found")
        
        conn.commit()
        return {"id": row[0], "message": "Transport record updated"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update transport: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.put("/transport/{transport_id}/gate-out")
def mark_gate_out(transport_id: int):
    """Mark transport as gate out (set gate_out_time to now)."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE transport SET gate_out_time = CURRENT_TIMESTAMP WHERE id = %s
            RETURNING id, gate_out_time
        """, (transport_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Transport {transport_id} not found")
        
        conn.commit()
        return {"id": row[0], "gate_out_time": row[1].isoformat(), "message": "Gate out recorded"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.put("/transport/{transport_id}/delivered")
def mark_delivered(transport_id: int):
    """Mark transport as delivered (set delivered_time to now)."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE transport SET delivered_time = CURRENT_TIMESTAMP WHERE id = %s
            RETURNING id, delivered_time
        """, (transport_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Transport {transport_id} not found")
        
        conn.commit()
        return {"id": row[0], "delivered_time": row[1].isoformat(), "message": "Delivery recorded"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.delete("/transport/{transport_id}")
def delete_transport(transport_id: int):
    """Delete a transport record."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM transport WHERE id = %s RETURNING id", (transport_id,))
        deleted = cursor.fetchone()
        
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Transport {transport_id} not found")
        
        conn.commit()
        return {"message": f"Transport record deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete: {str(e)}")
    finally:
        if conn:
            release_connection(conn)
