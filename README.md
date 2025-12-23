# Cross-Stitch Pattern Generator

A full-stack web application for creating and managing cross-stitch patterns. Draw patterns on a grid or import images to convert them into cross-stitch designs.

## Features

- 🎨 **Grid Drawing Tool**: Create custom patterns with an interactive grid editor
- 📸 **Image Import**: Upload photos and automatically convert them to cross-stitch patterns
- 💾 **Design Management**: Save, edit, and organize your patterns
- 👤 **User Accounts**: Secure authentication to store your personal designs
- 🎨 **Color Palette**: Work with a curated palette of cross-stitch thread colors
- 🐳 **Docker Containerized**: Easy setup with Docker - no manual installations needed

## Technology Stack

### Backend
- **Python 3.11** - Programming language
- **FastAPI** - Modern web framework for building APIs
- **PostgreSQL** - Database for storing users and designs
- **SQLAlchemy** - Database ORM (Object Relational Mapper)
- **Pillow** - Image processing library
- **JWT** - Secure authentication tokens

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and dev server
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Canvas API** - For grid drawing and rendering

### Infrastructure
- **Docker** - Containerization
- **docker-compose** - Multi-container orchestration

## Prerequisites

You only need to install:

1. **Docker Desktop** (includes docker-compose)
   - Download from: https://www.docker.com/products/docker-desktop/
   - For Linux, also install docker-compose separately

That's it! Docker will handle everything else.

## Quick Start

### 1. Clone or navigate to the project directory

```bash
cd cross-and-square
```

### 2. Start the application

```bash
docker-compose up
```

The first time you run this, it will:
- Download Docker images (Python, Node.js, PostgreSQL)
- Install all dependencies
- Build the containers
- Start all services

This may take 5-10 minutes the first time. Subsequent starts are much faster!

### 3. Access the application

Once you see "Application startup complete", open your browser to:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (interactive Swagger UI)

### 4. Create an account

1. Go to http://localhost:5173
2. Click "Register"
3. Create your account
4. Start creating patterns!

## Usage Guide

### Creating a Pattern from Scratch

1. Log in to your account
2. Click "Create New" in the navigation
3. Set your grid size (e.g., 30×30)
4. Select a color from the palette
5. Click on the grid to draw
6. Use the eraser tool to remove pixels
7. Save your design with a title

### Importing an Image

1. Log in to your account
2. Click "Import Image" in the navigation
3. Upload a photo (JPG, PNG, etc.)
4. Set the pattern dimensions (e.g., 50×50 stitches)
5. Choose number of colors (fewer = simpler pattern)
6. Click "Convert to Pattern"
7. Preview the result and save

### Managing Your Designs

- View all your designs in "My Designs"
- Click "Edit" to modify a saved pattern
- Click "Delete" to remove a design
- All designs are private to your account

## Development

### Project Structure

```
cross-and-square/
├── docker-compose.yml          # Defines all containers
├── .env                        # Environment variables (passwords, etc.)
│
├── backend/                    # Python FastAPI backend
│   ├── Dockerfile             # Backend container definition
│   ├── requirements.txt       # Python dependencies
│   ├── main.py               # Application entry point
│   ├── database.py           # Database configuration
│   ├── models.py             # Database models (User, Design)
│   ├── schemas.py            # API request/response schemas
│   ├── auth.py               # Authentication logic
│   ├── image_processor.py    # Image processing utilities
│   └── routers/              # API endpoints
│       ├── auth.py           # /auth/* endpoints
│       ├── designs.py        # /designs/* endpoints
│       └── images.py         # /images/* endpoints
│
└── frontend/                  # Vue.js 3 frontend
    ├── Dockerfile            # Frontend container definition
    ├── package.json          # Node.js dependencies
    ├── vite.config.js        # Build tool configuration
    ├── index.html            # HTML entry point
    └── src/
        ├── main.js           # Vue application entry
        ├── App.vue           # Root component
        ├── router/           # Route definitions
        ├── stores/           # Pinia state management
        ├── api/              # API client
        ├── views/            # Page components
        └── components/       # Reusable components
```

### Common Docker Commands

```bash
# Start all containers
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Stop all containers
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild containers (after changing dependencies)
docker-compose up --build

# Reset everything (including database)
docker-compose down -v
```

### Making Changes to Code

The application uses **hot reload** - your code changes are automatically detected:

- **Backend**: Edit files in `backend/`, the server restarts automatically
- **Frontend**: Edit files in `frontend/src/`, the page updates automatically

You don't need to rebuild containers for code changes!

### Accessing the Database

The PostgreSQL database is exposed on port 5432. You can connect using:

- **Host**: localhost
- **Port**: 5432
- **Database**: crossstitch_db
- **Username**: crossstitch
- **Password**: dev_password_123 (from .env file)

Tools you can use:
- pgAdmin: https://www.pgadmin.org/
- DBeaver: https://dbeaver.io/
- Command line: `psql -h localhost -U crossstitch -d crossstitch_db`

### API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
  - Interactive API explorer
  - Try out endpoints directly in the browser
  - See request/response schemas

- **ReDoc**: http://localhost:8000/redoc
  - Alternative documentation format
  - Better for reading/learning

## Troubleshooting

### Port Already in Use

If you see "port is already allocated":

```bash
# Check what's using the port
sudo lsof -i :5173   # Frontend port
sudo lsof -i :8000   # Backend port
sudo lsof -i :5432   # Database port

# Stop docker-compose and try again
docker-compose down
docker-compose up
```

### Database Connection Errors

```bash
# Wait for database to be ready (it takes a few seconds)
# Check database logs
docker-compose logs database

# Reset database
docker-compose down -v  # Warning: deletes all data!
docker-compose up
```

### Frontend Can't Connect to Backend

Check the backend logs:
```bash
docker-compose logs backend
```

Make sure CORS is properly configured in `backend/main.py`.

### Changes Not Appearing

```bash
# Rebuild containers
docker-compose up --build

# Clear Docker cache
docker-compose down
docker system prune -a  # Warning: removes all unused Docker data
docker-compose up --build
```

## Security Notes

⚠️ **This is a development setup**. For production deployment:

1. Change all passwords in `.env`
2. Use a strong `SECRET_KEY`
3. Set up HTTPS
4. Use environment-specific configurations
5. Add rate limiting
6. Implement proper backup strategy
7. Review and harden security settings

## Learning Resources

### Docker
- Docker Getting Started: https://docs.docker.com/get-started/
- docker-compose Tutorial: https://docs.docker.com/compose/gettingstarted/

### Backend (Python + FastAPI)
- FastAPI Documentation: https://fastapi.tiangolo.com/
- Python Tutorial: https://docs.python.org/3/tutorial/
- SQLAlchemy ORM: https://docs.sqlalchemy.org/

### Frontend (Vue.js)
- Vue.js 3 Guide: https://vuejs.org/guide/introduction.html
- Vue Router: https://router.vuejs.org/
- Pinia State Management: https://pinia.vuejs.org/

## License

This project is for educational purposes.

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Review the troubleshooting section above
3. Make sure Docker Desktop is running
4. Try rebuilding: `docker-compose up --build`

## Future Enhancements

Ideas for extending the application:

- [ ] Export patterns as PDF
- [ ] Print-friendly pattern sheets with symbols
- [ ] Color matching to DMC/Anchor thread codes
- [ ] Pattern sharing between users
- [ ] Pattern marketplace
- [ ] Mobile app version
- [ ] Collaborative editing
- [ ] Pattern complexity calculator
- [ ] Stitch counter / progress tracker

Enjoy creating cross-stitch patterns! 🧵✨
