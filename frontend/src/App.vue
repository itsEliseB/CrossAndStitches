<!--
  Root Application Component
  This is the top-level component that wraps the entire app
-->

<template>
  <div id="app">
    <!-- Navigation Bar (hidden on designer routes) -->
    <nav v-if="!isDesignerRoute" class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          ✂️ Cross-Stitch Designer
        </router-link>

        <div class="nav-links">
          <template v-if="authStore.isAuthenticated">
            <!-- Logged in: show design links -->
            <router-link to="/designs" class="nav-link">My Designs</router-link>
            <router-link to="/designs/new" class="nav-link">Create New</router-link>
            <router-link to="/import" class="nav-link">Import Image</router-link>
            <span class="nav-user">{{ authStore.user?.username }}</span>
            <button @click="handleLogout" class="nav-button">Logout</button>
          </template>

          <template v-else>
            <!-- Not logged in: show auth links -->
            <router-link to="/login" class="nav-link">Login</router-link>
            <router-link to="/register" class="nav-link">Register</router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- Main Content Area -->
    <!-- router-view renders the current page component -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter, useRoute } from 'vue-router'

// Access stores and router
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Check if current route is designer/editor
const isDesignerRoute = computed(() => {
  return route.path.includes('/designs/new') || route.path.includes('/edit')
})

// Handle logout
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Check if user is logged in on app start
authStore.checkAuth()
</script>

<style>
/* Navigation Bar Styles */
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}

.nav-brand:hover {
  opacity: 0.9;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}

.nav-link:hover {
  opacity: 0.8;
}

.nav-user {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.nav-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Main Content Area */
.main-content {
  margin: 0;
  padding: 0 ;
}
</style>
