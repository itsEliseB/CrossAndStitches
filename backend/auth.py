"""
Authentication Logic
Handles password hashing, JWT token creation/validation, and user verification
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os

from database import get_db
import models

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key_change_in_production")
ALGORITHM = "HS256"  # Hashing algorithm for JWT
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing context
# Uses bcrypt algorithm - very secure for passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme - tells FastAPI where to find the token
# Tokens will be in the Authorization header: "Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# ============= Password Functions =============

def hash_password(password: str) -> str:
    """
    Hash a plain text password
    Never store plain passwords in database!

    Example:
        hash_password("mypassword123")
        # Returns: "$2b$12$KIXxF..."
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash
    Returns True if password matches, False otherwise

    Example:
        verify_password("mypassword123", stored_hash)
        # Returns: True if correct, False if wrong
    """
    return pwd_context.verify(plain_password, hashed_password)


# ============= JWT Token Functions =============

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token

    Args:
        data: Dictionary of data to encode (usually user_id, email)
        expires_delta: How long token is valid (default: 7 days)

    Returns:
        JWT token string

    Example:
        token = create_access_token({"sub": "user@example.com", "user_id": 1})
    """
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    # Encode the JWT
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT token

    Args:
        token: JWT token string

    Returns:
        Dictionary of token data if valid, None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ============= User Authentication =============

def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    """
    Verify user credentials

    Args:
        db: Database session
        email: User's email
        password: Plain text password

    Returns:
        User object if credentials are valid, None otherwise
    """
    # Find user by email
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        return None  # User doesn't exist

    if not verify_password(password, user.hashed_password):
        return None  # Wrong password

    if not user.is_active:
        return None  # Account disabled

    return user


# ============= Dependency for Protected Routes =============

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Dependency that validates JWT token and returns current user
    Use this to protect routes that require authentication

    Usage:
        @app.get("/protected")
        def protected_route(current_user: User = Depends(get_current_user)):
            # This route requires valid JWT token
            # current_user is the authenticated user
            return {"message": f"Hello {current_user.username}"}

    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode token
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    # Extract user ID from token
    user_id: int = payload.get("user_id")
    if user_id is None:
        raise credentials_exception

    # Get user from database
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user


# Optional: Dependency for optional authentication
async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[models.User]:
    """
    Like get_current_user but doesn't raise error if no token
    Useful for routes that work for both logged in and anonymous users
    """
    if not token:
        return None

    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None
