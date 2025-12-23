"""
Image Processing Routes
Handles image upload and conversion to cross-stitch patterns
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import json
import os
from typing import Optional

from database import get_db
import models
import schemas
from auth import get_current_user
from image_processor import (
    process_image_for_crossstitch,
    create_preview_image,
    map_to_thread_colors
)

router = APIRouter()

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@router.post("/upload", response_model=schemas.ImageProcessResponse)
async def upload_and_process_image(
    file: UploadFile = File(...),
    target_width: int = Form(...),
    target_height: int = Form(...),
    num_colors: int = Form(16),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload an image and convert it to a cross-stitch pattern

    Process:
    1. Validate file type and size
    2. Read image bytes
    3. Resize and quantize colors
    4. Return grid data and color palette

    Requires authentication

    Example usage (multipart/form-data):
        POST /images/upload
        Headers: Authorization: Bearer <token>
        Form data:
            file: [image file]
            target_width: 50
            target_height: 50
            num_colors: 16

    Returns:
        {
            "width": 50,
            "height": 50,
            "grid_data": "[[\"#FF0000\", ...], ...]",
            "palette": ["#FF0000", "#00FF00", ...],
            "preview_url": "/uploads/preview_123.png"
        }
    """

    # Validate file extension
    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read file content
    try:
        contents = await file.read()

        # Check file size
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024} MB"
            )

        # Validate dimensions
        if not (10 <= target_width <= 200 and 10 <= target_height <= 200):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Width and height must be between 10 and 200"
            )

        if not (2 <= num_colors <= 64):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Number of colors must be between 2 and 64"
            )

        # Process image
        grid_data, palette = process_image_for_crossstitch(
            contents,
            target_width,
            target_height,
            num_colors
        )

        # Create preview image
        preview_bytes = create_preview_image(grid_data, cell_size=10)

        # Save preview to uploads directory
        uploads_dir = "/app/uploads"
        os.makedirs(uploads_dir, exist_ok=True)

        preview_filename = f"preview_{current_user.id}_{os.urandom(8).hex()}.png"
        preview_path = os.path.join(uploads_dir, preview_filename)

        with open(preview_path, "wb") as f:
            f.write(preview_bytes)

        # Return processed data
        return {
            "width": target_width,
            "height": target_height,
            "grid_data": json.dumps(grid_data),
            "palette": palette,
            "preview_url": f"/uploads/{preview_filename}"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )


@router.post("/save-from-upload", response_model=schemas.DesignResponse)
async def save_design_from_upload(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    width: int = Form(...),
    height: int = Form(...),
    grid_data: str = Form(...),
    palette: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save a processed image as a design

    This is typically called after /upload to save the result

    Example:
        POST /images/save-from-upload
        Headers: Authorization: Bearer <token>
        Form data:
            title: "My Pattern"
            description: "From photo"
            width: 50
            height: 50
            grid_data: "[[\"#FF0000\", ...], ...]"
            palette: "[\"#FF0000\", \"#00FF00\"]"
    """

    # Create design data JSON
    design_data = json.dumps({
        "grid": json.loads(grid_data),
        "palette": json.loads(palette)
    })

    # Create design
    new_design = models.Design(
        title=title,
        description=description,
        width=width,
        height=height,
        design_data=design_data,
        owner_id=current_user.id
    )

    db.add(new_design)
    db.commit()
    db.refresh(new_design)

    return new_design
