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
      <!-- Success alert -->
      <div v-if="showSuccessAlert" class="success-alert">
        ✓ Design saved successfully!
      </div>

      <!-- Error alert -->
      <div v-if="saveError" class="error-alert">
        ✕ {{ saveError }}
      </div>

      <!-- Header: Toolbar with title, actions, save button -->
      <header class="designer-header">
        <SavePanel v-model:title="title" v-model:description="description" :saving="saving"
          :panel-title="isEditMode ? 'Update Design' : 'Save Design'"
          :save-button-text="isEditMode ? 'Update Design' : 'Save Design'"
          :title-placeholder="isEditMode ? '' : 'My Cross-Stitch Pattern'"
          :description-placeholder="isEditMode ? '' : 'Optional description'" :show-cancel="isEditMode"
          :can-undo="canUndo" :can-redo="canRedo" :grid-dimensions="`${gridWidth}×${gridHeight}`"
          :has-unsaved-changes="hasUnsavedChanges" :hovered-coordinates="hoveredCoordinatesDisplay"
          @save="saveDesign" @undo="undo" @redo="redo" />
      </header>

      <!-- Content layout: main canvas + aside tools -->
      <div class="designer-layout" :style="{ gridTemplateColumns: `${sidebarWidth}px 1fr` }">
        <!-- Aside: Tools and palette -->
        <aside class="tools-sidebar" :style="{ width: `${sidebarWidth}px` }">
          <div class="resize-handle" @mousedown="startResize"></div>
          <SettingsPanel v-model:currentColor="currentColor" v-model:tool="tool" v-model:brushSize="brushSize"
            v-model:stitchType="stitchType" v-model:gridWidth="gridWidth" v-model:gridHeight="gridHeight"
            :hovered-color-info="hoveredColorInfo" :show-clear-button="!isEditMode" :show-grid-size="!isEditMode"
            @clear-grid="clearGrid" @resize="resizeGrid" />

          <UsedColorsList :grid="grid" />

          <ColorPalette v-model:currentColor="currentColor" :palette-colors="paletteColors" />
        </aside>

        <!-- Main: Canvas area -->
        <main class="canvas-area">
          <div class="canvas-wrapper" :style="canvasAreaStyle">
            <div class="canvas-container">
              <div class="canvas-with-axes">
                <!-- Top axis numbers -->
                <div class="axis-top">
                  <div class="axis-corner"></div>
                  <div class="axis-numbers-horizontal">
                    <span v-for="x in gridWidth" :key="`top-${x}`" :style="{ width: cellSize + 'px' }"
                      class="axis-number">
                      {{ x }}
                    </span>
                  </div>
                </div>

                <!-- Canvas row with left axis -->
                <div class="canvas-row">
                  <!-- Left axis numbers -->
                  <div class="axis-left">
                    <span v-for="y in gridHeight" :key="`left-${y}`" :style="{ height: cellSize + 'px' }"
                      class="axis-number">
                      {{ y }}
                    </span>
                  </div>

                  <!-- Canvas -->
                  <canvas ref="canvasRef" :data-tool="tool" @mousedown="startDrawing" @mousemove="handleMouseMove"
                    @mouseup="stopDrawing" @mouseleave="handleMouseLeave" @click="drawPixel"></canvas>
                </div>
              </div>
              <GridControls :grid-width="gridWidth" :grid-height="gridHeight" @add-row-top="addRowTop"
                @remove-row-top="removeRowTop" @add-row-bottom="addRowBottom" @remove-row-bottom="removeRowBottom"
                @add-column-left="addColumnLeft" @remove-column-left="removeColumnLeft"
                @add-column-right="addColumnRight" @remove-column-right="removeColumnRight" />
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
import UsedColorsList from '../components/Designer/UsedColorsList.vue'

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
const cellSize = ref(30)

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
const tool = ref('draw')  // 'draw', 'erase', 'bucket', 'eyedropper', 'hand'
const stitchType = ref('full')  // 'full', 'halfForward', 'halfBackward'
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

// Performance optimization: throttle renders with requestAnimationFrame
let pendingRenderFrame = null

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

// Track unsaved changes by comparing current state with last saved state
const hasUnsavedChanges = computed(() => {
  if (!lastSavedSnapshot.value) return true // No save yet
  const currentSnapshot = JSON.stringify(createSnapshot())
  return currentSnapshot !== lastSavedSnapshot.value
})

