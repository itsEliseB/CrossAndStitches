/**
 * API Client
 * Handles all HTTP requests to the backend API
 */

import axios from 'axios'

// Get API URL from environment variable (set in docker-compose.yml)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor
 * Automatically adds JWT token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')

    // Add token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor
 * Handles common error cases (like 401 Unauthorized)
 */
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // If 401 Unauthorized, clear token and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirect to login (you can also use Vue Router here)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// ============= Authentication API =============

export const authAPI = {
  /**
   * Register a new user
   */
  register(userData) {
    return apiClient.post('/auth/register', userData)
  },

  /**
   * Login user
   */
  login(credentials) {
    return apiClient.post('/auth/login', credentials)
  },

  /**
   * Get current user profile
   */
  getProfile() {
    return apiClient.get('/auth/me')
  },

  /**
   * Update user profile
   */
  updateProfile(data) {
    return apiClient.put('/auth/me', null, { params: data })
  },
}

// ============= Designs API =============

export const designsAPI = {
  /**
   * Get all designs for current user
   */
  getAll(skip = 0, limit = 100) {
    return apiClient.get('/designs', { params: { skip, limit } })
  },

  /**
   * Get a specific design by ID
   */
  getById(id) {
    return apiClient.get(`/designs/${id}`)
  },

  /**
   * Create a new design
   */
  create(designData) {
    return apiClient.post('/designs', designData)
  },

  /**
   * Update a design
   */
  update(id, designData) {
    return apiClient.put(`/designs/${id}`, designData)
  },

  /**
   * Delete a design
   */
  delete(id) {
    return apiClient.delete(`/designs/${id}`)
  },
}

// ============= Image Processing API =============

export const imagesAPI = {
  /**
   * Upload and process an image
   */
  upload(file, options) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('target_width', options.target_width)
    formData.append('target_height', options.target_height)
    formData.append('num_colors', options.num_colors || 16)

    return apiClient.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Save a processed image as a design
   */
  saveFromUpload(data) {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })

    return apiClient.post('/images/save-from-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export default apiClient
