/**
 * Authentication Store (Pinia)
 * Manages user authentication state
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../api/client'

export const useAuthStore = defineStore('auth', () => {
  // State (reactive data)
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed properties (derived state)
  const isAuthenticated = computed(() => !!token.value)

  /**
   * Check if user is already logged in (on app start)
   * Reads token and user from localStorage
   */
  function checkAuth() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  /**
   * Register a new user
   */
  async function register(userData) {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.register(userData)
      // After registration, automatically log in
      return await login({
        email: userData.email,
        password: userData.password,
      })
    } catch (err) {
      error.value = err.response?.data?.detail || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Login user
   */
  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.login(credentials)
      const { access_token, user: userData } = response.data

      // Save to state
      token.value = access_token
      user.value = userData

      // Save to localStorage (persist across page refreshes)
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))

      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout user
   */
  function logout() {
    // Clear state
    user.value = null
    token.value = null
    error.value = null

    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  /**
   * Update user profile
   */
  async function updateProfile(data) {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.updateProfile(data)
      user.value = response.data

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.data))

      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Profile update failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Return public API
  return {
    // State
    user,
    token,
    loading,
    error,

    // Computed
    isAuthenticated,

    // Actions
    checkAuth,
    register,
    login,
    logout,
    updateProfile,
  }
})
