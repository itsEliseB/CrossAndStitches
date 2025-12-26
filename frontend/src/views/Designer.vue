<!--
  Designer Component
  Unified component for creating and editing cross-stitch patterns
  Handles both /designs/create and /designs/:id/edit routes
-->

<template>
  <div class="designer-page">
    <!-- Loading state (edit mode only) -->
    <div v-if="isEditMode && loading" class="loading">Loading design...</div>

    <!-- Error state (edit mode only) -->
    <div v-else-if="isEditMode && error" class="error-message">{{ error }}</div>

    <!-- Main designer interface -->
    <div v-else class="designer-container">
      <!-- Header: Toolbar with title, actions, save button -->
      <header class="designer-header">
        <SavePanel
          v-model:title="title"
          v-model:description="description"
          :saving="saving"
          :save-error="saveError"
          :panel-title="isEditMode ? 'Update Design' : 'Save Design'"
          :save-button-text="isEditMode ? 'Update Design' : 'Save Design'"
          :title-placeholder="isEditMode ? '' : 'My Cross-Stitch Pattern'"
          :description-placeholder="isEditMode ? '' : 'Optional description'"
          :show-cancel="isEditMode"
          :can-undo="canUndo"
          :can-redo="canRedo"
          :grid-dimensions="`${gridHeight}×${gridWidth}`"
          :zoom="zoom"
          @save="saveDesign"
          @undo="undo"
          @redo="redo"
          @zoom-in="zoomIn"
          @zoom-out="zoomOut"
          @zoom-reset="resetZoom"
        />
      </header>

      <!-- Content layout: main canvas + aside tools -->
      <div class="designer-layout" :style="{ gridTemplateColumns: `${sidebarWidth}px 1fr` }">
        <!-- Aside: Tools and palette -->
        <aside class="tools-sidebar" :style="{ width: `${sidebarWidth}px` }">
          <div class="resize-handle" @mousedown="startResize"></div>
          <SettingsPanel
            v-model:currentColor="currentColor"
            v-model:tool="tool"
            v-model:brushSize="brushSize"
            v-model:gridWidth="gridWidth"
            v-model:gridHeight="gridHeight"
            :hovered-color-info="hoveredColorInfo"
            :show-clear-button="!isEditMode"
            :show-grid-size="!isEditMode"
            @clear-grid="clearGrid"
            @resize="resizeGrid"
          />

          <ColorPalette
            v-model:currentColor="currentColor"
            :palette-colors="paletteColors"
          />
        </aside>

        <!-- Main: Canvas area -->
        <main class="canvas-area">
          <div class="canvas-wrapper" @wheel="handleWheel">
            <div
              class="scaled-canvas-wrapper"
              :style="{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                // margin: `${300 * (zoom / 100)}px`
              }"
            >
              <div class="canvas-container">
                <canvas
                  ref="canvasRef"
                  :data-tool="tool"
                  @mousedown="startDrawing"
                  @mousemove="handleMouseMove"
                  @mouseup="stopDrawing"
                  @mouseleave="handleMouseLeave"
                  @click="drawPixel"
                ></canvas>
              </div>

              <GridControls
                :grid-width="gridWidth"
                :grid-height="gridHeight"
                @add-row-top="addRowTop"
                @remove-row-top="removeRowTop"
                @add-row-bottom="addRowBottom"
                @remove-row-bottom="removeRowBottom"
                @add-column-left="addColumnLeft"
                @remove-column-left="removeColumnLeft"
                @add-column-right="addColumnRight"
                @remove-column-right="removeColumnRight"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { designsAPI } from '../api/client'
import { allDMCColors, TRANSPARENT, isTransparent, getColorDisplay } from '../utils/dmcColors'
import SettingsPanel from '../components/Designer/SettingsPanel.vue'
import GridControls from '../components/Designer/GridControls.vue'
import ColorPalette from '../components/Designer/ColorPalette.vue'
import SavePanel from '../components/Designer/SavePanel.vue'

