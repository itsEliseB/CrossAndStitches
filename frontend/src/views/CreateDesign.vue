<!--
  Create Design Page
  Interactive grid drawing tool for creating cross-stitch patterns
-->

<template>
  <div class="create-page">
    <h1>Create New Design</h1>

    <!-- Settings Panel -->
    <div class="settings-panel">
      <div class="setting-group">
        <label>Grid Size:</label>
        <input v-model.number="gridWidth" type="number" min="10" max="100" />
        ×
        <input v-model.number="gridHeight" type="number" min="10" max="100" />
        <button @click="resizeGrid" class="btn btn-small">Resize (centered)</button>
      </div>

      <div class="setting-group">
        <label>Current Color:</label>
        <input v-model="currentColor" type="color" />
        <span class="color-display" :style="{ background: currentColor }"></span>
      </div>

      <div class="setting-group">
        <label>Tool:</label>
        <button
          @click="tool = 'draw'"
          :class="['btn', 'btn-small', { active: tool === 'draw' }]"
        >
          ✏️ Draw
        </button>
        <button
          @click="tool = 'erase'"
          :class="['btn', 'btn-small', { active: tool === 'erase' }]"
        >
          🧹 Erase
        </button>
        <button
          @click="tool = 'bucket'"
          :class="['btn', 'btn-small', { active: tool === 'bucket' }]"
        >
          🪣 Fill
        </button>
        <button
          @click="tool = 'eyedropper'"
          :class="['btn', 'btn-small', { active: tool === 'eyedropper' }]"
        >
          💧 Eyedropper
        </button>
      </div>

      <div class="setting-group" v-if="tool === 'draw' || tool === 'erase'">
        <label>Brush Size:</label>
        <button
          v-for="size in [1, 2, 3, 4, 5]"
          :key="size"
          @click="brushSize = size"
          :class="['btn', 'btn-small', 'btn-brush-size', { active: brushSize === size }]"
        >
          {{ size }}x{{ size }}
        </button>
      </div>

      <!-- Eyedropper color info display -->
      <div v-if="hoveredColorInfo && tool === 'eyedropper'" class="color-info-display">
        <div class="color-info-content">
          <div class="color-info-swatch" :style="{ backgroundColor: hoveredColorInfo.hex || 'transparent' }"></div>
          <div class="color-info-text">
            <strong>{{ hoveredColorInfo.code }}</strong>
            <span>{{ hoveredColorInfo.name }}</span>
            <small v-if="hoveredColorInfo.hex">{{ hoveredColorInfo.hex }}</small>
          </div>
        </div>
      </div>

      <div class="setting-group">
        <label>History:</label>
        <button
          @click="undo"
          :disabled="!canUndo"
          class="btn btn-small"
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </button>
        <button
          @click="redo"
          :disabled="!canRedo"
          class="btn btn-small"
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </button>
      </div>

      <div class="setting-group">
        <button @click="clearGrid" class="btn btn-small">
          🗑️ Clear All
        </button>
      </div>
    </div>

    <!-- Grid Controls -->
    <div class="grid-controls">
      <h3>Modify Grid</h3>
      <div class="controls-layout">
        <div class="control-row">
          <button @click="addRowTop" class="btn btn-small btn-add">⬆️ Add Row Top</button>
          <button @click="removeRowTop" class="btn btn-small btn-remove" :disabled="grid.length <= 5">❌ Remove Top</button>
        </div>
        <div class="control-row">
          <button @click="addColumnLeft" class="btn btn-small btn-add">⬅️ Add Column Left</button>
          <button @click="removeColumnLeft" class="btn btn-small btn-remove" :disabled="(grid[0]?.length || 0) <= 5">❌ Remove Left</button>
          <span class="grid-info">{{ grid.length }}×{{ grid[0]?.length || 0 }}</span>
          <button @click="removeColumnRight" class="btn btn-small btn-remove" :disabled="(grid[0]?.length || 0) <= 5">❌ Remove Right</button>
          <button @click="addColumnRight" class="btn btn-small btn-add">➡️ Add Column Right</button>
        </div>
        <div class="control-row">
          <button @click="addRowBottom" class="btn btn-small btn-add">⬇️ Add Row Bottom</button>
          <button @click="removeRowBottom" class="btn btn-small btn-remove" :disabled="grid.length <= 5">❌ Remove Bottom</button>
        </div>
      </div>
    </div>

    <!-- Canvas Drawing Area -->
    <div class="canvas-container">
      <canvas
        ref="canvasRef"
        @mousedown="startDrawing"
        @mousemove="handleMouseMove"
        @mouseup="stopDrawing"
        @mouseleave="handleMouseLeave"
        @click="drawPixel"
      ></canvas>
    </div>

    <!-- Color Palette -->
    <div class="palette">
      <h3>DMC Thread Color Palette</h3>
      <div class="palette-colors">
        <div
          v-for="color in paletteColors"
          :key="color"
          class="palette-color"
          :class="{
            active: currentColor === color,
            transparent: color === TRANSPARENT
          }"
          :style="color !== TRANSPARENT ? { background: color } : {}"
          @click="currentColor = color"
          :title="getColorName(color)"
        >
          <template v-if="color === TRANSPARENT">
            <div class="checkered-bg"></div>
          </template>
        </div>
      </div>
      <div class="color-info" v-if="currentColor">
        <strong>{{ getColorName(currentColor) }}</strong>
      </div>
    </div>

    <!-- Save Form -->
    <div class="save-panel">
      <h3>Save Design</h3>
      <div class="form-group">
        <label>Title:</label>
        <input v-model="title" type="text" placeholder="My Cross-Stitch Pattern" />
      </div>
      <div class="form-group">
        <label>Description:</label>
        <textarea v-model="description" placeholder="Optional description"></textarea>
      </div>
      <button @click="saveDesign" class="btn btn-primary" :disabled="saving">
        {{ saving ? 'Saving...' : 'Save Design' }}
      </button>
      <div v-if="saveError" class="error-message">{{ saveError }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { designsAPI } from '../api/client'
import { allDMCColors, TRANSPARENT, isTransparent, getColorDisplay } from '../utils/dmcColors'

const router = useRouter()

// Grid settings
const gridWidth = ref(30)
const gridHeight = ref(30)
const cellSize = ref(15)

// Drawing state
const grid = ref([])
const currentColor = ref('#C72B3B')  // Default to DMC 321 Red
const tool = ref('draw')  // 'draw' or 'erase'
const brushSize = ref(1)  // Brush size: 1x1, 2x2, 3x3, etc.
const isDrawing = ref(false)
const startingTool = ref(null)  // Track tool at start of drawing operation
const hoveredColorInfo = ref(null)  // Color info for hovered cell (eyedropper)
const cursorPosition = ref(null)  // Current cursor position for brush preview

// Undo/Redo state
const history = ref([])
const historyIndex = ref(-1)

// Canvas
const canvasRef = ref(null)
let ctx = null

// Create snapshot of current state
const createSnapshot = () => {
  return {
    grid: JSON.parse(JSON.stringify(grid.value)),
    width: gridWidth.value,
    height: gridHeight.value
  }
}

// Capture current state and add to history
const captureState = () => {
  // Remove any "future" history if we're not at the end
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }

  // Add new snapshot
  history.value.push(createSnapshot())
  historyIndex.value = history.value.length - 1
}

