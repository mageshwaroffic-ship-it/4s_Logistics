"""
File Upload Routes - Handle file uploads for documents
Structured folder system with Document AI integration for INCOTERM extraction
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import Optional
import os
import uuid
from datetime import datetime

router = APIRouter()

# Base upload folder path
UPLOAD_BASE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

# Subfolder mapping for document types
DOC_FOLDERS = {
    'bl': 'bl',                    # Bill of Lading
    'packing_list': 'pl',          # Packing List  
    'invoice': 'invoice',          # Invoice
    'freight': 'freight'           # Freight Payment (Arrival Notice / Freight Certificate)
}

# Ensure all folders exist
os.makedirs(UPLOAD_BASE, exist_ok=True)
for folder in DOC_FOLDERS.values():
    os.makedirs(os.path.join(UPLOAD_BASE, folder), exist_ok=True)


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    doc_type: str = Form(...),  # bl, packing_list, invoice, freight
    job_no: Optional[str] = Form(None)
):
    """
    Upload a file and return the file path.
    For packing_list uploads, also extracts INCOTERM using Document AI.
    For invoice uploads with extract_misc=true, extracts miscellaneous charges.
    """
    try:
        # Validate doc_type
        if doc_type not in DOC_FOLDERS:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid doc_type. Must be one of: {list(DOC_FOLDERS.keys())}"
            )
        
        # Validate file type
        allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx', '.tiff', '.tif']
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Get the target subfolder
        subfolder = DOC_FOLDERS[doc_type]
        target_folder = os.path.join(UPLOAD_BASE, subfolder)
        
        # Ensure folder exists
        os.makedirs(target_folder, exist_ok=True)
        
        # Create unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        
        if job_no:
            clean_job_no = job_no.replace("/", "_").replace("\\", "_")
            new_filename = f"{clean_job_no}_{timestamp}_{unique_id}{file_ext}"
        else:
            new_filename = f"{doc_type}_{timestamp}_{unique_id}{file_ext}"
        
        # Full file path
        file_path = os.path.join(target_folder, new_filename)
        
        # Save file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Relative path for database
        relative_path = f"uploads/{subfolder}/{new_filename}"
        
        # Base response
        response = {
            "success": True,
            "filename": new_filename,
            "original_filename": file.filename,
            "file_path": relative_path,
            "doc_type": doc_type,
            "folder": subfolder,
            "message": f"File uploaded to {subfolder}/ folder successfully"
        }
        
        # For Packing List - extract INCOTERM
        if doc_type == "packing_list":
            try:
                from services.document_ai import process_packing_list
                incoterm_result = process_packing_list(file_path)
                response["incoterm"] = incoterm_result
            except Exception as e:
                print(f"INCOTERM extraction error: {e}")
                response["incoterm"] = {
                    "detected": False,
                    "term": None,
                    "error": str(e)
                }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")


@router.post("/upload/extract-invoice")
async def extract_invoice_data(
    file: UploadFile = File(...),
    job_no: Optional[str] = Form(None),
    extract_misc: bool = Form(False)
):
    """
    Upload invoice and extract data (miscellaneous charges if requested).
    """
    try:
        # Validate file type
        allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx', '.tiff', '.tif']
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Save file
        target_folder = os.path.join(UPLOAD_BASE, "invoice")
        os.makedirs(target_folder, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        
        if job_no:
            clean_job_no = job_no.replace("/", "_").replace("\\", "_")
            new_filename = f"{clean_job_no}_{timestamp}_{unique_id}{file_ext}"
        else:
            new_filename = f"invoice_{timestamp}_{unique_id}{file_ext}"
        
        file_path = os.path.join(target_folder, new_filename)
        
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        relative_path = f"uploads/invoice/{new_filename}"
        
        response = {
            "success": True,
            "filename": new_filename,
            "original_filename": file.filename,
            "file_path": relative_path,
            "doc_type": "invoice",
            "folder": "invoice"
        }
        
        # Extract misc charges if requested
        if extract_misc:
            try:
                from services.document_ai import process_invoice
                invoice_result = process_invoice(file_path, extract_misc=True)
                response["misc_charges"] = invoice_result.get("misc_charges", 0)
            except Exception as e:
                print(f"Invoice extraction error: {e}")
                response["misc_charges"] = 0
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload invoice: {str(e)}")


@router.get("/uploads/{subfolder}/{filename}")
def get_file(subfolder: str, filename: str):
    """Serve an uploaded file."""
    try:
        if subfolder not in DOC_FOLDERS.values():
            raise HTTPException(status_code=404, detail="Invalid folder")
        
        file_path = os.path.join(UPLOAD_BASE, subfolder, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(file_path)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get file: {str(e)}")


@router.delete("/upload/{subfolder}/{filename}")
def delete_file(subfolder: str, filename: str):
    """Delete an uploaded file."""
    try:
        if subfolder not in DOC_FOLDERS.values():
            raise HTTPException(status_code=400, detail="Invalid folder")
        
        file_path = os.path.join(UPLOAD_BASE, subfolder, filename)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            return {"success": True, "message": f"File {filename} deleted from {subfolder}/"}
        else:
            raise HTTPException(status_code=404, detail="File not found")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
