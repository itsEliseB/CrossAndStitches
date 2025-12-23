# Backend Dockerfile
# This defines how to build the Python backend container

# Start with official Python image (slim version = smaller size)
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Install system dependencies needed for image processing
# Pillow (Python image library) needs these
RUN apt-get update && apt-get install -y \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (Docker caches this layer if requirements don't change)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY . .

# Create uploads directory for user images
RUN mkdir -p /app/uploads

# Expose port 8000 (FastAPI default)
EXPOSE 8000

# Command to run the application (can be overridden in docker-compose.yml)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