// Restore state from snapshot
const restoreState = (snapshot) => {
  grid.value = JSON.parse(JSON.stringify(snapshot.grid))
  gridWidth.value = snapshot.width
  gridHeight.value = snapshot.height
  renderGrid()
}

// Undo operation
const undo = () => {
  if (canUndo.value && !isDrawing.value) {
    historyIndex.value--
    restoreState(history.value[historyIndex.value])
  }
}

// Redo operation
const redo = () => {
  if (canRedo.value && !isDrawing.value) {
    historyIndex.value++
    restoreState(history.value[historyIndex.value])
  }
}

// Computed properties for button states
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

// DMC color palette + transparent option (all 454 colors)
const paletteColors = [
  TRANSPARENT,  // Transparent/empty cell
  ...allDMCColors.map(c => c.hex)
]

// Save state
const title = ref('')
const description = ref('')
const saving = ref(false)
const saveError = ref(null)

// Initialize grid data (for first time)
const initializeGrid = () => {
  grid.value = []
  for (let y = 0; y < gridHeight.value; y++) {
    const row = []
    for (let x = 0; x < gridWidth.value; x++) {
      row.push(TRANSPARENT)  // Default to transparent
    }
    grid.value.push(row)
  }
  renderGrid()
}

// Resize grid while preserving content (centered)
const resizeGrid = () => {
  captureState()
  const oldGrid = grid.value
  const oldHeight = oldGrid.length
  const oldWidth = oldGrid[0]?.length || 0

  const newHeight = gridHeight.value
  const newWidth = gridWidth.value

  // Calculate padding to center the old grid
  const padTop = Math.floor((newHeight - oldHeight) / 2)
  const padLeft = Math.floor((newWidth - oldWidth) / 2)

  // Create new grid
  const newGrid = []
  for (let y = 0; y < newHeight; y++) {
    const row = []
    for (let x = 0; x < newWidth; x++) {
      // Calculate position in old grid
      const oldY = y - padTop
      const oldX = x - padLeft

      // If within old grid bounds, copy; otherwise transparent
      if (oldY >= 0 && oldY < oldHeight && oldX >= 0 && oldX < oldWidth) {
        row.push(oldGrid[oldY][oldX])
      } else {
        row.push(TRANSPARENT)
      }
    }
    newGrid.push(row)
  }

  grid.value = newGrid
  renderGrid()
}