const route = useRoute()
const router = useRouter()

// Mode detection
const isEditMode = computed(() => !!route.params.id)
const designId = computed(() => route.params.id)

// Loading state (for edit mode)
const loading = ref(isEditMode.value)
const error = ref(null)

// Sidebar resizing
const sidebarWidth = ref(350)
const isResizing = ref(false)

const startResize = () => {
  isResizing.value = true
  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
}

const stopResize = () => {
  isResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

const resize = (e) => {
  if (!isResizing.value) return
  const container = document.querySelector('.designer-layout')
  if (!container) return

  const containerRect = container.getBoundingClientRect()
  const newWidth = e.clientX - containerRect.left

  if (newWidth >= 250 && newWidth <= 600) {
    sidebarWidth.value = newWidth
  }
}

// Grid settings
const gridWidth = ref(30)
const gridHeight = ref(30)
const cellSize = ref(15)
const zoom = ref(100) // Zoom percentage

// Zoom with cursor-centered zooming
const zoomToPoint = (newZoom, clientX, clientY) => {
  const canvasArea = document.querySelector('.canvas-area')
  if (!canvasArea) return

  const oldZoom = zoom.value

  // Get scroll position before zoom
  const scrollLeft = canvasArea.scrollLeft
  const scrollTop = canvasArea.scrollTop

  // Get cursor position relative to canvas-area
  const rect = canvasArea.getBoundingClientRect()
  const cursorX = clientX - rect.left + scrollLeft
  const cursorY = clientY - rect.top + scrollTop

  // Apply new zoom
  zoom.value = newZoom

  // Calculate new scroll position to keep cursor point centered
  nextTick(() => {
    const zoomRatio = newZoom / oldZoom
    const newScrollLeft = cursorX * zoomRatio - (clientX - rect.left)
    const newScrollTop = cursorY * zoomRatio - (clientY - rect.top)

    canvasArea.scrollLeft = newScrollLeft
    canvasArea.scrollTop = newScrollTop
  })
}

const zoomIn = (event) => {
  if (zoom.value < 400) {
    const newZoom = zoom.value + 10
    if (event) {
      zoomToPoint(newZoom, event.clientX, event.clientY)
    } else {
      zoom.value = newZoom
    }
  }
}

const zoomOut = (event) => {
  if (zoom.value > 50) {
    const newZoom = zoom.value - 10
    if (event) {
      zoomToPoint(newZoom, event.clientX, event.clientY)
    } else {
      zoom.value = newZoom
    }
  }
}

const resetZoom = () => {
  zoom.value = 100
  // Center the view
  nextTick(() => {
    const canvasArea = document.querySelector('.canvas-area')
    if (canvasArea) {
      canvasArea.scrollLeft = (canvasArea.scrollWidth - canvasArea.clientWidth) / 2
      canvasArea.scrollTop = (canvasArea.scrollHeight - canvasArea.clientHeight) / 2
    }
  })
}

// Handle mouse wheel - just prevent zoom, allow normal scrolling
const handleWheel = (e) => {
  // Allow normal scrolling, don't zoom
  // Remove the preventDefault to allow scrolling
}

// Panning functions for hand tool
const startPanning = (event) => {
  if (tool.value === 'hand') {
    isPanning.value = true
    panStartX.value = event.clientX
    panStartY.value = event.clientY

    const canvasArea = document.querySelector('.canvas-area')
    if (canvasArea) {
      scrollStartX.value = canvasArea.scrollLeft
      scrollStartY.value = canvasArea.scrollTop
      canvasArea.style.cursor = 'grabbing'
    }
  }
}

const handlePanning = (event) => {
  if (isPanning.value && tool.value === 'hand') {
    const deltaX = event.clientX - panStartX.value
    const deltaY = event.clientY - panStartY.value

    const canvasArea = document.querySelector('.canvas-area')
    if (canvasArea) {
      canvasArea.scrollLeft = scrollStartX.value - deltaX
      canvasArea.scrollTop = scrollStartY.value - deltaY
    }
  }
}

const stopPanning = () => {
  if (isPanning.value) {
    isPanning.value = false
    const canvasArea = document.querySelector('.canvas-area')
    if (canvasArea) {
      canvasArea.style.cursor = tool.value === 'hand' ? 'grab' : ''
    }
  }
}

// Drawing state
const grid = ref([])
const currentColor = ref('#C72B3B')  // Default to DMC 321 Red
const tool = ref('draw')  // 'draw', 'erase', 'bucket', 'eyedropper', or 'hand'
const brushSize = ref(1)  // Brush size: 1x1, 2x2, 3x3, etc.
const isDrawing = ref(false)
const startingTool = ref(null)  // Track tool at start of drawing operation
const hoveredColorInfo = ref(null)  // Color info for hovered cell (eyedropper)
const cursorPosition = ref(null)  // Current cursor position for brush preview

// Panning state (for hand tool)
const isPanning = ref(false)
const panStartX = ref(0)
const panStartY = ref(0)
const scrollStartX = ref(0)
const scrollStartY = ref(0)

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

// Initialize grid data (for create mode)
const initializeGrid = () => {
  grid.value = []
  for (let y = 0; y < gridHeight.value; y++) {
    const row = []
    for (let x = 0; x < gridWidth.value; x++) {
      row.push(TRANSPARENT)  // Default to transparent
    }
    grid.value.push(row)
  }

  // Capture initial state
  history.value = [createSnapshot()]
  historyIndex.value = 0
}

// Load design data (for edit mode)
const loadDesign = async () => {
  try {
    const response = await designsAPI.getById(designId.value)
    const design = response.data

    title.value = design.title
    description.value = design.description || ''

    const data = JSON.parse(design.design_data)
    grid.value = data.grid

    // Validate and fix grid data
    grid.value = grid.value.filter(row => row && Array.isArray(row))

    // Get actual dimensions from grid
    const actualHeight = grid.value.length
    const actualWidth = grid.value[0]?.length || 0

    gridHeight.value = actualHeight
    gridWidth.value = actualWidth

    // Ensure all rows have the same length
    grid.value.forEach((row, i) => {
      if (row.length < actualWidth) {
        while (row.length < actualWidth) {
          row.push(TRANSPARENT)
        }
      } else if (row.length > actualWidth) {
        grid.value[i] = row.slice(0, actualWidth)
      }
    })

    // Capture initial state for undo
    history.value = [createSnapshot()]
    historyIndex.value = 0

    loading.value = false
  } catch (err) {
    console.error('Failed to load design:', err)
    error.value = err.response?.data?.detail || 'Failed to load design'
    loading.value = false
  }
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
  ctx.strokeStyle = '#999'
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

  // Account for zoom: the rect is already scaled, so we need to divide by scaled cell size
  const scaledCellSize = cellSize.value * (zoom.value / 100)
  const x = Math.floor((event.clientX - rect.left) / scaledCellSize)
  const y = Math.floor((event.clientY - rect.top) / scaledCellSize)

  return { x, y }
}

// Drawing functions
const startDrawing = (event) => {
  // Handle hand tool separately
  if (tool.value === 'hand') {
    startPanning(event)
    return
  }

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
  // Handle panning stop
  if (isPanning.value) {
    stopPanning()
    return
  }

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
  // Handle panning
  if (isPanning.value) {
    handlePanning(event)
    return
  }

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
    // Clear the grid without resetting history
    for (let y = 0; y < gridHeight.value; y++) {
      for (let x = 0; x < gridWidth.value; x++) {
        grid.value[y][x] = TRANSPARENT
      }
    }
    renderGrid()
  }
}

