"""
Main FastAPI Application
Entry point for the backend API server
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import database setup
from database import engine, Base
import models

# Import routers
from routers import auth, designs, images

# Create database tables
# This runs when the app starts and creates tables if they don't exist
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables created!")

# Create FastAPI app instance
app = FastAPI(
    title="Cross-Stitch Pattern Generator API",
    description="API for creating and managing cross-stitch patterns",
    version="1.0.0",
)

# ============= CORS Configuration =============
# CORS = Cross-Origin Resource Sharing
# Allows your Vue.js frontend (different port) to call this API

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vue.js dev server
        "http://localhost:3000",  # Alternative frontend port
        "http://frontend:5173",   # Docker container name
    ],
    allow_credentials=True,  # Allow cookies
    allow_methods=["*"],      # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],      # Allow all headers
)

# ============= Static Files =============
# Serve uploaded images
uploads_dir = "/app/uploads"
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# ============= Include Routers =============
# Each router handles a different part of the API

# Authentication routes (register, login)
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Design management routes (CRUD operations)
app.include_router(designs.router, prefix="/designs", tags=["Designs"])

# Image processing routes (upload, pixelate)
app.include_router(images.router, prefix="/images", tags=["Image Processing"])


# ============= Root Endpoint =============
@app.get("/")
def read_root():
    """
    Root endpoint - API health check
    Visit http://localhost:8000 to see this
    """
    return {
        "message": "Cross-Stitch Pattern Generator API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",  # FastAPI auto-generates API documentation
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint
    Used by Docker to verify service is running
    """
    return {"status": "healthy"}


# ============= API Documentation =============
# FastAPI automatically generates interactive API docs
# Visit these URLs when server is running:
#   - http://localhost:8000/docs  (Swagger UI)
#   - http://localhost:8000/redoc (ReDoc)

# ============= Running the Application =============
# This file is run by uvicorn (specified in docker-compose.yml):
#   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
#
# --reload = automatically restart when code changes (dev mode)
