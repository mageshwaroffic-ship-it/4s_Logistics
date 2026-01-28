"""
Container Routes - API endpoints for managing containers
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List

from db_connection import get_connection, release_connection

router = APIRouter()


# ============== Pydantic Models ==============

class ContainerCreate(BaseModel):
    job_id: int = Field(..., description="Job ID")
    container_no: str = Field(..., description="Container number")
    size: Optional[str] = None  # 20, 40, 45
    type: Optional[str] = "dry"  # dry, reefer
    seal_no: Optional[str] = None


class ContainerUpdate(BaseModel):
    container_no: Optional[str] = None
    size: Optional[str] = None
    type: Optional[str] = None
    seal_no: Optional[str] = None
    status: Optional[str] = None  # pending, discharged, in_transit, delivered


# ============== Routes ==============

@router.get("/containers", response_model=dict)
def get_all_containers(job_id: Optional[int] = None):
    """Get all containers, optionally filtered by job."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        if job_id:
            cursor.execute("""
                SELECT c.id, c.job_id, c.container_no, c.size, c.type, c.seal_no, c.status, j.job_no
                FROM containers c
                JOIN jobs j ON c.job_id = j.id
                WHERE c.job_id = %s
            """, (job_id,))
        else:
            cursor.execute("""
                SELECT c.id, c.job_id, c.container_no, c.size, c.type, c.seal_no, c.status, j.job_no
                FROM containers c
                JOIN jobs j ON c.job_id = j.id
            """)
        
        containers = []
        columns = ['id', 'job_id', 'container_no', 'size', 'type', 'seal_no', 'status', 'job_no']
        
        for row in cursor.fetchall():
            containers.append(dict(zip(columns, row)))
            
        return {"containers": containers, "count": len(containers)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch containers: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.post("/containers", response_model=dict)
def create_container(container: ContainerCreate):
    """Create a new container."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO containers (job_id, container_no, size, type, seal_no) 
            VALUES (%s, %s, %s, %s, %s) 
            RETURNING id, container_no, status
        """, (container.job_id, container.container_no, container.size, container.type, container.seal_no))
        
        row = cursor.fetchone()
        conn.commit()
        
        return {"id": row[0], "container_no": row[1], "status": row[2], "message": "Container added successfully"}
        
    except Exception as e:
        if conn:
            conn.rollback()
        if "foreign key" in str(e).lower():
            raise HTTPException(status_code=400, detail="Job not found")
        raise HTTPException(status_code=500, detail=f"Failed to create container: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.get("/containers/{container_id}", response_model=dict)
def get_container(container_id: int):
    """Get a specific container."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT c.id, c.job_id, c.container_no, c.size, c.type, c.seal_no, c.status, j.job_no
            FROM containers c
            JOIN jobs j ON c.job_id = j.id
            WHERE c.id = %s
        """, (container_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Container {container_id} not found")
        
        columns = ['id', 'job_id', 'container_no', 'size', 'type', 'seal_no', 'status', 'job_no']
        return {"container": dict(zip(columns, row))}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch container: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.put("/containers/{container_id}", response_model=dict)
def update_container(container_id: int, container: ContainerUpdate):
    """Update a container."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if container.container_no: updates.append("container_no = %s"); params.append(container.container_no)
        if container.size is not None: updates.append("size = %s"); params.append(container.size)
        if container.type is not None: updates.append("type = %s"); params.append(container.type)
        if container.seal_no is not None: updates.append("seal_no = %s"); params.append(container.seal_no)
        if container.status: updates.append("status = %s"); params.append(container.status)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(container_id)
        
        cursor.execute(f"""
            UPDATE containers SET {', '.join(updates)} WHERE id = %s
            RETURNING id, container_no, status
        """, tuple(params))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Container {container_id} not found")
        
        conn.commit()
        return {"id": row[0], "container_no": row[1], "status": row[2], "message": "Container updated"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update container: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.delete("/containers/{container_id}")
def delete_container(container_id: int):
    """Delete a container."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM containers WHERE id = %s RETURNING id", (container_id,))
        deleted = cursor.fetchone()
        
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Container {container_id} not found")
        
        conn.commit()
        return {"message": f"Container deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete container: {str(e)}")
    finally:
        if conn:
            release_connection(conn)
