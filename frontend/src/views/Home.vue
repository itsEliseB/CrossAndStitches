<!--
  Home Page
  Landing page for the application
-->

<template>
  <div class="home">
    <div class="hero">
      <h1>✂️ Cross-Stitch Pattern Generator</h1>
      <p class="subtitle">Create beautiful cross-stitch patterns from your drawings or photos</p>

      <div class="features">
        <div class="feature">
          <div class="feature-icon">🎨</div>
          <h3>Draw Patterns</h3>
          <p>Create custom patterns on a grid with our intuitive drawing tool</p>
        </div>

        <div class="feature">
          <div class="feature-icon">📸</div>
          <h3>Import Images</h3>
          <p>Upload photos and convert them into cross-stitch patterns</p>
        </div>

        <div class="feature">
          <div class="feature-icon">💾</div>
          <h3>Save & Organize</h3>
          <p>Store all your designs in your personal library</p>
        </div>
      </div>

      <div class="cta">
        <router-link v-if="!authStore.isAuthenticated" to="/register" class="btn btn-primary">
          Get Started
        </router-link>
        <router-link v-else to="/create" class="btn btn-primary">
          Create New Design
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.home {
  text-align: center;
}

.hero {
  padding: 4rem 2rem;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 4rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto 3rem;
}

.feature {
  padding: 2rem;
  background: var(--bg-elevated);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color-hover);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.feature:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.feature p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.cta {
  margin-top: 3rem;
}

.btn {
  display: inline-block;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--btn-primary-bg);
  color: white;
}

.btn-primary:hover {
  background: var(--btn-primary-bg-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(111, 91, 74, 0.4);
}
</style>