// Format hovered coordinates for display
const hoveredCoordinatesDisplay = computed(() => {
  if (!cursorPosition.value) return 'X- Y-'
  const { x, y } = cursorPosition.value
  return `X${x + 1} Y${y + 1}`
})

// Calculate canvas-area minimum dimensions
const canvasAreaStyle = computed(() => {
  // Canvas dimensions
  const canvasWidth = gridWidth.value * cellSize.value * 1.15
  const canvasHeight = gridHeight.value * cellSize.value * 1.15

  // Axis dimensions (from CSS)
  const leftAxisWidth = 40 // from .axis-left
  const leftAxisMargin = 6 // from .axis-left margin-right
  const topAxisMargin = 6 // from .axis-numbers-horizontal margin-bottom

  // Canvas container padding: 1rem 2rem 2rem 1rem = 16px 32px 32px 16px
  const containerPaddingHorizontal = 32 + 16 // right + left
  const containerPaddingVertical = 16 + 32 // top + bottom

  // Calculate canvas-container dimensions
  const containerWidth = canvasWidth + leftAxisWidth + leftAxisMargin + containerPaddingHorizontal
  const containerHeight = canvasHeight + topAxisMargin + containerPaddingVertical

  // Canvas-area min dimensions = container + 2rem (32px) + 32px
  const minWidth = containerWidth + 32 + 32 // 2rem + 32px
  const minHeight = containerHeight + 32 + 32 // 2rem + 32px

  return {
    width: `${minWidth}px`,
    height: `${minHeight}px`
  }
})

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
const showSuccessAlert = ref(false)
const lastSavedSnapshot = ref(null)
let successAlertTimer = null

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

    // Mark initial state as saved (no unsaved changes on load)
    lastSavedSnapshot.value = JSON.stringify(createSnapshot())

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
  if (grid.value.length > 1) {
    captureState()
    grid.value.shift()
    gridHeight.value--
    renderGrid()
  }
}

// Remove row from bottom
const removeRowBottom = () => {
  if (grid.value.length > 1) {
    captureState()
    grid.value.pop()
    gridHeight.value--
    renderGrid()
  }
}

// Remove column from left
const removeColumnLeft = () => {
  if (grid.value[0]?.length > 1) {
    captureState()
    grid.value.forEach(row => row.shift())
    gridWidth.value--
    renderGrid()
  }
}

// Remove column from right
const removeColumnRight = () => {
  if (grid.value[0]?.length > 1) {
    captureState()
    grid.value.forEach(row => row.pop())
    gridWidth.value--
    renderGrid()
  }
}

// Helper functions for grid cell structure
// Cell can be:
// - String: full stitch color (e.g., "#C72B3B")
// - Object: {
//     forward: color|null,           // Half stitch /
//     backward: color|null,          // Half stitch \
//     quarterTL: color|null,         // Quarter stitch to top-left corner
//     quarterTR: color|null,         // Quarter stitch to top-right corner
//     quarterBL: color|null,         // Quarter stitch to bottom-left corner
//     quarterBR: color|null,         // Quarter stitch to bottom-right corner
//     threeQuarterTL: color|null,    // 3/4 stitch (top-left corner missing)
//     threeQuarterTR: color|null,    // 3/4 stitch (top-right corner missing)
//     threeQuarterBL: color|null,    // 3/4 stitch (bottom-left corner missing)
//     threeQuarterBR: color|null,    // 3/4 stitch (bottom-right corner missing)
//     lastDrawn: string              // Track which was drawn last
//   }
// - TRANSPARENT or null: empty cell

const getCellColor = (cell) => {
  if (!cell || isTransparent(cell)) return TRANSPARENT
  if (typeof cell === 'string') return cell
  // Return the first available color from any stitch type
  if (cell.forward) return cell.forward
  if (cell.backward) return cell.backward
  if (cell.quarterTL) return cell.quarterTL
  if (cell.quarterTR) return cell.quarterTR
  if (cell.quarterBL) return cell.quarterBL
  if (cell.quarterBR) return cell.quarterBR
  if (cell.threeQuarterTL) return cell.threeQuarterTL
  if (cell.threeQuarterTR) return cell.threeQuarterTR
  if (cell.threeQuarterBL) return cell.threeQuarterBL
  if (cell.threeQuarterBR) return cell.threeQuarterBR
  return TRANSPARENT
}

