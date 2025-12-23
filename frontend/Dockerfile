# Frontend Dockerfile
# This defines how to build the Vue.js frontend container

# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of application
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server
# Note: --host makes it accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host"]
