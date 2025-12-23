"""
Design Management Routes
CRUD operations for cross-stitch designs
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter()


@router.post("/", response_model=schemas.DesignResponse, status_code=status.HTTP_201_CREATED)
def create_design(
    design_data: schemas.DesignCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new design

    Requires authentication

    Example request:
        POST /designs
        Headers: Authorization: Bearer <token>
        {
            "title": "My First Pattern",
            "description": "A simple heart pattern",
            "width": 50,
            "height": 50,
            "design_data": "{\"grid\":[[\"#FF0000\", ...]], \"palette\":[\"#FF0000\"]}"
        }
    """

    new_design = models.Design(
        title=design_data.title,
        description=design_data.description,
        width=design_data.width,
        height=design_data.height,
        design_data=design_data.design_data,
        owner_id=current_user.id
    )

    db.add(new_design)
    db.commit()
    db.refresh(new_design)

    return new_design


@router.get("/", response_model=List[schemas.DesignResponse])
def get_my_designs(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all designs for current user

    Requires authentication

    Query parameters:
        - skip: Number of records to skip (for pagination)
        - limit: Maximum number of records to return

    Example request:
        GET /designs?skip=0&limit=20
        Headers: Authorization: Bearer <token>
    """

    designs = db.query(models.Design)\
        .filter(models.Design.owner_id == current_user.id)\
        .order_by(models.Design.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

    return designs


@router.get("/{design_id}", response_model=schemas.DesignResponse)
def get_design(
    design_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific design by ID

    Requires authentication
    User can only access their own designs
    """

    design = db.query(models.Design).filter(models.Design.id == design_id).first()

    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design not found"
        )

    # Check ownership
    if design.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this design"
        )

    return design


@router.put("/{design_id}", response_model=schemas.DesignResponse)
def update_design(
    design_id: int,
    design_data: schemas.DesignUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a design

    Requires authentication
    User can only update their own designs

    Example request:
        PUT /designs/1
        Headers: Authorization: Bearer <token>
        {
            "title": "Updated Title",
            "design_data": "{...new data...}"
        }
    """

    design = db.query(models.Design).filter(models.Design.id == design_id).first()

    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design not found"
        )

    # Check ownership
    if design.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this design"
        )

    # Update fields (only if provided)
    if design_data.title is not None:
        design.title = design_data.title
    if design_data.description is not None:
        design.description = design_data.description
    if design_data.width is not None:
        design.width = design_data.width
    if design_data.height is not None:
        design.height = design_data.height
    if design_data.design_data is not None:
        design.design_data = design_data.design_data

    db.commit()
    db.refresh(design)

    return design


@router.delete("/{design_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_design(
    design_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a design

    Requires authentication
    User can only delete their own designs

    Example request:
        DELETE /designs/1
        Headers: Authorization: Bearer <token>
    """

    design = db.query(models.Design).filter(models.Design.id == design_id).first()

    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design not found"
        )

    # Check ownership
    if design.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this design"
        )

    db.delete(design)
    db.commit()

    return None  # 204 No Content