// Add row to top
const addRowTop = () => {
  captureState()
  const newRow = Array(grid.value[0]?.length || gridWidth.value).fill(TRANSPARENT)
  grid.value.unshift(newRow)
  gridHeight.value++
  renderGrid()
}

// Add row to bottom
const addRowBottom = () => {
  captureState()
  const newRow = Array(grid.value[0]?.length || gridWidth.value).fill(TRANSPARENT)
  grid.value.push(newRow)
  gridHeight.value++
  renderGrid()
}

// Add column to left
const addColumnLeft = () => {
  captureState()
  grid.value.forEach(row => row.unshift(TRANSPARENT))
  gridWidth.value++
  renderGrid()
}

// Add column to right
const addColumnRight = () => {
  captureState()
  grid.value.forEach(row => row.push(TRANSPARENT))
  gridWidth.value++
  renderGrid()
}

// Remove row from top
const removeRowTop = () => {
  if (grid.value.length > 5) {
    captureState()
    grid.value.shift()
    gridHeight.value--
    renderGrid()
  }
}

// Remove row from bottom
const removeRowBottom = () => {
  if (grid.value.length > 5) {
    captureState()
    grid.value.pop()
    gridHeight.value--
    renderGrid()
  }
}

// Remove column from left
const removeColumnLeft = () => {
  if (grid.value[0]?.length > 5) {
    captureState()
    grid.value.forEach(row => row.shift())
    gridWidth.value--
    renderGrid()
  }
}

// Remove column from right
const removeColumnRight = () => {
  if (grid.value[0]?.length > 5) {
    captureState()
    grid.value.forEach(row => row.pop())
    gridWidth.value--
    renderGrid()
  }
}

// Helper function to draw checkered pattern for transparent cells
const drawCheckeredPattern = (x, y, size) => {
  const checkSize = size / 4
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(x, y, size, size)

  ctx.fillStyle = '#E0E0E0'
  for (let cy = 0; cy < 4; cy++) {
    for (let cx = 0; cx < 4; cx++) {
      if ((cx + cy) % 2 === 0) {
        ctx.fillRect(
          x + cx * checkSize,
          y + cy * checkSize,
          checkSize,
          checkSize
        )
      }
    }
  }
}

