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

          <!-- Theme toggle (always visible) -->
          <button @click="themeStore.toggleTheme" class="theme-toggle" :title="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'">
            <span v-if="themeStore.isDark">☀️</span>
            <span v-else>🌙</span>
          </button>
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
import { useThemeStore } from './stores/theme'
import { useRouter, useRoute } from 'vue-router'

// Access stores and router
const authStore = useAuthStore()
const themeStore = useThemeStore()
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
  background: var(--bg-elevated);
  color: var(--text-primary);
  padding: 1rem 0;
  box-shadow: var(--shadow-md);
  border-bottom: 1px solid var(--border-color-hover);
  backdrop-filter: blur(10px);
}

.nav-container {
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
  text-decoration: none;
  transition: opacity var(--transition-base);
}

.nav-brand:hover {
  opacity: 0.8;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: var(--text-primary);
  text-decoration: none;
  transition: opacity var(--transition-base);
  border: none;
  background: none;
  padding: 0;
}

.nav-link:hover {
  opacity: 0.7;
}

.nav-link.router-link-active {
  opacity: 1;
  font-weight: 600;
}

.nav-user {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.nav-button {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.nav-button:hover {
  background: var(--surface-hover);
  border-color: var(--border-color-hover);
}

/* Theme Toggle Button */
.theme-toggle {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: 1.2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
}

.theme-toggle:hover {
  background: var(--surface-hover);
  border-color: var(--border-color-hover);
  transform: scale(1.05);
}

/* Main Content Area */
.main-content {
  margin: 0;
  padding: 0;
  background: var(--bg-primary);
  min-height: calc(100vh - 70px);
}
</style>
