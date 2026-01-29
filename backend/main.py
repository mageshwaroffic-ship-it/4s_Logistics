"""
4S Logistics Backend API - Main Entry Point
Serves both API and Frontend from the same URL/port
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os

# Import configuration
from config import (
    API_HOST, API_PORT, CORS_ORIGINS, 
    DEBUG, RELOAD, print_config, ENVIRONMENT
)

# Import routes
from routes.job import router as job_router
from routes.client import router as client_router
from routes.tenant import router as tenant_router
from routes.user import router as user_router
from routes.customer import router as customer_router
from routes.new_job import router as new_job_router
from routes.container import router as container_router
from routes.milestone import router as milestone_router
from routes.document import router as document_router
from routes.alert import router as alert_router
from routes.transport import router as transport_router
from routes.activity_log import router as activity_log_router
from routes.auth import router as auth_router
from routes.upload import router as upload_router

# Initialize FastAPI app
app = FastAPI(
    title="4S Logistics API",
    description="Backend API for 4S Logistics Customs Management System",
    version="1.0.0",
    docs_url="/api/docs",  # Move docs under /api
    redoc_url="/api/redoc"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers - all under /api prefix
# Legacy routes
app.include_router(job_router, prefix="/api", tags=["Jobs (Legacy)"])
app.include_router(client_router, prefix="/api", tags=["Clients (Legacy)"])

# New SaaS routes
app.include_router(tenant_router, prefix="/api", tags=["Tenants"])
app.include_router(user_router, prefix="/api", tags=["Users"])
app.include_router(customer_router, prefix="/api", tags=["Customers"])
app.include_router(new_job_router, prefix="/api", tags=["Jobs"])
app.include_router(container_router, prefix="/api", tags=["Containers"])
app.include_router(milestone_router, prefix="/api", tags=["Milestones"])
app.include_router(document_router, prefix="/api", tags=["Documents"])
app.include_router(alert_router, prefix="/api", tags=["Alerts"])
app.include_router(transport_router, prefix="/api", tags=["Transport"])
app.include_router(activity_log_router, prefix="/api", tags=["Activity Logs"])
app.include_router(auth_router, prefix="/api", tags=["Authentication"])
app.include_router(upload_router, prefix="/api", tags=["File Upload"])


# ============================================================
# API ROUTES
# ============================================================

@app.get("/api")
def api_root():
    """API root endpoint"""
    return {
        "name": "4S Logistics API",
        "version": "1.0.0",
        "status": "running",
        "environment": ENVIRONMENT,
        "docs": "/api/docs",
        "endpoints": {
            "jobs": "/api/jobs",
            "health": "/api/health"
        }
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint with database test"""
    from db_connection import test_connection
    db_status = test_connection()
    return {
        "status": "healthy" if db_status["status"] == "connected" else "degraded",
        "service": "4S Logistics API",
        "database": db_status
    }


# ============================================================
# STATIC FILES (Frontend) - Only in production or when built
# ============================================================

# Path to the built frontend
FRONTEND_BUILD_DIR = os.path.join(os.path.dirname(__file__), "..", "dist")

# Check if frontend build exists
if os.path.exists(FRONTEND_BUILD_DIR):
    # Serve static assets (js, css, images, etc.)
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_BUILD_DIR, "assets")), name="assets")
    
    # Serve other static files
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for all non-API routes"""
        print(f"🔍 Frontend Catch-all hit: '{full_path}'") # DEBUG
        
        # Don't serve frontend for API routes or Docs
        if full_path.startswith("api") or full_path.startswith("docs"):
            return {"error": "Not found (API/Docs)"}
        
        # Try to serve the requested file
        file_path = os.path.join(FRONTEND_BUILD_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # For all other routes, serve index.html (SPA routing)
        return FileResponse(os.path.join(FRONTEND_BUILD_DIR, "index.html"))
    
    print(f"📁 Serving frontend from: {FRONTEND_BUILD_DIR}")
else:
    # In development, just show a message
    @app.get("/")
    def root():
        return {
            "message": "4S Logistics API Server",
            "api_docs": "/api/docs",
            "note": "Frontend not built. Run 'npm run build' in customs-flow-showcase folder, or access frontend at its dev server URL.",
            "environment": ENVIRONMENT
        }


if __name__ == "__main__":
    print_config()
    print(f"\n🌐 Access the application at: http://localhost:{API_PORT}")
    print(f"📚 API Documentation at: http://localhost:{API_PORT}/api/docs")
    if not os.path.exists(FRONTEND_BUILD_DIR):
        print(f"⚠️  Frontend not built. Build with: cd customs-flow-showcase && npm run build")
    print()
    uvicorn.run("main:app", host=API_HOST, port=API_PORT, reload=RELOAD)
