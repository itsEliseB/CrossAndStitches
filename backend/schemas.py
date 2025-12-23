"""
Pydantic Schemas (Data Validation)
These define the shape of data for API requests and responses
Think of them as contracts: "This is what I expect to receive/send"
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List


# ============= User Schemas =============

class UserCreate(BaseModel):
    """
    Schema for creating a new user (registration)
    Used when someone signs up
    """
    email: EmailStr  # Validates email format
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    """
    Schema for user login
    """
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """
    Schema for user data in API responses
    Never includes password!
    """
    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime

    class Config:
        # Allows Pydantic to work with SQLAlchemy models
        from_attributes = True


class Token(BaseModel):
    """
    Schema for JWT token response
    Returned after successful login
    """
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ============= Design Schemas =============

class DesignCreate(BaseModel):
    """
    Schema for creating a new design
    """
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    width: int = Field(..., ge=1, le=500)  # ge=greater or equal, le=less or equal
    height: int = Field(..., ge=1, le=500)
    design_data: str  # JSON string containing grid data


class DesignUpdate(BaseModel):
    """
    Schema for updating a design
    All fields are optional (can update just title, or just design_data, etc.)
    """
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    width: Optional[int] = Field(None, ge=1, le=500)
    height: Optional[int] = Field(None, ge=1, le=500)
    design_data: Optional[str] = None


class DesignResponse(BaseModel):
    """
    Schema for design data in API responses
    """
    id: int
    title: str
    description: Optional[str]
    width: int
    height: int
    design_data: str
    thumbnail_path: Optional[str]
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class DesignList(BaseModel):
    """
    Schema for listing multiple designs
    """
    designs: List[DesignResponse]
    total: int


# ============= Image Processing Schemas =============

class ImageProcessRequest(BaseModel):
    """
    Schema for image processing request
    User uploads image and specifies target grid size
    """
    target_width: int = Field(..., ge=10, le=200)
    target_height: int = Field(..., ge=10, le=200)
    num_colors: int = Field(default=16, ge=2, le=64)  # How many colors to reduce to


class ImageProcessResponse(BaseModel):
    """
    Schema for processed image response
    Returns pixelated image data and color palette
    """
    width: int
    height: int
    grid_data: str  # JSON string: 2D array of color indices
    palette: List[str]  # List of hex colors used
    preview_url: Optional[str]  # URL to preview image


# Example of how these are used in FastAPI:
#
# @app.post("/users", response_model=UserResponse)
# def create_user(user: UserCreate, db: Session = Depends(get_db)):
#     # user is validated against UserCreate schema
#     # response is validated against UserResponse schema
#     ...