const getCellType = (cell) => {
  if (!cell || isTransparent(cell)) return null
  if (typeof cell === 'string') return 'full'
  // Check for mixed stitches
  const hasHalf = cell.forward || cell.backward
  const hasQuarter = cell.quarterTL || cell.quarterTR || cell.quarterBL || cell.quarterBR
  const hasThreeQuarter = cell.threeQuarterTL || cell.threeQuarterTR || cell.threeQuarterBL || cell.threeQuarterBR
  if ((hasHalf && hasQuarter) || (hasHalf && hasThreeQuarter) || (hasQuarter && hasThreeQuarter)) return 'mixed'
  if (cell.forward && cell.backward) return 'cross' // Two overlapping half stitches
  if (hasHalf) return 'half'
  if (hasQuarter) return 'quarter'
  if (hasThreeQuarter) return 'threeQuarter'
  return null
}

const hasHalfStitch = (cell, direction) => {
  if (!cell || typeof cell === 'string' || isTransparent(cell)) return false
  return direction === '/' ? !!cell.forward : !!cell.backward
}

const getHalfStitchColor = (cell, direction) => {
  if (!cell || typeof cell === 'string' || isTransparent(cell)) return null
  return direction === '/' ? cell.forward : cell.backward
}

const createCell = (color, type = 'full', direction = null) => {
  if (isTransparent(color)) return TRANSPARENT
  if (type === 'full') return color  // Full stitch
  // Half stitch
  return {
    forward: direction === '/' ? color : null,
    backward: direction === '\\' ? color : null
  }
}

const addStitch = (existingCell, color, stitchType) => {
  // If cell is empty or transparent, create new stitch cell
  if (!existingCell || isTransparent(existingCell)) {
    const newCell = {
      forward: null,
      backward: null,
      quarterTL: null,
      quarterTR: null,
      quarterBL: null,
      quarterBR: null,
      threeQuarterTL: null,
      threeQuarterTR: null,
      threeQuarterBL: null,
      threeQuarterBR: null,
      lastDrawn: stitchType
    }

    if (stitchType === 'halfForward') newCell.forward = color
    else if (stitchType === 'halfBackward') newCell.backward = color
    else if (stitchType === 'quarterTL') newCell.quarterTL = color
    else if (stitchType === 'quarterTR') newCell.quarterTR = color
    else if (stitchType === 'quarterBL') newCell.quarterBL = color
    else if (stitchType === 'quarterBR') newCell.quarterBR = color
    else if (stitchType === 'threeQuarterTL') newCell.threeQuarterTL = color
    else if (stitchType === 'threeQuarterTR') newCell.threeQuarterTR = color
    else if (stitchType === 'threeQuarterBL') newCell.threeQuarterBL = color
    else if (stitchType === 'threeQuarterBR') newCell.threeQuarterBR = color

    return newCell
  }

  // If cell is a full stitch, replace it with new stitch
  if (typeof existingCell === 'string') {
    return addStitch(null, color, stitchType)
  }

  // If cell already has stitches, add or replace
  const updatedCell = {
    forward: existingCell.forward || null,
    backward: existingCell.backward || null,
    quarterTL: existingCell.quarterTL || null,
    quarterTR: existingCell.quarterTR || null,
    quarterBL: existingCell.quarterBL || null,
    quarterBR: existingCell.quarterBR || null,
    threeQuarterTL: existingCell.threeQuarterTL || null,
    threeQuarterTR: existingCell.threeQuarterTR || null,
    threeQuarterBL: existingCell.threeQuarterBL || null,
    threeQuarterBR: existingCell.threeQuarterBR || null,
    lastDrawn: stitchType
  }

  if (stitchType === 'halfForward') updatedCell.forward = color
  else if (stitchType === 'halfBackward') updatedCell.backward = color
  else if (stitchType === 'quarterTL') updatedCell.quarterTL = color
  else if (stitchType === 'quarterTR') updatedCell.quarterTR = color
  else if (stitchType === 'quarterBL') updatedCell.quarterBL = color
  else if (stitchType === 'quarterBR') updatedCell.quarterBR = color
  else if (stitchType === 'threeQuarterTL') updatedCell.threeQuarterTL = color
  else if (stitchType === 'threeQuarterTR') updatedCell.threeQuarterTR = color
  else if (stitchType === 'threeQuarterBL') updatedCell.threeQuarterBL = color
  else if (stitchType === 'threeQuarterBR') updatedCell.threeQuarterBR = color

  return updatedCell
}

