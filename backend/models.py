"""
Database Models
Defines the structure of your database tables using SQLAlchemy ORM
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """
    User Model - stores user account information
    Table name: users
    """
    __tablename__ = "users"

    # Primary key - unique ID for each user
    id = Column(Integer, primary_key=True, index=True)

    # User credentials
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)  # Never store plain passwords!

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Account status
    is_active = Column(Boolean, default=True)

    # Relationship: One user has many designs
    # This lets you do: user.designs to get all designs for a user
    designs = relationship("Design", back_populates="owner", cascade="all, delete-orphan")


class Design(Base):
    """
    Design Model - stores cross-stitch pattern designs
    Table name: designs
    """
    __tablename__ = "designs"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Design metadata
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Design dimensions
    width = Column(Integer, nullable=False)   # Grid width in stitches
    height = Column(Integer, nullable=False)  # Grid height in stitches

    # Design data - stored as JSON string
    # Contains grid data: colors for each cell
    # Example: {"grid": [[{"color": "#FF0000"}, ...], ...], "palette": ["#FF0000", ...]}
    design_data = Column(Text, nullable=False)

    # Optional: Store generated image path
    thumbnail_path = Column(String, nullable=True)

    # Foreign key - links to User table
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship: Design belongs to one user
    owner = relationship("User", back_populates="designs")


# When you run the application, these models will create tables in PostgreSQL:
#
# users table:
# +----+------------+----------+------------------+------------+------------+-----------+
# | id | email      | username | hashed_password  | created_at | updated_at | is_active |
# +----+------------+----------+------------------+------------+------------+-----------+
#
# designs table:
# +----+-------+-------------+-------+--------+-------------+----------------+----------+------------+------------+
# | id | title | description | width | height | design_data | thumbnail_path | owner_id | created_at | updated_at |
# +----+-------+-------------+-------+--------+-------------+----------------+----------+------------+------------+
