<!--
  Designs List Page
  Shows all designs for the current user
-->

<template>
  <div class="designs-page">
    <div class="page-header">
      <h1>My Designs</h1>
      <router-link to="designs/new" class="btn btn-primary">
        + Create New Design
      </router-link>
    </div>

    <div v-if="loading" class="loading">
      Loading designs...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="designs.length === 0" class="empty-state">
      <p>You haven't created any designs yet.</p>
      <router-link to="/create" class="btn btn-primary">
        Create Your First Design
      </router-link>
    </div>

    <div v-else class="designs-grid">
      <div
        v-for="design in designs"
        :key="design.id"
        class="design-card"
      >
        <div class="design-preview">
          <canvas
            :ref="el => renderPreview(el, design)"
            :width="200"
            :height="200"
          ></canvas>
        </div>

        <div class="design-info">
          <h3>{{ design.title }}</h3>
          <p class="design-meta">{{ getActualDimensions(design) }}</p>
          <p class="design-date">
            {{ formatDate(design.created_at) }}
          </p>
        </div>

        <div class="design-actions">
          <router-link
            :to="`/designs/${design.id}/edit`"
            class="btn btn-small"
          >
            Edit
          </router-link>
          <button
            @click="confirmDelete(design)"
            class="btn btn-small btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { designsAPI } from '../api/client'
import { isTransparent } from '../utils/dmcColors'

const designs = ref([])
const loading = ref(true)
const error = ref(null)

// Load designs on component mount
onMounted(async () => {
  try {
    const response = await designsAPI.getAll()
    designs.value = response.data
  } catch (err) {
    error.value = 'Failed to load designs'
  } finally {
    loading.value = false
  }
})

// Get actual dimensions from grid data
const getActualDimensions = (design) => {
  try {
    const data = JSON.parse(design.design_data)
    const grid = data.grid || []
    const height = grid.length
    const width = grid[0]?.length || 0
    return `${height} × ${width}`
  } catch (e) {
    // Fallback to database values if parsing fails
    return `${design.height} × ${design.width}`
  }
}

// Render design preview on canvas
const renderPreview = (canvas, design) => {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const data = JSON.parse(design.design_data)
  const grid = data.grid || []

  if (grid.length === 0) return

  // Use actual grid dimensions, not database values
  const actualHeight = grid.length
  const actualWidth = grid[0]?.length || 0

  const cellWidth = 200 / actualWidth
  const cellHeight = 200 / actualHeight

  // Clear canvas to make it fully transparent
  ctx.clearRect(0, 0, 200, 200)

  // Draw each cell (skip transparent cells - they'll be truly transparent)
  grid.forEach((row, y) => {
    row.forEach((color, x) => {
      const cellX = x * cellWidth
      const cellY = y * cellHeight

      if (!isTransparent(color)) {
        // Draw solid color only for non-transparent cells
        ctx.fillStyle = color
        ctx.fillRect(cellX, cellY, cellWidth, cellHeight)
      }
      // Transparent cells remain transparent, showing background through
    })
  })
}

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Delete design
const confirmDelete = async (design) => {
  if (!confirm(`Are you sure you want to delete "${design.title}"?`)) {
    return
  }

  try {
    await designsAPI.delete(design.id)
    // Remove from list
    designs.value = designs.value.filter(d => d.id !== design.id)
  } catch (err) {
    alert('Failed to delete design')
  }
}
</script>

<style scoped>
.designs-page {
  padding: 2rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  color: #333;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.loading,
.error-message,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-state {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.designs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.design-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s;
}

.design-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.design-preview {
  width: 100%;
  height: 200px;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
}

.design-preview canvas {
  max-width: 100%;
  max-height: 100%;
}

.design-info {
  padding: 1rem;
}

.design-info h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.design-meta {
  color: #666;
  font-size: 0.9rem;
}

.design-date {
  color: #999;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.design-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #eee;
}

.design-actions .btn {
  flex: 1;
  text-align: center;
}
</style>
