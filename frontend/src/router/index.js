/**
 * Vue Router Configuration
 * Defines all the routes (pages) in the application
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Import page components
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Designs from '../views/Designs.vue'
import Designer from '../views/Designer.vue'
import ImportImage from '../views/ImportImage.vue'

// Define routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false },
  },
  {
    path: '/designs',
    name: 'Designs',
    component: Designs,
    meta: { requiresAuth: true },
  },
  {
    path: '/designs/new',
    name: 'CreateDesign',
    component: Designer,
    meta: { requiresAuth: true },
  },
  {
    path: '/designs/:id/edit',
    name: 'EditDesign',
    component: Designer,
    meta: { requiresAuth: true },
  },
  {
    path: '/import',
    name: 'ImportImage',
    component: ImportImage,
    meta: { requiresAuth: true },
  },
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * Navigation Guard
 * Checks authentication before navigating to protected routes
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login page
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    // Allow navigation
    next()
  }
})

export default router