// Render grid on canvas
const renderGrid = () => {
  if (!ctx) return

  const canvas = canvasRef.value
  if (!canvas) return  // Prevent errors if component is unmounted

  canvas.width = gridWidth.value * cellSize.value
  canvas.height = gridHeight.value * cellSize.value

  // Draw cells
  for (let y = 0; y < gridHeight.value; y++) {
    for (let x = 0; x < gridWidth.value; x++) {
      const color = grid.value[y][x]
      const cellX = x * cellSize.value
      const cellY = y * cellSize.value

      if (isTransparent(color)) {
        // Draw checkered pattern for transparent cells
        drawCheckeredPattern(cellX, cellY, cellSize.value)
      } else {
        // Draw solid color
        ctx.fillStyle = color
        ctx.fillRect(cellX, cellY, cellSize.value, cellSize.value)
      }
    }
  }

  // Draw grid lines
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1

  for (let x = 0; x <= gridWidth.value; x++) {
    ctx.beginPath()
    ctx.moveTo(x * cellSize.value, 0)
    ctx.lineTo(x * cellSize.value, canvas.height)
    ctx.stroke()
  }

  for (let y = 0; y <= gridHeight.value; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * cellSize.value)
    ctx.lineTo(canvas.width, y * cellSize.value)
    ctx.stroke()
  }

  // Draw brush preview outline
  if (cursorPosition.value && (tool.value === 'draw' || tool.value === 'erase') && !isDrawing.value) {
    const { x, y } = cursorPosition.value
    const radius = Math.floor(brushSize.value / 2)

    // Draw semi-transparent overlay for brush area
    ctx.fillStyle = tool.value === 'draw'
      ? 'rgba(102, 126, 234, 0.3)'  // Blue tint for draw
      : 'rgba(220, 53, 69, 0.3)'    // Red tint for erase

    for (let dy = -radius; dy < brushSize.value - radius; dy++) {
      for (let dx = -radius; dx < brushSize.value - radius; dx++) {
        const targetX = x + dx
        const targetY = y + dy

        if (targetX >= 0 && targetX < gridWidth.value &&
            targetY >= 0 && targetY < gridHeight.value) {
          const cellX = targetX * cellSize.value
          const cellY = targetY * cellSize.value
          ctx.fillRect(cellX, cellY, cellSize.value, cellSize.value)
        }
      }
    }

    // Draw outline around brush area
    ctx.strokeStyle = tool.value === 'draw' ? '#667eea' : '#dc3545'
    ctx.lineWidth = 2

    const startX = (x - radius) * cellSize.value
    const startY = (y - radius) * cellSize.value
    const brushPixelSize = brushSize.value * cellSize.value

    ctx.strokeRect(startX, startY, brushPixelSize, brushPixelSize)
  }
}

// Get grid coordinates from mouse event
const getGridCoords = (event) => {
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const x = Math.floor((event.clientX - rect.left) / cellSize.value)
  const y = Math.floor((event.clientY - rect.top) / cellSize.value)
  return { x, y }
}

// Drawing functions
const startDrawing = (event) => {
  // Remember which tool we started with (eyedropper may change it)
  startingTool.value = tool.value

  // Don't capture state for eyedropper (it doesn't modify the grid)
  if (startingTool.value !== 'eyedropper') {
    captureState()  // Capture state before drawing starts
  }
  isDrawing.value = true
  drawPixel(event)
}

const stopDrawing = () => {
  if (isDrawing.value) {
    isDrawing.value = false
    // Don't capture state for eyedropper (it doesn't modify the grid)
    // Check the starting tool, not current tool (eyedropper changes it)
    if (startingTool.value !== 'eyedropper') {
      captureState()  // Capture state after drawing completes
    }
    startingTool.value = null
  }
}

// Apply brush at given position with current brush size
const applyBrush = (centerX, centerY, color) => {
  const radius = Math.floor(brushSize.value / 2)

  for (let dy = -radius; dy < brushSize.value - radius; dy++) {
    for (let dx = -radius; dx < brushSize.value - radius; dx++) {
      const targetX = centerX + dx
      const targetY = centerY + dy

      // Check bounds
      if (targetX >= 0 && targetX < gridWidth.value &&
          targetY >= 0 && targetY < gridHeight.value) {
        grid.value[targetY][targetX] = color
      }
    }
  }
}