// Keep addHalfStitch for backward compatibility
const addHalfStitch = (existingCell, color, direction) => {
  const stitchType = direction === '/' ? 'halfForward' : 'halfBackward'
  return addStitch(existingCell, color, stitchType)
}

// Helper function to get stitch direction from stitchType
const getStitchDirection = (stitchTypeValue) => {
  if (stitchTypeValue === 'halfForward') return '/'
  if (stitchTypeValue === 'halfBackward') return '\\'
  return null
}

// Helper function to darken a hex color
const darkenColor = (hex, amount = 0.3) => {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  // Darken by reducing each component
  const darkR = Math.floor(r * (1 - amount))
  const darkG = Math.floor(g * (1 - amount))
  const darkB = Math.floor(b * (1 - amount))

  // Convert back to hex
  return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`
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

// Helper function to draw half stitch (hexagon shape with small pointed tips and flat sides)
const drawHalfStitch = (x, y, size, color, direction) => {
  ctx.fillStyle = color

  const width = size * 0.45        // Width of the hexagon (perpendicular to diagonal)
  const inset = size * 0         // Small inset from edges
  const tipLength = size * 0.25    // Length of the pointed tip (smaller = pointier)

  ctx.beginPath()

  if (direction === '/') {
    // Top-right to bottom-left diagonal - draw hexagon
    const x1 = x + size - inset  // Top-right tip point
    const y1 = y + inset
    const x2 = x + inset          // Bottom-left tip point
    const y2 = y + size - inset

    // Calculate direction vector (normalized)
    const dx = x2 - x1
    const dy = y2 - y1
    const length = Math.sqrt(dx * dx + dy * dy)
    const dirX = dx / length
    const dirY = dy / length

    // Perpendicular vector (rotated 90 degrees)
    const perpX = -dirY
    const perpY = dirX
    const perpOffset = width / 2

    // Calculate 6 points of hexagon
    // Tip 1 (top-right)
    const p1x = x1
    const p1y = y1

    // Start of flat side (near tip 1)
    const p2x = x1 + dirX * tipLength + perpX * perpOffset
    const p2y = y1 + dirY * tipLength + perpY * perpOffset

    // End of flat side (near tip 2)
    const p3x = x2 - dirX * tipLength + perpX * perpOffset
    const p3y = y2 - dirY * tipLength + perpY * perpOffset

    // Tip 2 (bottom-left)
    const p4x = x2
    const p4y = y2

    // Other side flat edge (near tip 2)
    const p5x = x2 - dirX * tipLength - perpX * perpOffset
    const p5y = y2 - dirY * tipLength - perpY * perpOffset

    // Other side flat edge (near tip 1)
    const p6x = x1 + dirX * tipLength - perpX * perpOffset
    const p6y = y1 + dirY * tipLength - perpY * perpOffset

    // Draw hexagon
    ctx.moveTo(p1x, p1y)
    ctx.lineTo(p2x, p2y)
    ctx.lineTo(p3x, p3y)
    ctx.lineTo(p4x, p4y)
    ctx.lineTo(p5x, p5y)
    ctx.lineTo(p6x, p6y)
  } else {
    // Top-left to bottom-right diagonal - draw hexagon
    const x1 = x + inset          // Top-left tip point
    const y1 = y + inset
    const x2 = x + size - inset  // Bottom-right tip point
    const y2 = y + size - inset

    // Calculate direction vector (normalized)
    const dx = x2 - x1
    const dy = y2 - y1
    const length = Math.sqrt(dx * dx + dy * dy)
    const dirX = dx / length
    const dirY = dy / length

    // Perpendicular vector (rotated 90 degrees)
    const perpX = -dirY
    const perpY = dirX
    const perpOffset = width / 2

    // Calculate 6 points of hexagon
    // Tip 1 (top-left)
    const p1x = x1
    const p1y = y1

    // Start of flat side (near tip 1)
    const p2x = x1 + dirX * tipLength + perpX * perpOffset
    const p2y = y1 + dirY * tipLength + perpY * perpOffset

    // End of flat side (near tip 2)
    const p3x = x2 - dirX * tipLength + perpX * perpOffset
    const p3y = y2 - dirY * tipLength + perpY * perpOffset

    // Tip 2 (bottom-right)
    const p4x = x2
    const p4y = y2

    // Other side flat edge (near tip 2)
    const p5x = x2 - dirX * tipLength - perpX * perpOffset
    const p5y = y2 - dirY * tipLength - perpY * perpOffset

    // Other side flat edge (near tip 1)
    const p6x = x1 + dirX * tipLength - perpX * perpOffset
    const p6y = y1 + dirY * tipLength - perpY * perpOffset

    // Draw hexagon
    ctx.moveTo(p1x, p1y)
    ctx.lineTo(p2x, p2y)
    ctx.lineTo(p3x, p3y)
    ctx.lineTo(p4x, p4y)
    ctx.lineTo(p5x, p5y)
    ctx.lineTo(p6x, p6y)
  }

  ctx.closePath()
  ctx.fill()
}

// Helper function to draw quarter stitch (line from center to corner with pointed tips at both ends)
const drawQuarterStitch = (x, y, size, color, corner) => {
  const centerX = x + size / 2
  const centerY = y + size / 2
  const lineWidth = size * 0.35

  // Determine corner position
  let cornerX, cornerY
  if (corner === 'TL') {
    cornerX = x
    cornerY = y
  } else if (corner === 'TR') {
    cornerX = x + size
    cornerY = y
  } else if (corner === 'BL') {
    cornerX = x
    cornerY = y + size
  } else if (corner === 'BR') {
    cornerX = x + size
    cornerY = y + size
  }

  // Calculate direction vector
  const dx = cornerX - centerX
  const dy = cornerY - centerY
  const length = Math.sqrt(dx * dx + dy * dy)
  const dirX = dx / length
  const dirY = dy / length

  // Perpendicular vector for width
  const perpX = -dirY
  const perpY = dirX
  const perpOffset = lineWidth / 2

  // Length of pointed tips at both ends
  const tipLength = size * 0.15

  // Calculate points for hexagon shape with pointed tips at both ends
  const centerTipX = centerX
  const centerTipY = centerY
  const centerBaseX = centerX + dirX * tipLength
  const centerBaseY = centerY + dirY * tipLength

  const cornerBaseX = cornerX - dirX * tipLength
  const cornerBaseY = cornerY - dirY * tipLength
  const cornerTipX = cornerX
  const cornerTipY = cornerY

  // Draw hexagon shape
  ctx.fillStyle = color
  ctx.beginPath()

  // Center tip (pointed)
  ctx.moveTo(centerTipX, centerTipY)

  // Center base to corner base (one side)
  ctx.lineTo(centerBaseX + perpX * perpOffset, centerBaseY + perpY * perpOffset)
  ctx.lineTo(cornerBaseX + perpX * perpOffset, cornerBaseY + perpY * perpOffset)

  // Corner tip (pointed)
  ctx.lineTo(cornerTipX, cornerTipY)

  // Corner base to center base (other side)
  ctx.lineTo(cornerBaseX - perpX * perpOffset, cornerBaseY - perpY * perpOffset)
  ctx.lineTo(centerBaseX - perpX * perpOffset, centerBaseY - perpY * perpOffset)

  ctx.closePath()
  ctx.fill()
}

// Helper function to draw three-quarter stitch (triangular fill - 3/4 of square)
const drawThreeQuarterStitch = (x, y, size, color, missingCorner) => {
  ctx.fillStyle = color

  ctx.beginPath()

  // Draw triangle based on which corner is missing
  if (missingCorner === 'TL') {
    // Missing top-left: triangle covering bottom-right 3/4
    ctx.moveTo(x + size, y)         // Top-right
    ctx.lineTo(x + size, y + size)  // Bottom-right
    ctx.lineTo(x, y + size)         // Bottom-left
  } else if (missingCorner === 'TR') {
    // Missing top-right: triangle covering bottom-left 3/4
    ctx.moveTo(x, y)                // Top-left
    ctx.lineTo(x, y + size)         // Bottom-left
    ctx.lineTo(x + size, y + size)  // Bottom-right
  } else if (missingCorner === 'BL') {
    // Missing bottom-left: triangle covering top-right 3/4
    ctx.moveTo(x, y)                // Top-left
    ctx.lineTo(x + size, y)         // Top-right
    ctx.lineTo(x + size, y + size)  // Bottom-right
  } else if (missingCorner === 'BR') {
    // Missing bottom-right: triangle covering top-left 3/4
    ctx.moveTo(x, y)                // Top-left
    ctx.lineTo(x + size, y)         // Top-right
    ctx.lineTo(x, y + size)         // Bottom-left
  }

  ctx.closePath()
  ctx.fill()
}

// Throttled render function using requestAnimationFrame
const scheduleRender = () => {
  if (pendingRenderFrame !== null) return // Already scheduled

  pendingRenderFrame = requestAnimationFrame(() => {
    renderGrid()
    pendingRenderFrame = null
  })
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
      const cell = grid.value[y][x]
      const cellX = x * cellSize.value
      const cellY = y * cellSize.value
      const type = getCellType(cell)

      if (!cell || isTransparent(cell)) {
        // Clear transparent cells - they'll show the canvas CSS background
        ctx.clearRect(cellX, cellY, cellSize.value, cellSize.value)
      } else if (type === 'full') {
        // Draw full stitch (solid color)
        ctx.fillStyle = cell
        ctx.fillRect(cellX, cellY, cellSize.value, cellSize.value)
      } else if (type === 'half' || type === 'cross' || type === 'quarter' || type === 'threeQuarter' || type === 'mixed') {
        // Clear cell first to make it transparent
        ctx.clearRect(cellX, cellY, cellSize.value, cellSize.value)

        // Determine drawing order based on what was drawn last
        const lastDrawn = cell.lastDrawn || 'halfForward'

        // Collect all stitches to draw with their priority
        const stitchesToDraw = []

        if (cell.forward) stitchesToDraw.push({ type: 'half', direction: '/', color: cell.forward, key: 'halfForward' })
        if (cell.backward) stitchesToDraw.push({ type: 'half', direction: '\\', color: cell.backward, key: 'halfBackward' })
        if (cell.quarterTL) stitchesToDraw.push({ type: 'quarter', corner: 'TL', color: cell.quarterTL, key: 'quarterTL' })
        if (cell.quarterTR) stitchesToDraw.push({ type: 'quarter', corner: 'TR', color: cell.quarterTR, key: 'quarterTR' })
        if (cell.quarterBL) stitchesToDraw.push({ type: 'quarter', corner: 'BL', color: cell.quarterBL, key: 'quarterBL' })
        if (cell.quarterBR) stitchesToDraw.push({ type: 'quarter', corner: 'BR', color: cell.quarterBR, key: 'quarterBR' })
        if (cell.threeQuarterTL) stitchesToDraw.push({ type: 'threeQuarter', corner: 'TL', color: cell.threeQuarterTL, key: 'threeQuarterTL' })
        if (cell.threeQuarterTR) stitchesToDraw.push({ type: 'threeQuarter', corner: 'TR', color: cell.threeQuarterTR, key: 'threeQuarterTR' })
        if (cell.threeQuarterBL) stitchesToDraw.push({ type: 'threeQuarter', corner: 'BL', color: cell.threeQuarterBL, key: 'threeQuarterBL' })
        if (cell.threeQuarterBR) stitchesToDraw.push({ type: 'threeQuarter', corner: 'BR', color: cell.threeQuarterBR, key: 'threeQuarterBR' })

        // Sort so the last-drawn one is rendered last (on top)
        stitchesToDraw.sort((a, b) => {
          if (a.key === lastDrawn) return 1 // Draw last
          if (b.key === lastDrawn) return -1
          return 0
        })

        // Draw all stitches in order
        stitchesToDraw.forEach(stitch => {
          if (stitch.type === 'half') {
            drawHalfStitch(cellX, cellY, cellSize.value, stitch.color, stitch.direction)
          } else if (stitch.type === 'quarter') {
            drawQuarterStitch(cellX, cellY, cellSize.value, stitch.color, stitch.corner)
          } else if (stitch.type === 'threeQuarter') {
            drawThreeQuarterStitch(cellX, cellY, cellSize.value, stitch.color, stitch.corner)
          }
        })
      }
    }
  }

  // Draw grid lines (different styles for multiples of 5 and 10)
  for (let x = 0; x <= gridWidth.value; x++) {
    if (x % 10 === 0) {
      // Bold dark line every 10 columns
      ctx.strokeStyle = '#444'
      ctx.lineWidth = 2
    } else if (x % 5 === 0) {
      // Medium line every 5 columns (but not 10)
      ctx.strokeStyle = '#888'
      ctx.lineWidth = 1.5
    } else {
      // Regular thin line
      ctx.strokeStyle = '#aaa'
      ctx.lineWidth = 1
    }

    ctx.beginPath()
    ctx.moveTo(x * cellSize.value, 0)
    ctx.lineTo(x * cellSize.value, canvas.height)
    ctx.stroke()
  }

  for (let y = 0; y <= gridHeight.value; y++) {
    if (y % 10 === 0) {
      // Bold dark line every 10 rows
      ctx.strokeStyle = '#444'
      ctx.lineWidth = 2
    } else if (y % 5 === 0) {
      // Medium line every 5 rows (but not 10)
      ctx.strokeStyle = '#888'
      ctx.lineWidth = 1.5
    } else {
      // Regular thin line
      ctx.strokeStyle = '#aaa'
      ctx.lineWidth = 1
    }

    ctx.beginPath()
    ctx.moveTo(0, y * cellSize.value)
    ctx.lineTo(canvas.width, y * cellSize.value)
    ctx.stroke()
  }

  // Draw brush preview outline
  if (cursorPosition.value && (tool.value === 'draw' || tool.value === 'erase') && !isDrawing.value) {
    const { x, y } = cursorPosition.value
    const radius = Math.floor(brushSize.value / 2)

    // Use current color for draw tool, red for erase
    if (tool.value === 'draw') {
      // Convert hex to rgba with opacity
      const hex = currentColor.value
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`
    } else {
      ctx.fillStyle = 'rgba(220, 53, 69, 0.3)'  // Red tint for erase
    }

    for (let dy = -radius; dy < brushSize.value - radius; dy++) {
      for (let dx = -radius; dx < brushSize.value - radius; dx++) {
        const targetX = x + dx
        const targetY = y + dy

        if (targetX >= 0 && targetX < gridWidth.value &&
          targetY >= 0 && targetY < gridHeight.value) {
          const cellX = targetX * cellSize.value
          const cellY = targetY * cellSize.value

          // Draw preview based on stitch type
          if (tool.value === 'draw' && stitchType.value !== 'full') {
            // Draw specific stitch preview
            if (stitchType.value === 'halfForward' || stitchType.value === 'halfBackward') {
              const direction = stitchType.value === 'halfForward' ? '/' : '\\'
              // Use a semi-transparent version for preview
              ctx.globalAlpha = 0.4
              drawHalfStitch(cellX, cellY, cellSize.value, currentColor.value, direction)
              ctx.globalAlpha = 1.0
            } else if (stitchType.value.startsWith('quarter')) {
              const corner = stitchType.value.replace('quarter', '')
              ctx.globalAlpha = 0.4
              drawQuarterStitch(cellX, cellY, cellSize.value, currentColor.value, corner)
              ctx.globalAlpha = 1.0
            } else if (stitchType.value.startsWith('threeQuarter')) {
              const corner = stitchType.value.replace('threeQuarter', '')
              ctx.globalAlpha = 0.4
              drawThreeQuarterStitch(cellX, cellY, cellSize.value, currentColor.value, corner)
              ctx.globalAlpha = 1.0
            }
          } else {
            // Full stitch or erase: draw filled rectangle
            ctx.fillRect(cellX, cellY, cellSize.value, cellSize.value)
          }
        }
      }
    }

    // Draw outline around brush area
    ctx.strokeStyle = tool.value === 'draw' ? darkenColor(currentColor.value, 0.4) : '#dc3545'
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
    startingTool.value = null
  }
}

