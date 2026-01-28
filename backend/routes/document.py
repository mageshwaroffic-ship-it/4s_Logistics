"""
Document Routes - API endpoints for managing job documents
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from db_connection import get_connection, release_connection

router = APIRouter()


# ============== Pydantic Models ==============

class DocumentCreate(BaseModel):
    job_id: int = Field(..., description="Job ID")
    doc_type: str = Field(..., description="Document type: BL, Invoice, PackingList, BOE, EwayBill")
    file_url: str = Field(..., description="URL/path to the file")
    uploaded_by: Optional[int] = None


class DocumentUpdate(BaseModel):
    doc_type: Optional[str] = None
    file_url: Optional[str] = None


# ============== Routes ==============

@router.get("/documents", response_model=dict)
def get_all_documents(job_id: Optional[int] = None, doc_type: Optional[str] = None):
    """Get all documents, optionally filtered by job and type."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT d.id, d.job_id, d.doc_type, d.file_url, d.uploaded_by, d.uploaded_at, 
                   j.job_no, u.name as uploader_name
            FROM documents d
            JOIN jobs j ON d.job_id = j.id
            LEFT JOIN users u ON d.uploaded_by = u.id
            WHERE 1=1
        """
        params = []
        
        if job_id:
            query += " AND d.job_id = %s"
            params.append(job_id)
        if doc_type:
            query += " AND d.doc_type = %s"
            params.append(doc_type)
        
        query += " ORDER BY d.uploaded_at DESC"
        
        cursor.execute(query, tuple(params))
        
        documents = []
        columns = ['id', 'job_id', 'doc_type', 'file_url', 'uploaded_by', 'uploaded_at', 'job_no', 'uploader_name']
        
        for row in cursor.fetchall():
            doc = dict(zip(columns, row))
            if doc['uploaded_at']:
                doc['uploaded_at'] = doc['uploaded_at'].isoformat()
            documents.append(doc)
            
        return {"documents": documents, "count": len(documents)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.post("/documents", response_model=dict)
def create_document(document: DocumentCreate):
    """Upload/add a new document."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO documents (job_id, doc_type, file_url, uploaded_by) 
            VALUES (%s, %s, %s, %s) 
            RETURNING id, doc_type, uploaded_at
        """, (document.job_id, document.doc_type, document.file_url, document.uploaded_by))
        
        row = cursor.fetchone()
        conn.commit()
        
        return {
            "id": row[0], 
            "doc_type": row[1],
            "uploaded_at": row[2].isoformat() if row[2] else None,
            "message": "Document added successfully"
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        if "foreign key" in str(e).lower():
            raise HTTPException(status_code=400, detail="Job or User not found")
        raise HTTPException(status_code=500, detail=f"Failed to create document: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.get("/documents/{document_id}", response_model=dict)
def get_document(document_id: int):
    """Get a specific document."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT d.id, d.job_id, d.doc_type, d.file_url, d.uploaded_by, d.uploaded_at, 
                   j.job_no, u.name as uploader_name
            FROM documents d
            JOIN jobs j ON d.job_id = j.id
            LEFT JOIN users u ON d.uploaded_by = u.id
            WHERE d.id = %s
        """, (document_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
        
        columns = ['id', 'job_id', 'doc_type', 'file_url', 'uploaded_by', 'uploaded_at', 'job_no', 'uploader_name']
        doc = dict(zip(columns, row))
        if doc['uploaded_at']:
            doc['uploaded_at'] = doc['uploaded_at'].isoformat()
        
        return {"document": doc}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch document: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.put("/documents/{document_id}", response_model=dict)
def update_document(document_id: int, document: DocumentUpdate):
    """Update a document."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if document.doc_type: updates.append("doc_type = %s"); params.append(document.doc_type)
        if document.file_url: updates.append("file_url = %s"); params.append(document.file_url)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(document_id)
        
        cursor.execute(f"""
            UPDATE documents SET {', '.join(updates)} WHERE id = %s
            RETURNING id, doc_type
        """, tuple(params))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
        
        conn.commit()
        return {"id": row[0], "doc_type": row[1], "message": "Document updated"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update document: {str(e)}")
    finally:
        if conn:
            release_connection(conn)


@router.delete("/documents/{document_id}")
def delete_document(document_id: int):
    """Delete a document."""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM documents WHERE id = %s RETURNING id", (document_id,))
        deleted = cursor.fetchone()
        
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
        
        conn.commit()
        return {"message": f"Document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")
    finally:
        if conn:
            release_connection(conn)