// Save design (create or update based on mode)
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

    if (isEditMode.value) {
      await designsAPI.update(designId.value, designData)
      router.push('/designs')
    } else {
      const response = await designsAPI.create(designData)
      // Get the ID from the response (could be response.data.id or response.data)
      const newDesignId = response.data?.id || response.data
      router.push(`/designs/${newDesignId}/edit`)
    }
  } catch (err) {
    saveError.value = err.response?.data?.detail || `Failed to ${isEditMode.value ? 'update' : 'save'} design`
  } finally {
    saving.value = false
  }
}

// Initialize on mount
onMounted(async () => {
  if (isEditMode.value) {
    // Edit mode: Load existing design
    await loadDesign()
  } else {
    // Create mode: Initialize empty grid
    initializeGrid()
  }

  // Wait for next tick to ensure canvas is rendered
  await nextTick()

  // Setup canvas
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    renderGrid()
  }

  // Keyboard shortcuts for undo/redo/zoom
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
    // Ctrl+Plus or Ctrl+= for zoom in
    else if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
      event.preventDefault()
      zoomIn()
    }
    // Ctrl+Minus for zoom out
    else if ((event.ctrlKey || event.metaKey) && event.key === '-') {
      event.preventDefault()
      zoomOut()
    }
    // Ctrl+0 for reset zoom
    else if ((event.ctrlKey || event.metaKey) && event.key === '0') {
      event.preventDefault()
      resetZoom()
    }
  }

  window.addEventListener('keydown', handleKeyDown)

  // Resize event listeners
  window.addEventListener('mousemove', resize)
  window.addEventListener('mouseup', stopResize)

  // Panning event listeners (global for hand tool)
  window.addEventListener('mousemove', handlePanning)
  window.addEventListener('mouseup', stopPanning)

  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('mousemove', resize)
    window.removeEventListener('mouseup', stopResize)
    window.removeEventListener('mousemove', handlePanning)
    window.removeEventListener('mouseup', stopPanning)
  })
})
</script>

