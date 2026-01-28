"""
Job Routes - API endpoints for managing import jobs
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

# Import centralized database connection
from db_connection import get_connection, release_connection


# Create router
router = APIRouter()


# ============== Pydantic Models ==============

class JobCreate(BaseModel):
    """Model for creating a new job"""
    importer: str = Field(..., description="Name of the importer company")
    port: str = Field(..., description="Port of entry")
    eta: str = Field(..., description="Expected Time of Arrival (YYYY-MM-DD)")
    container_number: Optional[str] = Field(None, description="Container number")
    bl_number: Optional[str] = Field(None, description="Bill of Lading number")
    origin: Optional[str] = Field(None, description="Origin location")
    vessel_name: Optional[str] = Field(None, description="Vessel name")
    num_cartons: Optional[int] = Field(None, description="Number of cartons")
    weight: Optional[str] = Field(None, description="Weight")
    remarks: Optional[str] = Field(None, description="Remarks")


class JobResponse(BaseModel):
    """Model for job response"""
    id: int
    job_number: str
    importer: str
    port: str
    status: str
    message: str


class JobListResponse(BaseModel):
    """Model for job list response"""
    jobs: List[dict]
    count: int


# ============== Helper Functions ==============

def generate_job_number(cursor) -> str:
    """Generate a unique job number in format 4S/AMP/XXX/YY"""
    year = datetime.now().strftime("%y")
    
    try:
        cursor.execute("""
            SELECT COUNT(*) FROM rms_import_details 
            WHERE "JOB No.: 4S/AMP//20" LIKE %s
        """, (f"%/{year}",))
        count = cursor.fetchone()[0] + 1
    except:
        count = 1
    
    return f"4S/AMP/{count:03d}/{year}"


# ============== Route Endpoints ==============

@router.get("/jobs", response_model=JobListResponse)
def get_all_jobs():
    """Get all jobs from the database."""
    print(f"📡 Fetching all jobs from table: rms_import_details")
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                id,
                "JOB No.: 4S/AMP//20" as job_number,
                "Name of the Importer" as importer,
                "Vessel Name" as vessel_name,
                "HAWB BL No." as bl_number,
                "Documents Received on" as eta,
                "Bill of Entry No." as bill_of_entry,
                "Cleared on" as cleared_date,
                "Remarks" as remarks
            FROM rms_import_details
            ORDER BY id DESC
        """)
        
        columns = [desc[0] for desc in cursor.description]
        jobs = []
        
        for row in cursor.fetchall():
            job_dict = dict(zip(columns, row))
            for key, value in job_dict.items():
                if isinstance(value, (date, datetime)):
                    job_dict[key] = value.isoformat()
            jobs.append(job_dict)
        
        return {"jobs": jobs, "count": len(jobs)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch jobs: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.post("/jobs", response_model=JobResponse)
def create_job(job: JobCreate):
    """Create a new import job."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        job_number = generate_job_number(cursor)
        
        try:
            eta_date = datetime.strptime(job.eta, "%Y-%m-%d").date()
        except ValueError:
            eta_date = None
        
        insert_query = """
            INSERT INTO rms_import_details (
                "JOB No.: 4S/AMP//20",
                "Name of the Importer",
                "Vessel Name",
                "HAWB BL No.",
                "Documents Received on",
                "No. of Cartons",
                "Weight",
                "Remarks"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """
        
        cursor.execute(insert_query, (
            job_number,
            job.importer,
            job.vessel_name or job.origin,
            job.bl_number,
            eta_date,
            job.num_cartons,
            job.weight,
            f"Port: {job.port}, Container: {job.container_number or 'TBD'}"
        ))
        
        new_id = cursor.fetchone()[0]
        conn.commit()
        
        return JobResponse(
            id=new_id,
            job_number=job_number,
            importer=job.importer,
            port=job.port,
            status="created",
            message=f"Job {job_number} created successfully"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.get("/jobs/{job_id}")
def get_job(job_id: int):
    """Get a specific job by ID with documents."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # 1. Fetch Job Details
        cursor.execute("SELECT * FROM rms_import_details WHERE id = %s", (job_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")
        
        columns = [desc[0] for desc in cursor.description]
        job_dict = dict(zip(columns, row))
        
        for key, value in job_dict.items():
            if isinstance(value, (date, datetime)):
                job_dict[key] = value.isoformat()
        
        # 2. Fetch Documents
        try:
            cursor.execute("""
                SELECT id, name, status, source, uploaded_at 
                FROM job_documents 
                WHERE job_id = %s
            """, (job_id,))
            
            docs = []
            doc_columns = ['id', 'name', 'status', 'source', 'uploaded_at']
            for doc_row in cursor.fetchall():
                d = dict(zip(doc_columns, doc_row))
                if d['uploaded_at']:
                    d['uploadedAt'] = d['uploaded_at'].isoformat() # Frontend expects camelCase
                del d['uploaded_at']
                docs.append(d)
                
            job_dict['documents'] = docs
        except Exception as e:
            print(f"Warning: Could not fetch documents: {e}")
            job_dict['documents'] = []

        # 3. Fetch Entry Details
        try:
            cursor.execute("SELECT * FROM job_entries WHERE job_id = %s", (job_id,))
            entry_row = cursor.fetchone()
            
            if entry_row:
                entry_columns = [desc[0] for desc in cursor.description]
                entry_data = dict(zip(entry_columns, entry_row))
                
                # Check mapping for frontend (snake_case DB -> camelCase Frontend)
                job_dict['entryDetails'] = {
                    'entryNumber': entry_data.get('entry_number'),
                    'entryDate': entry_data.get('entry_date').isoformat() if isinstance(entry_data.get('entry_date'), (date, datetime)) else entry_data.get('entry_date'),
                    'portOfEntry': entry_data.get('port_of_entry'),
                    'modeOfTransport': entry_data.get('mode_of_transport'),
                    'importerOfRecord': entry_data.get('importer_of_record'),
                    'consignee': entry_data.get('consignee'),
                    'vesselName': entry_data.get('vessel_name'),
                    'voyageNumber': entry_data.get('voyage_number'),
                    'arrivalDate': entry_data.get('arrival_date').isoformat() if isinstance(entry_data.get('arrival_date'), (date, datetime)) else entry_data.get('arrival_date'),
                    'billOfLading': entry_data.get('bill_of_lading'),
                    'containerNumber': entry_data.get('container_number'),
                    'hsCode': entry_data.get('hs_code'),
                    'description': entry_data.get('description'),
                    'quantity': entry_data.get('quantity'),
                    'declaredValue': entry_data.get('declared_value'),
                    'dutyRate': entry_data.get('duty_rate'),
                    'estimatedDuty': entry_data.get('estimated_duty'),
                    'hmfMpf': entry_data.get('hmf_mpf'),
                    'totalEstimate': entry_data.get('total_estimate')
                }
            else:
                job_dict['entryDetails'] = {}
        except Exception as e:
            print(f"Warning: Could not fetch entry details: {e}")
            job_dict['entryDetails'] = {}

        return {"job": job_dict}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch job: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.put("/jobs/{job_id}")
def update_job(job_id: int, job: JobCreate):
    """Update an existing job."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        try:
            eta_date = datetime.strptime(job.eta, "%Y-%m-%d").date()
        except ValueError:
            eta_date = None
        
        update_query = """
            UPDATE rms_import_details SET
                "Name of the Importer" = %s,
                "Vessel Name" = %s,
                "HAWB BL No." = %s,
                "Documents Received on" = %s,
                "No. of Cartons" = %s,
                "Weight" = %s,
                "Remarks" = %s
            WHERE id = %s
            RETURNING id, "JOB No.: 4S/AMP//20";
        """
        
        cursor.execute(update_query, (
            job.importer,
            job.vessel_name or job.origin,
            job.bl_number,
            eta_date,
            job.num_cartons,
            job.weight,
            f"Port: {job.port}, Container: {job.container_number or 'TBD'}",
            job_id
        ))
        
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")
        
        conn.commit()
        return {"id": result[0], "job_number": result[1], "message": "Job updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update job: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.delete("/jobs/{job_id}")
def delete_job(job_id: int):
    """Delete a job by ID."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM rms_import_details WHERE id = %s RETURNING id", (job_id,))
        deleted = cursor.fetchone()
        
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")
        
        conn.commit()
        return {"message": f"Job {job_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete job: {str(e)}")
    finally:
        if conn:
            release_connection(conn)