const drawPixel = (event) => {
  const { x, y } = getGridCoords(event)

  if (x >= 0 && x < gridWidth.value && y >= 0 && y < gridHeight.value) {
    if (tool.value === 'draw') {
      applyBrush(x, y, currentColor.value)
      renderGrid()
    } else if (tool.value === 'erase') {
      applyBrush(x, y, TRANSPARENT)
      renderGrid()
    } else if (tool.value === 'bucket') {
      captureState()  // Capture state before flood fill
      // Flood fill with current color
      floodFill(x, y, currentColor.value)
      // floodFill calls renderGrid() internally
    } else if (tool.value === 'eyedropper') {
      // Pick color from clicked cell
      const pickedColor = grid.value[y][x]
      if (!isTransparent(pickedColor)) {
        currentColor.value = pickedColor
      }
      // Automatically switch to draw tool after picking
      tool.value = 'draw'
    }
  }
}

const draw = (event) => {
  if (isDrawing.value) {
    drawPixel(event)
  }
}

// Handle mouse hover for eyedropper color preview
const updateHoveredColorInfo = (event) => {
  // Only show color info when eyedropper is active
  if (tool.value !== 'eyedropper') {
    hoveredColorInfo.value = null
    return
  }

  const { x, y } = getGridCoords(event)

  if (x >= 0 && x < gridWidth.value && y >= 0 && y < gridHeight.value) {
    const cellColor = grid.value[y][x]
    hoveredColorInfo.value = getColorDisplay(cellColor)
  } else {
    hoveredColorInfo.value = null
  }
}

// Handle mouse move on canvas
const handleMouseMove = (event) => {
  // Update cursor position for brush preview
  const { x, y } = getGridCoords(event)
  if (x >= 0 && x < gridWidth.value && y >= 0 && y < gridHeight.value) {
    cursorPosition.value = { x, y }
    renderGrid()  // Re-render to show brush preview
  }

  draw(event)  // Handle drawing
  updateHoveredColorInfo(event)  // Update color info for eyedropper
}

// Handle mouse leave canvas
const handleMouseLeave = (event) => {
  stopDrawing(event)  // Stop drawing
  hoveredColorInfo.value = null  // Clear color info
  cursorPosition.value = null  // Clear brush preview
  renderGrid()  // Re-render to clear preview
}

// Flood fill algorithm for bucket tool
const floodFill = (startX, startY, replacementColor) => {
  // Helper: Compare colors safely (handles TRANSPARENT)
  const colorsMatch = (c1, c2) => {
    return (isTransparent(c1) && isTransparent(c2)) || c1 === c2
  }

  // Get the color we're replacing
  const targetColor = grid.value[startY][startX]

  // Early exit: if clicking same color, nothing to do
  if (colorsMatch(targetColor, replacementColor)) return

  // BFS setup
  const queue = [[startX, startY]]
  const visited = new Set()
  visited.add(`${startX},${startY}`)

  // Process queue until empty
  while (queue.length > 0) {
    const [x, y] = queue.shift()

    // Fill this cell
    grid.value[y][x] = replacementColor

    // Check 4 neighbors (up, down, left, right)
    const neighbors = [
      [x, y - 1],  // up
      [x, y + 1],  // down
      [x - 1, y],  // left
      [x + 1, y],  // right
    ]

    for (const [nx, ny] of neighbors) {
      const key = `${nx},${ny}`

      // Add to queue if: in bounds, not visited, matches target color
      if (
        nx >= 0 && nx < gridWidth.value &&
        ny >= 0 && ny < gridHeight.value &&
        !visited.has(key) &&
        colorsMatch(grid.value[ny][nx], targetColor)
      ) {
        visited.add(key)
        queue.push([nx, ny])
      }
    }
  }

  // Re-render the canvas with filled cells
  renderGrid()
}

// Clear entire grid
const clearGrid = () => {
  if (confirm('Clear the entire grid?')) {
    captureState()
    initializeGrid()
  }
}

// Get color name for display
const getColorName = (color) => {
  if (color === TRANSPARENT) {
    return 'Transparent / Empty'
  }
  const dmcColor = allDMCColors.find(c => c.hex === color)
  return dmcColor ? `DMC ${dmcColor.code} - ${dmcColor.name}` : color
}

