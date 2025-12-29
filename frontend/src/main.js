/**
 * Main Application Entry Point
 * This file initializes and mounts the Vue.js application
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import design system
import './styles/index.css'

// Create Vue app instance
const app = createApp(App)

// Create Pinia store (state management)
const pinia = createPinia()

// Use plugins
app.use(pinia)   // State management
app.use(router)  // Routing

// Mount the app to #app div in index.html
app.mount('#app')

// Now the application is running!
// Vue will render App.vue inside <div id="app"></div>