// Apply brush at given position with current brush size
const applyBrush = (centerX, centerY, cellData, stitchTypeParam = null) => {
  const radius = Math.floor(brushSize.value / 2)

  for (let dy = -radius; dy < brushSize.value - radius; dy++) {
    for (let dx = -radius; dx < brushSize.value - radius; dx++) {
      const targetX = centerX + dx
      const targetY = centerY + dy

      // Check bounds
      if (targetX >= 0 && targetX < gridWidth.value &&
        targetY >= 0 && targetY < gridHeight.value) {

        if (stitchTypeParam) {
          // For stitches with specific types, merge with existing cell
          const existingCell = grid.value[targetY][targetX]
          grid.value[targetY][targetX] = addStitch(existingCell, cellData, stitchTypeParam)
        } else {
          // For full stitches or erase, replace cell
          grid.value[targetY][targetX] = cellData
        }
      }
    }
  }
}

const drawPixel = (event) => {
  const { x, y } = getGridCoords(event)

  if (x >= 0 && x < gridWidth.value && y >= 0 && y < gridHeight.value) {
    if (tool.value === 'draw') {
      if (stitchType.value === 'full') {
        applyBrush(x, y, currentColor.value, null)
      } else {
        // Pass the stitch type directly for all other stitch types
        applyBrush(x, y, currentColor.value, stitchType.value)
      }
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
      const pickedCell = grid.value[y][x]
      const pickedColor = getCellColor(pickedCell)
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
    // Only update if position actually changed
    const posChanged = !cursorPosition.value || cursorPosition.value.x !== x || cursorPosition.value.y !== y
    if (posChanged) {
      cursorPosition.value = { x, y }
      scheduleRender()  // Throttled render for brush preview
    }
  }

  draw(event)  // Handle drawing
  updateHoveredColorInfo(event)  // Update color info for eyedropper
}

// Handle mouse leave canvas
const handleMouseLeave = (event) => {
  stopDrawing(event)  // Stop drawing
  hoveredColorInfo.value = null  // Clear color info
  cursorPosition.value = null  // Clear brush preview
  scheduleRender()  // Re-render to clear preview (throttled)
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
  saving.value = true
  saveError.value = null

  try {
    // Extract unique colors (palette) excluding transparent
    const palette = [...new Set(
      grid.value.flat().map(cell => getCellColor(cell))
    )].filter(c => !isTransparent(c))

    // Generate default title if empty
    let finalTitle = title.value.trim()
    if (!finalTitle) {
      if (isEditMode.value) {
        finalTitle = `Design #${designId.value}`
      } else {
        finalTitle = 'Untitled Design'
      }
      // Update the title ref so it shows in the UI
      title.value = finalTitle
    }

    const designData = {
      title: finalTitle,
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
    } else {
      const response = await designsAPI.create(designData)
      // Get the ID from the response and update the route without navigation
      const newDesignId = response.data?.id || response.data
      // Update title with the new ID if it was "Untitled Design"
      if (finalTitle === 'Untitled Design') {
        title.value = `Design #${newDesignId}`
        // Also update it in the backend
        await designsAPI.update(newDesignId, {
          ...designData,
          title: `Design #${newDesignId}`
        })
      }
      // Update URL to edit mode without full page navigation
      router.replace(`/designs/${newDesignId}/edit`)
    }

    // Mark current state as saved
    lastSavedSnapshot.value = JSON.stringify(createSnapshot())

    // Show success alert for 10 seconds
    showSuccessAlert.value = true
    if (successAlertTimer) {
      clearTimeout(successAlertTimer)
    }
    successAlertTimer = setTimeout(() => {
      showSuccessAlert.value = false
    }, 10000)
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
    console.log('Canvas initialized:', canvasRef.value, 'Grid size:', gridWidth.value, 'x', gridHeight.value)
    renderGrid()
    console.log('Grid rendered')
  } else {
    console.error('Canvas ref not found!')
  }

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

    // Clear success alert timer
    if (successAlertTimer) {
      clearTimeout(successAlertTimer)
    }

    // Cancel pending render frame
    if (pendingRenderFrame !== null) {
      cancelAnimationFrame(pendingRenderFrame)
    }
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

/* Success alert */
.success-alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
  font-size: 1rem;
  font-weight: 500;
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
}

/* Error alert */
.error-alert {
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  font-size: 1rem;
  font-weight: 500;
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
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
  background: #fafafa;
  overflow: scroll;
  padding: 1rem;
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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  min-width: 100%;
}

/* Canvas container */
.canvas-container {
  position: relative;
  background: white;
  padding: 1rem 2rem 2rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  height: fit-content;
  width: fit-content;
  justify-content: center;
}

/* Axis numbering styles */
.canvas-with-axes {
  display: inline-block;
}

.axis-top {
  display: flex;
}

.axis-corner {
  flex: 1;
}

.axis-numbers-horizontal {
  display: flex;
  margin-bottom: 6px;
}

.axis-numbers-horizontal .axis-number {
  text-align: center;
  align-items: flex-end;
  justify-content: center;
}

.canvas-row {
  display: flex;
}

.axis-left {
  display: flex;
  flex-direction: column;
  margin-right: 6px;
}

.axis-left .axis-number {
  align-items: center;
  justify-content: flex-end;
}

.axis-number {
  display: flex;
  font-size: 12px;
  color: #666;
  font-family: monospace;
  font-weight: 600;
}

canvas {
  border: 2px solid #ddd;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

canvas[data-tool="draw"],
canvas[data-tool="halfStitch"],
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