<style scoped>
/* Page container */
.designer-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* Loading and error states */
.loading {
  padding: 2rem;
  text-align: center;
  font-size: 1.2rem;
  color: #666;
}

.error-message {
  padding: 1rem;
  background: #fee;
  color: #c33;
  border-radius: 4px;
  margin: 2rem;
}

/* Designer container */
.designer-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* Header */
.designer-header {
  flex-shrink: 0;
}

/* Layout wrapper for main + aside */
.designer-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 0;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* Main canvas area */
.canvas-area {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fafafa;
  overflow: auto;
  padding: 1rem;
  align-items: center;
}

/* Zoom controls */
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.zoom-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.zoom-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.zoom-btn.reset {
  font-size: 1.4rem;
}

.zoom-level {
  min-width: 50px;
  text-align: center;
  font-weight: 600;
  color: #333;
}

/* Aside tools sidebar */
.tools-sidebar {
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  position: relative;
}

/* Resize handle */
.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: ew-resize;
  background: transparent;
  transition: background-color 0.2s;
  z-index: 10;
}

.resize-handle:hover {
  background-color: #667eea;
}

.resize-handle:active {
  background-color: #764ba2;
}

/* Canvas wrapper with controls */
.canvas-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
}

/* Scaled canvas wrapper - applies zoom transform to everything inside */
.scaled-canvas-wrapper {
  position: relative;
}

/* Canvas container */
.canvas-container {
  position: relative;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
}

canvas {
  border: 2px solid #ddd;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

canvas[data-tool="draw"],
canvas[data-tool="erase"],
canvas[data-tool="bucket"] {
  cursor: crosshair;
}

canvas[data-tool="eyedropper"] {
  cursor: crosshair;
}

canvas[data-tool="hand"] {
  cursor: grab;
}

canvas[data-tool="hand"]:active {
  cursor: grabbing;
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
</style>
