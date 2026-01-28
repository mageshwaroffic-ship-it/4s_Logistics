"""
New Jobs Routes - API endpoints for the new jobs table (SaaS multi-tenant)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

from db_connection import get_connection, release_connection

router = APIRouter()


# ============== Pydantic Models ==============

class NewJobCreate(BaseModel):
    tenant_id: int = Field(..., description="Tenant ID")
    job_no: str = Field(..., description="Job number (unique per tenant)")
    bl_no: Optional[str] = None
    shipping_line: Optional[str] = None
    vessel_name: Optional[str] = None
    voyage_no: Optional[str] = None
    pol: Optional[str] = None  # Port of Loading
    pod: Optional[str] = None  # Port of Discharge
    eta: Optional[str] = None
    customer_id: Optional[int] = None


class NewJobUpdate(BaseModel):
    bl_no: Optional[str] = None
    shipping_line: Optional[str] = None
    vessel_name: Optional[str] = None
    voyage_no: Optional[str] = None
    pol: Optional[str] = None
    pod: Optional[str] = None
    eta: Optional[str] = None
    ata: Optional[str] = None
    status: Optional[str] = None  # created, in_transit, arrived, cleared, delivered, closed
    customer_id: Optional[int] = None


# ============== Routes ==============

@router.get("/new-jobs", response_model=dict)
def get_all_new_jobs(tenant_id: Optional[int] = None, status: Optional[str] = None):
    """Get all jobs from the new jobs table, optionally filtered by tenant and status."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT j.id, j.tenant_id, j.job_no, j.bl_no, j.shipping_line, j.vessel_name, 
                   j.voyage_no, j.pol, j.pod, j.eta, j.ata, j.status, j.customer_id, 
                   j.created_at, c.company_name as customer_name
            FROM jobs j
            LEFT JOIN customers c ON j.customer_id = c.id
            WHERE 1=1
        """
        params = []
        
        if tenant_id:
            query += " AND j.tenant_id = %s"
            params.append(tenant_id)
        if status:
            query += " AND j.status = %s"
            params.append(status)
        
        query += " ORDER BY j.created_at DESC"
        
        cursor.execute(query, tuple(params))
        
        jobs = []
        columns = ['id', 'tenant_id', 'job_no', 'bl_no', 'shipping_line', 'vessel_name', 
                   'voyage_no', 'pol', 'pod', 'eta', 'ata', 'status', 'customer_id', 
                   'created_at', 'customer_name']
        
        for row in cursor.fetchall():
            job = dict(zip(columns, row))
            for key in ['eta', 'ata', 'created_at']:
                if job.get(key) and isinstance(job[key], (date, datetime)):
                    job[key] = job[key].isoformat()
            jobs.append(job)
            
        return {"jobs": jobs, "count": len(jobs)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch jobs: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.post("/new-jobs", response_model=dict)
def create_new_job(job: NewJobCreate):
    """Create a new job."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        eta_date = None
        if job.eta:
            try:
                eta_date = datetime.strptime(job.eta, "%Y-%m-%d").date()
            except ValueError:
                pass
        
        cursor.execute("""
            INSERT INTO jobs (tenant_id, job_no, bl_no, shipping_line, vessel_name, 
                              voyage_no, pol, pod, eta, customer_id) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) 
            RETURNING id, job_no, status, created_at
        """, (job.tenant_id, job.job_no, job.bl_no, job.shipping_line, job.vessel_name,
              job.voyage_no, job.pol, job.pod, eta_date, job.customer_id))
        
        row = cursor.fetchone()
        conn.commit()
        
        return {
            "id": row[0],
            "job_no": row[1],
            "status": row[2],
            "created_at": row[3].isoformat() if row[3] else None,
            "message": f"Job {row[1]} created successfully"
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Job number already exists for this tenant")
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.get("/new-jobs/{job_id}", response_model=dict)
def get_new_job(job_id: int):
    """Get a specific job with containers, milestones, and documents."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get job
        cursor.execute("""
            SELECT j.*, c.company_name as customer_name
            FROM jobs j
            LEFT JOIN customers c ON j.customer_id = c.id
            WHERE j.id = %s
        """, (job_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        columns = [desc[0] for desc in cursor.description]
        job = dict(zip(columns, row))
        
        for key in ['eta', 'ata', 'created_at']:
            if job.get(key) and isinstance(job[key], (date, datetime)):
                job[key] = job[key].isoformat()
        
        # Get containers
        cursor.execute("""
            SELECT id, container_no, size, type, seal_no, status 
            FROM containers WHERE job_id = %s
        """, (job_id,))
        containers = []
        for r in cursor.fetchall():
            containers.append(dict(zip(['id', 'container_no', 'size', 'type', 'seal_no', 'status'], r)))
        job['containers'] = containers
        
        # Get milestones
        cursor.execute("""
            SELECT id, stage, milestone_code, milestone_name, status, completed_at, remarks, created_at 
            FROM job_milestones WHERE job_id = %s ORDER BY created_at
        """, (job_id,))
        milestones = []
        for r in cursor.fetchall():
            m = dict(zip(['id', 'stage', 'milestone_code', 'milestone_name', 'status', 'completed_at', 'remarks', 'created_at'], r))
            if m['completed_at']:
                m['completed_at'] = m['completed_at'].isoformat()
            if m['created_at']:
                m['created_at'] = m['created_at'].isoformat()
            milestones.append(m)
        job['milestones'] = milestones
        
        # Get documents
        cursor.execute("""
            SELECT id, doc_type, file_url, uploaded_at 
            FROM documents WHERE job_id = %s
        """, (job_id,))
        documents = []
        for r in cursor.fetchall():
            d = dict(zip(['id', 'doc_type', 'file_url', 'uploaded_at'], r))
            if d['uploaded_at']:
                d['uploaded_at'] = d['uploaded_at'].isoformat()
            documents.append(d)
        job['documents'] = documents
        
        return {"job": job}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch job: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.put("/new-jobs/{job_id}", response_model=dict)
def update_new_job(job_id: int, job: NewJobUpdate):
    """Update a job."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if job.bl_no is not None: updates.append("bl_no = %s"); params.append(job.bl_no)
        if job.shipping_line is not None: updates.append("shipping_line = %s"); params.append(job.shipping_line)
        if job.vessel_name is not None: updates.append("vessel_name = %s"); params.append(job.vessel_name)
        if job.voyage_no is not None: updates.append("voyage_no = %s"); params.append(job.voyage_no)
        if job.pol is not None: updates.append("pol = %s"); params.append(job.pol)
        if job.pod is not None: updates.append("pod = %s"); params.append(job.pod)
        if job.eta is not None: 
            try:
                eta_date = datetime.strptime(job.eta, "%Y-%m-%d").date()
                updates.append("eta = %s"); params.append(eta_date)
            except ValueError:
                pass
        if job.ata is not None: 
            try:
                ata_date = datetime.strptime(job.ata, "%Y-%m-%d").date()
                updates.append("ata = %s"); params.append(ata_date)
            except ValueError:
                pass
        if job.status is not None: updates.append("status = %s"); params.append(job.status)
        if job.customer_id is not None: updates.append("customer_id = %s"); params.append(job.customer_id)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(job_id)
        
        cursor.execute(f"""
            UPDATE jobs SET {', '.join(updates)} WHERE id = %s
            RETURNING id, job_no, status
        """, tuple(params))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        conn.commit()
        
        return {"id": row[0], "job_no": row[1], "status": row[2], "message": "Job updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update job: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.delete("/new-jobs/{job_id}")
def delete_new_job(job_id: int):
    """Delete a job."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM jobs WHERE id = %s RETURNING id, job_no", (job_id,))
        deleted = cursor.fetchone()
        
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        conn.commit()
        return {"message": f"Job {deleted[1]} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete job: {str(e)}")
    finally:
        if conn:
            release_connection(conn)