// Save design to database
const saveDesign = async () => {
  if (!title.value.trim()) {
    saveError.value = 'Please enter a title'
    return
  }

  saving.value = true
  saveError.value = null

  try {
    // Extract unique colors (palette) excluding transparent
    const palette = [...new Set(grid.value.flat())].filter(c => !isTransparent(c))

    const designData = {
      title: title.value,
      description: description.value || null,
      width: gridWidth.value,
      height: gridHeight.value,
      design_data: JSON.stringify({
        grid: grid.value,
        palette: palette,
      }),
    }

    const response = await designsAPI.create(designData)
    router.push('/designs')
  } catch (err) {
    saveError.value = err.response?.data?.detail || 'Failed to save design'
  } finally {
    saving.value = false
  }
}

// Initialize on mount
onMounted(async () => {
  await nextTick()
  ctx = canvasRef.value.getContext('2d')
  initializeGrid()
  captureState()  // Capture initial state

  // Keyboard shortcuts for undo/redo
  const handleKeyDown = (event) => {
    if (isDrawing.value) return  // Don't undo/redo while drawing

    // Ctrl+Z or Cmd+Z for undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      undo()
    }
    // Ctrl+Shift+Z or Ctrl+Y for redo
    else if (
      ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') ||
      ((event.ctrlKey || event.metaKey) && event.key === 'y')
    ) {
      event.preventDefault()
      redo()
    }
  }

  window.addEventListener('keydown', handleKeyDown)

  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
})
</script>

<style scoped>
.create-page {
  padding: 2rem 0;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.settings-panel {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.setting-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.setting-group label {
  font-weight: 500;
  color: #333;
}

.setting-group input[type="number"] {
  width: 60px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.setting-group input[type="color"] {
  width: 50px;
  height: 40px;
  border: none;
  cursor: pointer;
}

.color-display {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 2px solid #ddd;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #f5f5f5;
}

.btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-small {
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.canvas-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  overflow: auto;
}

canvas {
  border: 2px solid #ddd;
  cursor: crosshair;
}

.palette {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.palette h3 {
  margin-bottom: 1rem;
  color: #333;
}

.palette-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.palette-color {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: transform 0.2s;
}

.palette-color:hover {
  transform: scale(1.1);
}

.palette-color.active {
  border-color: #667eea;
  border-width: 3px;
}

.palette-color.transparent {
  position: relative;
  overflow: hidden;
}

.checkered-bg {
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(45deg, #E0E0E0 25%, transparent 25%),
    linear-gradient(-45deg, #E0E0E0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #E0E0E0 75%),
    linear-gradient(-45deg, transparent 75%, #E0E0E0 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
}

.color-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 4px;
  text-align: center;
}

.save-panel {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.save-panel h3 {
  margin-bottom: 1rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
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

.form-group textarea {
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee;
  color: #c33;
  border-radius: 4px;
}

/* Grid Controls */
.grid-controls {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.grid-controls h3 {
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
}

.controls-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.control-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.grid-info {
  min-width: 80px;
  text-align: center;
  font-weight: bold;
  color: #667eea;
  padding: 0.5rem;
}

.btn-add {
  background: #e6f7e6;
  border-color: #28a745;
  color: #28a745;
}

.btn-add:hover:not(:disabled) {
  background: #28a745;
  color: white;
}

.btn-remove {
  background: #ffe6e6;
  border-color: #dc3545;
  color: #dc3545;
}

.btn-remove:hover:not(:disabled) {
  background: #dc3545;
  color: white;
}

/* Eyedropper color info display */
.color-info-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.color-info-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-info-swatch {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  flex-shrink: 0;
}

.color-info-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.color-info-text strong {
  font-size: 1.1rem;
  font-weight: 600;
}

.color-info-text span {
  font-size: 0.95rem;
  opacity: 0.9;
}

.color-info-text small {
  font-size: 0.85rem;
  opacity: 0.8;
  font-family: monospace;
}

/* Brush size buttons */
.btn-brush-size {
  min-width: 50px;
  font-size: 0.85rem;
}
</style>
