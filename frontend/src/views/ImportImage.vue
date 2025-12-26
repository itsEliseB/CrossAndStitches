<!--
  Import Image Page
  Upload an image and convert it to a cross-stitch pattern
-->

<template>
  <div class="import-page">
    <h1>Import Image</h1>

    <!-- Upload Section -->
    <div v-if="!processedData" class="upload-section">
      <div class="upload-card">
        <h3>Upload an Image</h3>
        <p>Upload a photo to convert it into a cross-stitch pattern</p>

        <div class="file-input-wrapper">
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            @change="handleFileSelect"
            ref="fileInputRef"
          />
          <label for="fileInput" class="btn btn-primary">
            Choose Image
          </label>
          <span v-if="selectedFile" class="file-name">
            {{ selectedFile.name }}
          </span>
        </div>

        <!-- Preview uploaded image -->
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Uploaded image" />
        </div>

        <!-- Settings -->
        <div v-if="selectedFile" class="settings">
          <h4>Pattern Settings</h4>

          <div class="form-group">
            <label>Pattern Width (stitches):</label>
            <input v-model.number="settings.target_width" type="number" min="10" max="200" />
          </div>

          <div class="form-group">
            <label>Pattern Height (stitches):</label>
            <input v-model.number="settings.target_height" type="number" min="10" max="200" />
          </div>

          <div class="form-group">
            <label>Number of Colors:</label>
            <input v-model.number="settings.num_colors" type="number" min="2" max="64" />
            <small>Fewer colors = simpler pattern</small>
          </div>

          <button @click="processImage" class="btn btn-primary" :disabled="processing">
            {{ processing ? 'Processing...' : 'Convert to Pattern' }}
          </button>

          <div v-if="processError" class="error-message">
            {{ processError }}
          </div>
        </div>
      </div>
    </div>

    <!-- Result Section -->
    <div v-if="processedData" class="result-section">
      <h3>Processed Pattern</h3>

      <div class="result-preview">
        <img :src="API_URL + processedData.preview_url" alt="Pattern preview" />
      </div>

      <div class="result-info">
        <p><strong>Dimensions:</strong> {{ processedData.width }} × {{ processedData.height }} stitches</p>
        <p><strong>Colors used:</strong> {{ processedData.palette.length }}</p>

        <!-- Color palette -->
        <div class="color-palette">
          <h4>Color Palette:</h4>
          <div class="palette-colors">
            <div
              v-for="color in processedData.palette"
              :key="color"
              class="palette-color"
              :style="{ background: color }"
              :title="color"
            ></div>
          </div>
        </div>
      </div>

      <!-- Save Form -->
      <div class="save-form">
        <h4>Save as Design</h4>

        <div class="form-group">
          <label>Title:</label>
          <input v-model="saveForm.title" type="text" placeholder="My Pattern" />
        </div>

        <div class="form-group">
          <label>Description:</label>
          <textarea v-model="saveForm.description" placeholder="Optional description"></textarea>
        </div>

        <button @click="saveDesign" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Design' }}
        </button>
        <button @click="reset" class="btn">Start Over</button>

        <div v-if="saveError" class="error-message">
          {{ saveError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { imagesAPI } from '../api/client'
import { findClosestDMCColor } from '../utils/dmcColors'

const router = useRouter()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Upload state
const selectedFile = ref(null)
const imagePreview = ref(null)
const fileInputRef = ref(null)

// Processing settings
const settings = ref({
  target_width: 50,
  target_height: 50,
  num_colors: 16,
})

const processing = ref(false)
const processError = ref(null)

// Processed data
const processedData = ref(null)

// Save state
const saveForm = ref({
  title: '',
  description: '',
})
const saving = ref(false)
const saveError = ref(null)

// Handle file selection
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  selectedFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Process image
const processImage = async () => {
  if (!selectedFile.value) return

  processing.value = true
  processError.value = null

  try {
    const response = await imagesAPI.upload(selectedFile.value, settings.value)
    const data = response.data

    // Map all colors to closest DMC colors
    const dmcPalette = data.palette.map(color => findClosestDMCColor(color))

    // Create a mapping from original colors to DMC colors
    const colorMap = {}
    data.palette.forEach((originalColor, index) => {
      colorMap[originalColor] = dmcPalette[index]
    })

    // Map grid data colors to DMC colors
    let mappedGridData = data.grid_data
    if (typeof data.grid_data === 'string') {
      // If grid_data is JSON string, parse it, map colors, and stringify back
      const gridArray = JSON.parse(data.grid_data)
      const mappedGrid = gridArray.map(row =>
        row.map(color => colorMap[color] || findClosestDMCColor(color))
      )
      mappedGridData = JSON.stringify(mappedGrid)
    } else if (Array.isArray(data.grid_data)) {
      // If grid_data is already an array, map colors directly
      mappedGridData = data.grid_data.map(row =>
        row.map(color => colorMap[color] || findClosestDMCColor(color))
      )
    }

    processedData.value = {
      ...data,
      palette: dmcPalette,
      grid_data: mappedGridData
    }
  } catch (err) {
    processError.value = err.response?.data?.detail || 'Failed to process image'
  } finally {
    processing.value = false
  }
}

// Save design
const saveDesign = async () => {
  if (!saveForm.value.title.trim()) {
    saveError.value = 'Please enter a title'
    return
  }

  saving.value = true
  saveError.value = null

  try {
    const response = await imagesAPI.saveFromUpload({
      title: saveForm.value.title,
      description: saveForm.value.description || '',
      width: processedData.value.width,
      height: processedData.value.height,
      grid_data: processedData.value.grid_data,
      palette: JSON.stringify(processedData.value.palette),
    })

    // Get the ID from the response and redirect to edit page
    const newDesignId = response.data?.id || response.data
    router.push(`/designs/${newDesignId}/edit`)
  } catch (err) {
    saveError.value = err.response?.data?.detail || 'Failed to save design'
  } finally {
    saving.value = false
  }
}

// Reset form
const reset = () => {
  selectedFile.value = null
  imagePreview.value = null
  processedData.value = null
  saveForm.value = { title: '', description: '' }
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<style scoped>
.import-page {
  padding: 2rem 0;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.upload-section,
.result-section {
  max-width: 800px;
  margin: 0 auto;
}

.upload-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h3, h4 {
  color: #333;
  margin-bottom: 1rem;
}

.file-input-wrapper {
  margin: 2rem 0;
  text-align: center;
}

input[type="file"] {
  display: none;
}

.file-input-wrapper label {
  cursor: pointer;
}

.file-name {
  display: block;
  margin-top: 1rem;
  color: #666;
}

.image-preview {
  margin: 2rem 0;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.settings {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.85rem;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  margin-right: 1rem;
}

.btn:hover {
  background: #f5f5f5;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee;
  color: #c33;
  border-radius: 4px;
}

.result-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.result-preview {
  text-align: center;
  margin: 2rem 0;
}

.result-preview img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.result-info {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.result-info p {
  margin-bottom: 0.5rem;
  color: #333;
}

.color-palette {
  margin-top: 1rem;
}

.palette-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.palette-color {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 2px solid #ddd;
}

.save-form {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}
</style>
