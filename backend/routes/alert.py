"""
Alert Routes - API endpoints for managing alerts (notifications)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from db_connection import get_connection, release_connection

router = APIRouter()


# ============== Pydantic Models ==============

class AlertCreate(BaseModel):
    job_id: int = Field(..., description="Job ID")
    alert_type: str = Field(..., description="Alert type: email, sms, whatsapp")
    message: str = Field(..., description="Alert message")


class AlertUpdate(BaseModel):
    status: Optional[str] = None  # pending, sent, failed


# ============== Routes ==============

@router.get("/alerts", response_model=dict)
def get_all_alerts(job_id: Optional[int] = None, status: Optional[str] = None):
    """Get all alerts, optionally filtered by job and status."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT a.id, a.job_id, a.alert_type, a.message, a.sent_at, a.status, j.job_no
            FROM alerts a
            JOIN jobs j ON a.job_id = j.id
            WHERE 1=1
        """
        params = []
        
        if job_id:
            query += " AND a.job_id = %s"
            params.append(job_id)
        if status:
            query += " AND a.status = %s"
            params.append(status)
        
        query += " ORDER BY a.id DESC"
        
        cursor.execute(query, tuple(params))
        
        alerts = []
        columns = ['id', 'job_id', 'alert_type', 'message', 'sent_at', 'status', 'job_no']
        
        for row in cursor.fetchall():
            alert = dict(zip(columns, row))
            if alert['sent_at']:
                alert['sent_at'] = alert['sent_at'].isoformat()
            alerts.append(alert)
            
        return {"alerts": alerts, "count": len(alerts)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.post("/alerts", response_model=dict)
def create_alert(alert: AlertCreate):
    """Create a new alert."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO alerts (job_id, alert_type, message) 
            VALUES (%s, %s, %s) 
            RETURNING id, alert_type, status
        """, (alert.job_id, alert.alert_type, alert.message))
        
        row = cursor.fetchone()
        conn.commit()
        
        return {"id": row[0], "alert_type": row[1], "status": row[2], "message": "Alert created successfully"}
        
    except Exception as e:
        if conn:
            conn.rollback()
        if "foreign key" in str(e).lower():
            raise HTTPException(status_code=400, detail="Job not found")
        raise HTTPException(status_code=500, detail=f"Failed to create alert: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.put("/alerts/{alert_id}", response_model=dict)
def update_alert(alert_id: int, alert: AlertUpdate):
    """Update alert status (mark as sent/failed)."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        if not alert.status:
            raise HTTPException(status_code=400, detail="Status is required")
        
        sent_at = None
        if alert.status == 'sent':
            sent_at = datetime.now()
        
        if sent_at:
            cursor.execute("""
                UPDATE alerts SET status = %s, sent_at = %s WHERE id = %s
                RETURNING id, status, sent_at
            """, (alert.status, sent_at, alert_id))
        else:
            cursor.execute("""
                UPDATE alerts SET status = %s WHERE id = %s
                RETURNING id, status, sent_at
            """, (alert.status, alert_id))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
        
        conn.commit()
        
        return {
            "id": row[0], 
            "status": row[1],
            "sent_at": row[2].isoformat() if row[2] else None,
            "message": "Alert updated"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update alert: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.delete("/alerts/{alert_id}")
def delete_alert(alert_id: int):
    """Delete an alert."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM alerts WHERE id = %s RETURNING id", (alert_id,))
        deleted = cursor.fetchone()
        
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
        
        conn.commit()
        return {"message": f"Alert deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete alert: {str(e)}")
    finally:
        if conn:
            release_connection(conn)
