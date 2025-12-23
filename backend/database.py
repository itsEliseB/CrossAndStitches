"""
Database Configuration
Connects to PostgreSQL and provides database session management
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Get database URL from environment variable
# Format: postgresql://username:password@host:port/database_name
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://crossstitch:dev_password_123@database:5432/crossstitch_db")

# Create database engine
# This manages the connection pool to the database
engine = create_engine(
    DATABASE_URL,
    # Echo SQL queries to console (helpful for learning/debugging)
    echo=True,
    # Connection pool settings
    pool_pre_ping=True,  # Verify connections before using them
)

# Create a SessionLocal class
# Each instance is a database session (like a conversation with the database)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all database models
# All your models (User, Design, etc.) will inherit from this
Base = declarative_base()


# Dependency function for FastAPI routes
# This provides a database session to each request and closes it when done
def get_db():
    """
    Creates a new database session for each request
    Automatically closes it when the request is complete

    Usage in FastAPI:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            # db is your database session here
    """
    db = SessionLocal()
    try:
        yield db  # Provide session to the route
    finally:
        db.close()  # Always close session when done
