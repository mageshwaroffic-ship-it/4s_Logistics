"""
Centralized Configuration for 4S Logistics
===========================================
Change ENVIRONMENT to switch between 'development' and 'production'.
All URLs and settings will automatically update across the application.

NOTE: Frontend and Backend run on the SAME URL/PORT.
- Frontend: http://localhost:8000/
- API: http://localhost:8000/api/
"""

import os

# ============================================================
# ENVIRONMENT SETTING - Change this to switch environments
# Options: 'development' or 'production'
# ============================================================
ENVIRONMENT = os.getenv("APP_ENV", "development")


# ============================================================
# ENVIRONMENT-SPECIFIC CONFIGURATIONS
# ============================================================

CONFIGS = {
    "development": {
        # Application URL (same for frontend and API)
        "APP_URL": "http://localhost:8000",
        "APP_HOST": "0.0.0.0",
        "APP_PORT": 8000,
        
        # API prefix (all API routes start with this)
        "API_PREFIX": "/api",
        
        # Database
        "DB_HOST": "103.14.121.15",
        "DB_PORT": 5432,
        "DB_NAME": "4s_logistics ",  # Note: has trailing space
        "DB_USER": "sql_developer",
        "DB_PASSWORD": "Dev@123",
        
        # CORS allowed origins
        "CORS_ORIGINS": [
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "http://localhost:8080",  # For dev server if separate
            "http://localhost:5173",
        ],
        
        # Debug mode
        "DEBUG": True,
        "RELOAD": True,
    },
    
    "production": {
        # Application URL - UPDATE FOR PRODUCTION
        "APP_URL": "https://4slogistics.com",  # Single URL for everything
        "APP_HOST": "0.0.0.0",
        "APP_PORT": 8000,
        
        # API prefix
        "API_PREFIX": "/api",
        
        # Database - UPDATE FOR PRODUCTION
        "DB_HOST": "103.14.121.15",
        "DB_PORT": 5432,
        "DB_NAME": "4s_logistics ",
        "DB_USER": "sql_developer",
        "DB_PASSWORD": "Dev@123",
        
        # CORS allowed origins - UPDATE FOR PRODUCTION
        "CORS_ORIGINS": [
            "https://4slogistics.com",
            "https://www.4slogistics.com",
        ],
        
        # Debug mode
        "DEBUG": False,
        "RELOAD": False,
    }
}


# ============================================================
# GET CURRENT CONFIGURATION
# ============================================================

def get_config():
    """Get the configuration for the current environment."""
    return CONFIGS.get(ENVIRONMENT, CONFIGS["development"])


# Current configuration
config = get_config()


# ============================================================
# HELPER ACCESSORS - Use these in your code
# ============================================================

# Application URL (single URL for frontend and API)
APP_URL = config["APP_URL"]
API_HOST = config["APP_HOST"]
API_PORT = config["APP_PORT"]
API_PREFIX = config["API_PREFIX"]

# Full API URL
API_URL = f"{APP_URL}{API_PREFIX}"

# Database Settings
DB_CONFIG = {
    "host": config["DB_HOST"],
    "port": config["DB_PORT"],
    "database": config["DB_NAME"],
    "user": config["DB_USER"],
    "password": config["DB_PASSWORD"],
    "connect_timeout": 5,
}

# CORS Settings
CORS_ORIGINS = config["CORS_ORIGINS"]

# Debug Settings
DEBUG = config["DEBUG"]
RELOAD = config["RELOAD"]


# ============================================================
# PRINT CURRENT CONFIGURATION
# ============================================================

def print_config():
    """Print current configuration settings."""
    print("=" * 60)
    print(f"4S Logistics Configuration")
    print("=" * 60)
    print(f"Environment:  {ENVIRONMENT}")
    print(f"Application:  {APP_URL}")
    print(f"API Endpoint: {API_URL}")
    print(f"Database:     {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
    print(f"Debug:        {DEBUG}")
    print("=" * 60)


if __name__ == "__main__":
    print_config()
