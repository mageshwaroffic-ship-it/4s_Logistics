"""
Milestone Routes - API endpoints for job milestones (status tracking)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from db_connection import get_connection, release_connection

router = APIRouter()


# ============== Pydantic Models ==============

class MilestoneCreate(BaseModel):
    job_id: int = Field(..., description="Job ID")
    stage: str = Field(..., description="Stage: vessel, port, customs, transport")
    milestone_code: str = Field(..., description="Milestone code e.g. VESSEL_DEPARTED")
    milestone_name: str = Field(..., description="Display name")
    remarks: Optional[str] = None


class MilestoneUpdate(BaseModel):
    status: Optional[str] = None  # pending, completed, delayed
    completed_at: Optional[str] = None
    remarks: Optional[str] = None


# ============== Routes ==============

@router.get("/milestones", response_model=dict)
def get_all_milestones(job_id: Optional[int] = None, status: Optional[str] = None):
    """Get all milestones, optionally filtered by job and status."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT m.id, m.job_id, m.stage, m.milestone_code, m.milestone_name, 
                   m.status, m.completed_at, m.remarks, m.created_at, j.job_no
            FROM job_milestones m
            JOIN jobs j ON m.job_id = j.id
            WHERE 1=1
        """
        params = []
        
        if job_id:
            query += " AND m.job_id = %s"
            params.append(job_id)
        if status:
            query += " AND m.status = %s"
            params.append(status)
        
        query += " ORDER BY m.created_at"
        
        cursor.execute(query, tuple(params))
        
        milestones = []
        columns = ['id', 'job_id', 'stage', 'milestone_code', 'milestone_name', 
                   'status', 'completed_at', 'remarks', 'created_at', 'job_no']
        
        for row in cursor.fetchall():
            m = dict(zip(columns, row))
            if m['completed_at']:
                m['completed_at'] = m['completed_at'].isoformat()
            if m['created_at']:
                m['created_at'] = m['created_at'].isoformat()
            milestones.append(m)
            
        return {"milestones": milestones, "count": len(milestones)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch milestones: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.get("/milestone-templates", response_model=dict)
def get_milestone_templates():
    """Get all milestone templates (predefined workflow stages)."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, stage, milestone_code, milestone_name, sequence_order, is_active
            FROM milestone_templates
            WHERE is_active = TRUE
            ORDER BY sequence_order
        """)
        
        templates = []
        columns = ['id', 'stage', 'milestone_code', 'milestone_name', 'sequence_order', 'is_active']
        
        for row in cursor.fetchall():
            templates.append(dict(zip(columns, row)))
            
        return {"templates": templates, "count": len(templates)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch templates: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.post("/milestones", response_model=dict)
def create_milestone(milestone: MilestoneCreate):
    """Create a new milestone for a job."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO job_milestones (job_id, stage, milestone_code, milestone_name, remarks) 
            VALUES (%s, %s, %s, %s, %s) 
            RETURNING id, milestone_code, status, created_at
        """, (milestone.job_id, milestone.stage, milestone.milestone_code, 
              milestone.milestone_name, milestone.remarks))
        
        row = cursor.fetchone()
        conn.commit()
        
        return {
            "id": row[0], 
            "milestone_code": row[1], 
            "status": row[2],
            "created_at": row[3].isoformat() if row[3] else None,
            "message": "Milestone added successfully"
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        if "foreign key" in str(e).lower():
            raise HTTPException(status_code=400, detail="Job not found")
        raise HTTPException(status_code=500, detail=f"Failed to create milestone: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.post("/milestones/init/{job_id}", response_model=dict)
def initialize_milestones(job_id: int):
    """Initialize all milestones for a job based on templates."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if job exists
        cursor.execute("SELECT id FROM jobs WHERE id = %s", (job_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        # Get templates
        cursor.execute("""
            SELECT stage, milestone_code, milestone_name
            FROM milestone_templates
            WHERE is_active = TRUE
            ORDER BY sequence_order
        """)
        templates = cursor.fetchall()
        
        # Insert milestones
        count = 0
        for t in templates:
            cursor.execute("""
                INSERT INTO job_milestones (job_id, stage, milestone_code, milestone_name)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (job_id, t[0], t[1], t[2]))
            count += cursor.rowcount
        
        conn.commit()
        
        return {"message": f"Initialized {count} milestones for job {job_id}"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to initialize milestones: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.put("/milestones/{milestone_id}", response_model=dict)
def update_milestone(milestone_id: int, milestone: MilestoneUpdate):
    """Update a milestone (complete, delay, add remarks)."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if milestone.status: 
            updates.append("status = %s")
            params.append(milestone.status)
            if milestone.status == 'completed' and not milestone.completed_at:
                updates.append("completed_at = CURRENT_TIMESTAMP")
        
        if milestone.completed_at:
            try:
                completed = datetime.fromisoformat(milestone.completed_at)
                updates.append("completed_at = %s")
                params.append(completed)
            except ValueError:
                pass
        
        if milestone.remarks is not None:
            updates.append("remarks = %s")
            params.append(milestone.remarks)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(milestone_id)
        
        cursor.execute(f"""
            UPDATE job_milestones SET {', '.join(updates)} WHERE id = %s
            RETURNING id, milestone_code, status, completed_at
        """, tuple(params))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Milestone {milestone_id} not found")
        
        conn.commit()
        
        return {
            "id": row[0], 
            "milestone_code": row[1], 
            "status": row[2],
            "completed_at": row[3].isoformat() if row[3] else None,
            "message": "Milestone updated"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update milestone: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.delete("/milestones/{milestone_id}")
def delete_milestone(milestone_id: int):
    """Delete a milestone."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM job_milestones WHERE id = %s RETURNING id", (milestone_id,))
        deleted = cursor.fetchone()
        
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Milestone {milestone_id} not found")
        
        conn.commit()
        return {"message": f"Milestone deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete milestone: {str(e)}")
    finally:
        if conn:
            release_connection(conn)
