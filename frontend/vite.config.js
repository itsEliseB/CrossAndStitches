/**
 * Vite Configuration
 * Vite is the build tool for Vue.js 3
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  server: {
    // Listen on all network interfaces (needed for Docker)
    host: '0.0.0.0',
    port: 5173,

    // Enable hot module replacement
    hmr: {
      host: 'localhost'
    },

    // Watch for changes (important for Docker volume mounts)
    watch: {
      usePolling: true
    }
  }
})
