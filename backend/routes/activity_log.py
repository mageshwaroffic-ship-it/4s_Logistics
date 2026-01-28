"""
Activity Log Routes - API endpoints for audit logging
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
import json

from db_connection import get_connection, release_connection

router = APIRouter()


# ============== Pydantic Models ==============

class ActivityLogCreate(BaseModel):
    tenant_id: Optional[int] = None
    user_id: Optional[int] = None
    entity: str = Field(..., description="Entity type: job, customer, document, etc.")
    entity_id: int = Field(..., description="Entity ID")
    action: str = Field(..., description="Action: created, updated, deleted, viewed")
    details: Optional[dict] = None


# ============== Routes ==============

@router.get("/activity-logs", response_model=dict)
def get_activity_logs(
    tenant_id: Optional[int] = None,
    user_id: Optional[int] = None,
    entity: Optional[str] = None,
    entity_id: Optional[int] = None,
    limit: int = 100
):
    """Get activity logs, with filters."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT a.id, a.tenant_id, a.user_id, a.entity, a.entity_id, a.action, 
                   a.details, a.created_at, u.name as user_name, t.company_name as tenant_name
            FROM activity_logs a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN tenants t ON a.tenant_id = t.id
            WHERE 1=1
        """
        params = []
        
        if tenant_id:
            query += " AND a.tenant_id = %s"
            params.append(tenant_id)
        if user_id:
            query += " AND a.user_id = %s"
            params.append(user_id)
        if entity:
            query += " AND a.entity = %s"
            params.append(entity)
        if entity_id:
            query += " AND a.entity_id = %s"
            params.append(entity_id)
        
        query += f" ORDER BY a.created_at DESC LIMIT {limit}"
        
        cursor.execute(query, tuple(params))
        
        logs = []
        columns = ['id', 'tenant_id', 'user_id', 'entity', 'entity_id', 'action', 
                   'details', 'created_at', 'user_name', 'tenant_name']
        
        for row in cursor.fetchall():
            log = dict(zip(columns, row))
            if log['created_at']:
                log['created_at'] = log['created_at'].isoformat()
            logs.append(log)
            
        return {"logs": logs, "count": len(logs)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch activity logs: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.post("/activity-logs", response_model=dict)
def create_activity_log(log: ActivityLogCreate):
    """Create a new activity log entry."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        details_json = json.dumps(log.details) if log.details else None
        
        cursor.execute("""
            INSERT INTO activity_logs (tenant_id, user_id, entity, entity_id, action, details) 
            VALUES (%s, %s, %s, %s, %s, %s) 
            RETURNING id, created_at
        """, (log.tenant_id, log.user_id, log.entity, log.entity_id, log.action, details_json))
        
        row = cursor.fetchone()
        conn.commit()
        
        return {
            "id": row[0], 
            "created_at": row[1].isoformat() if row[1] else None,
            "message": "Activity logged"
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create activity log: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.get("/activity-logs/entity/{entity}/{entity_id}", response_model=dict)
def get_entity_activity(entity: str, entity_id: int):
    """Get all activity for a specific entity."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT a.id, a.tenant_id, a.user_id, a.entity, a.entity_id, a.action, 
                   a.details, a.created_at, u.name as user_name
            FROM activity_logs a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.entity = %s AND a.entity_id = %s
            ORDER BY a.created_at DESC
        """, (entity, entity_id))
        
        logs = []
        columns = ['id', 'tenant_id', 'user_id', 'entity', 'entity_id', 'action', 
                   'details', 'created_at', 'user_name']
        
        for row in cursor.fetchall():
            log = dict(zip(columns, row))
            if log['created_at']:
                log['created_at'] = log['created_at'].isoformat()
            logs.append(log)
            
        return {"logs": logs, "count": len(logs)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch activity: {str(e)}")
    finally:
        if conn:
            release_connection(conn)
