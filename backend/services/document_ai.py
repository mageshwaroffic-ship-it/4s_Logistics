"""
Document AI Service - Extract INCOTERM and other data from documents
Uses Google Cloud Document AI for OCR and text extraction
"""

import os
import re
from google.cloud import documentai_v1 as documentai
from google.oauth2 import service_account

# Path to service account key
SERVICE_ACCOUNT_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "silken-obelisk-468109-i6-6cd0801ab952.json"
)

# Project configuration
PROJECT_ID = "silken-obelisk-468109-i6"
LOCATION = "us"  # or "eu"
PROCESSOR_ID = None  # Will use OCR processor

# INCOTERM patterns to search for
INCOTERMS = [
    "DAP", "CIF", "CFR", "C&F", "CNF", 
    "FOB", "EXW", "FCA", "FAS", "CPT", 
    "CIP", "DPU", "DDP", "DAT"
]

# INCOTERM categories for document requirements
INCOTERM_CATEGORIES = {
    # Category 1: Basic documents only (BL, Invoice, PL)
    "basic": ["DAP", "CIF"],
    
    # Category 2: Basic + Misc charges from invoice (BL, Invoice, PL)
    "with_misc": ["CFR", "C&F", "CNF"],
    
    # Category 3: Basic + Misc charges + Freight Payment (BL, Invoice, PL, Freight)
    "with_freight": ["FOB", "EXW", "FCA"]
}


def get_document_ai_client():
    """Get authenticated Document AI client."""
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE
    )
    return documentai.DocumentProcessorServiceClient(credentials=credentials)


def extract_text_from_document(file_path: str) -> str:
    """
    Extract text from a document using Google Cloud Document AI.
    Falls back to simple text extraction if Document AI is not configured.
    """
    try:
        # Read file
        with open(file_path, "rb") as f:
            file_content = f.read()
        
        # Determine MIME type
        ext = os.path.splitext(file_path)[1].lower()
        mime_types = {
            ".pdf": "application/pdf",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".tiff": "image/tiff",
            ".tif": "image/tiff",
        }
        mime_type = mime_types.get(ext, "application/pdf")
        
        # Try Document AI OCR
        try:
            client = get_document_ai_client()
            
            # Use OCR processor endpoint
            # Format: projects/{project}/locations/{location}/processors/{processor}
            # For basic OCR, we can use the raw document processing
            
            raw_document = documentai.RawDocument(
                content=file_content,
                mime_type=mime_type
            )
            
            # Create request - using inline processing (no processor needed for basic OCR)
            # Note: For production, you should create a processor in Document AI console
            request = documentai.ProcessRequest(
                name=f"projects/{PROJECT_ID}/locations/{LOCATION}/processors/pretrained-ocr-v2.0-2021-04-02",
                raw_document=raw_document
            )
            
            result = client.process_document(request=request)
            return result.document.text
            
        except Exception as e:
            print(f"Document AI error (will use fallback): {e}")
            # Fall back to simple text for testing
            return extract_text_fallback(file_content, ext)
            
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""


def extract_text_fallback(file_content: bytes, ext: str) -> str:
    """Fallback text extraction for testing."""
    # For PDFs, try to extract embedded text
    if ext == ".pdf":
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=file_content, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            return text
        except:
            pass
    return ""


def find_incoterm(text: str) -> dict:
    """
    Find INCOTERM in extracted text.
    Returns dict with term, category, and required documents.
    """
    text_upper = text.upper()
    
    detected_term = None
    
    # Search for INCOTERM patterns
    for term in INCOTERMS:
        # Look for term with word boundaries
        pattern = r'\b' + re.escape(term) + r'\b'
        if re.search(pattern, text_upper):
            detected_term = term
            break
    
    # Also check for common variations
    if not detected_term:
        if "C & F" in text_upper or "C AND F" in text_upper:
            detected_term = "C&F"
        elif "EX-WORKS" in text_upper or "EX WORKS" in text_upper:
            detected_term = "EXW"
        elif "COST AND FREIGHT" in text_upper:
            detected_term = "CFR"
        elif "COST INSURANCE FREIGHT" in text_upper:
            detected_term = "CIF"
        elif "FREE ON BOARD" in text_upper:
            detected_term = "FOB"
        elif "FREE CARRIER" in text_upper:
            detected_term = "FCA"
    
    if not detected_term:
        return {
            "detected": False,
            "term": None,
            "category": None,
            "required_docs": ["bl", "invoice", "pl"],
            "needs_freight": False,
            "extract_misc": False
        }
    
    # Determine category
    category = "basic"
    needs_freight = False
    extract_misc = False
    
    if detected_term in INCOTERM_CATEGORIES["with_freight"]:
        category = "with_freight"
        needs_freight = True
        extract_misc = True
    elif detected_term in INCOTERM_CATEGORIES["with_misc"]:
        category = "with_misc"
        extract_misc = True
    
    # Determine required documents
    required_docs = ["bl", "invoice", "pl"]
    if needs_freight:
        required_docs.append("freight")
    
    return {
        "detected": True,
        "term": detected_term,
        "category": category,
        "required_docs": required_docs,
        "needs_freight": needs_freight,
        "extract_misc": extract_misc
    }


def extract_misc_charges(text: str) -> float:
    """
    Extract miscellaneous charges amount from invoice text.
    Returns the amount found, or 0 if not found.
    """
    text_upper = text.upper()
    
    # Common patterns for misc charges
    patterns = [
        r'MISCELLANEOUS\s*(?:CHARGES?)?\s*[:\-]?\s*(?:USD|INR|RS\.?)?\s*([\d,]+\.?\d*)',
        r'MISC\.?\s*(?:CHARGES?)?\s*[:\-]?\s*(?:USD|INR|RS\.?)?\s*([\d,]+\.?\d*)',
        r'OTHER\s*CHARGES?\s*[:\-]?\s*(?:USD|INR|RS\.?)?\s*([\d,]+\.?\d*)',
        r'ADDITIONAL\s*CHARGES?\s*[:\-]?\s*(?:USD|INR|RS\.?)?\s*([\d,]+\.?\d*)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text_upper)
        if match:
            try:
                amount_str = match.group(1).replace(",", "")
                return float(amount_str)
            except:
                pass
    
    return 0.0


def process_packing_list(file_path: str) -> dict:
    """
    Process a packing list document:
    1. Extract text using Document AI
    2. Find INCOTERM
    3. Return results with document requirements
    """
    text = extract_text_from_document(file_path)
    incoterm_result = find_incoterm(text)
    
    return {
        "text_extracted": len(text) > 0,
        "text_length": len(text),
        **incoterm_result
    }


def process_invoice(file_path: str, extract_misc: bool = False) -> dict:
    """
    Process an invoice document:
    1. Extract text using Document AI
    2. If extract_misc is True, find miscellaneous charges
    """
    text = extract_text_from_document(file_path)
    
    result = {
        "text_extracted": len(text) > 0,
        "text_length": len(text),
    }
    
    if extract_misc:
        result["misc_charges"] = extract_misc_charges(text)
    
    return result
