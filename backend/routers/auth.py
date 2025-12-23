"""
Authentication Routes
Handles user registration, login, and profile management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import (
    hash_password,
    authenticate_user,
    create_access_token,
    get_current_user
)

# Create router
router = APIRouter()


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account

    Process:
    1. Check if email already exists
    2. Check if username already exists
    3. Hash the password
    4. Create user in database
    5. Return user data (without password)

    Example request:
        POST /auth/register
        {
            "email": "user@example.com",
            "username": "user123",
            "password": "securepass"
        }
    """

    # Check if email already registered
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if username already taken
    existing_username = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Create new user
    new_user = models.User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # Get the ID and timestamps from database

    return new_user


@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Login and receive JWT token

    Process:
    1. Verify email and password
    2. Generate JWT token
    3. Return token and user data

    Example request:
        POST /auth/login
        {
            "email": "user@example.com",
            "password": "securepass"
        }

    Example response:
        {
            "access_token": "eyJhbGciOiJIUzI1NiIs...",
            "token_type": "bearer",
            "user": {
                "id": 1,
                "email": "user@example.com",
                "username": "user123",
                ...
            }
        }

    Use token in subsequent requests:
        Headers: Authorization: Bearer <access_token>
    """

    # Authenticate user
    user = authenticate_user(db, login_data.email, login_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create JWT token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    """
    Get current user's profile

    Requires authentication (JWT token)

    Example request:
        GET /auth/me
        Headers: Authorization: Bearer <token>

    Returns current user's data
    """
    return current_user


@router.put("/me", response_model=schemas.UserResponse)
def update_profile(
    username: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile
    (Currently only username update is supported)

    Requires authentication
    """

    # Check if new username is already taken by another user
    if username != current_user.username:
        existing = db.query(models.User).filter(
            models.User.username == username,
            models.User.id != current_user.id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

    current_user.username = username
    db.commit()
    db.refresh(current_user)

    return current_user
