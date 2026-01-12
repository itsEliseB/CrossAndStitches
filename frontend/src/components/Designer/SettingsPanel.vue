<!--
  Settings Panel Component
  Shared settings panel for CreateDesign and EditDesign views
-->

<template>
  <div class="settings-panel">
    <!-- Grid Size Settings (only shown in Create mode) -->
    <div v-if="showGridSize" class="setting-group">
      <label>Grid Size:</label>
      <div id="grid-size-setting">
        <input v-model.number="localGridWidth" type="number" min="1" max="300" />
        ×
        <input v-model.number="localGridHeight" type="number" min="1" max="300" />
        <button @click="applyGridSize" class="btn btn-small">Resize</button>
      </div>
    </div>

    <div class="setting-group">
      <label>Tool: <span class="tool-name">{{ displayedToolName }}</span></label>
      <div>
        <button @click="$emit('update:tool', 'draw')" @mouseenter="hoveredTool = 'draw'"
          @mouseleave="hoveredTool = null" :class="['btn', 'btn-small', { active: tool === 'draw' }]" title="Draw">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </button>
        <button @click="$emit('update:tool', 'erase')" @mouseenter="hoveredTool = 'erase'"
          @mouseleave="hoveredTool = null" :class="['btn', 'btn-small', { active: tool === 'erase' }]" title="Erase">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 20H7L3 16l8-8 4 4 5 5z" />
            <path d="M11 12l-6 6" />
          </svg>
        </button>
        <button @click="$emit('update:tool', 'bucket')" @mouseenter="hoveredTool = 'bucket'"
          @mouseleave="hoveredTool = null" :class="['btn', 'btn-small', { active: tool === 'bucket' }]" title="Fill">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M6.8 11.9L3.7 8.8a2.41 2.41 0 0 1 0-3.4l2.1-2.1a2.41 2.41 0 0 1 3.4 0l3.1 3.1" />
            <path
              d="M10.4 8.5l5.1 5.1c.9.9.9 2.4 0 3.3l-3.5 3.5c-.9.9-2.4.9-3.3 0L3.6 15.3c-.9-.9-.9-2.4 0-3.3l3.5-3.5" />
            <path d="M19 14.5a2 2 0 1 1 2 2 1.5 1.5 0 0 1-1.5 1.5h-4" />
          </svg>
        </button>
        <button @click="$emit('update:tool', 'eyedropper')" @mouseenter="hoveredTool = 'eyedropper'"
          @mouseleave="hoveredTool = null" :class="['btn', 'btn-small', { active: tool === 'eyedropper' }]"
          title="Eyedropper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 22l1-1h3l9-9" />
            <path d="M3 21v-3l9-9" />
            <path d="M15 6l3-3a2 2 0 1 1 3 3l-3 3m-6-6l6 6" />
          </svg>
        </button>
        <button @click="$emit('update:tool', 'hand')" @mouseenter="hoveredTool = 'hand'"
          @mouseleave="hoveredTool = null" :class="['btn', 'btn-small', { active: tool === 'hand' }]" title="Pan">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
            <path
              d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        </button>
      </div>
    </div>

    <div class="setting-group" v-if="tool === 'draw'">
      <label>Stitch Type:</label>
      <div>
        <button @click="$emit('update:stitchType', 'full')" @mouseenter="hoveredStitchType = 'full'"
          @mouseleave="hoveredStitchType = null" :class="['btn', 'btn-small', { active: stitchType === 'full' }]" title="Full Stitch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" />
          </svg>
        </button>
        <button @click="$emit('update:stitchType', 'halfForward')" @mouseenter="hoveredStitchType = 'halfForward'"
          @mouseleave="hoveredStitchType = null" :class="['btn', 'btn-small', { active: stitchType === 'halfForward' }]" title="Half Stitch (/)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
            <line x1="3" y1="21" x2="21" y2="3" stroke-width="2.5" />
          </svg>
        </button>
        <button @click="$emit('update:stitchType', 'halfBackward')" @mouseenter="hoveredStitchType = 'halfBackward'"
          @mouseleave="hoveredStitchType = null" :class="['btn', 'btn-small', { active: stitchType === 'halfBackward' }]" title="Half Stitch (\)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
            <line x1="3" y1="3" x2="21" y2="21" stroke-width="2.5" />
          </svg>
        </button>

        <!-- Quarter Stitch with dropdown -->
        <div class="stitch-dropdown-wrapper">
          <button @click="toggleDropdown('quarter', $event)" :class="['btn', 'btn-small', 'btn-with-dropdown', { active: isQuarterActive }]" title="Quarter Stitch">
            <!-- Top-Left Quarter -->
            <svg v-if="stitchType === 'quarterTL'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
              <line x1="12" y1="12" x2="3" y2="3" stroke-width="2.5" />
            </svg>
            <!-- Top-Right Quarter -->
            <svg v-else-if="stitchType === 'quarterTR'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
              <line x1="12" y1="12" x2="21" y2="3" stroke-width="2.5" />
            </svg>
            <!-- Bottom-Left Quarter -->
            <svg v-else-if="stitchType === 'quarterBL'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
              <line x1="12" y1="12" x2="3" y2="21" stroke-width="2.5" />
            </svg>
            <!-- Bottom-Right Quarter -->
            <svg v-else-if="stitchType === 'quarterBR'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
              <line x1="12" y1="12" x2="21" y2="21" stroke-width="2.5" />
            </svg>
            <!-- Default (when no quarter is selected) -->
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
              <line x1="12" y1="12" x2="3" y2="3" stroke-width="2.5" />
            </svg>
            <span class="dropdown-arrow">▼</span>
          </button>

          <div v-if="openDropdown === 'quarter'" class="stitch-dropdown">
            <button @click="selectQuarterStitch('TL')" :class="['dropdown-item', { active: stitchType === 'quarterTL' }]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
                <line x1="12" y1="12" x2="3" y2="3" stroke-width="2.5" />
              </svg>
              <span>Top-Left</span>
            </button>
            <button @click="selectQuarterStitch('TR')" :class="['dropdown-item', { active: stitchType === 'quarterTR' }]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
                <line x1="12" y1="12" x2="21" y2="3" stroke-width="2.5" />
              </svg>
              <span>Top-Right</span>
            </button>
            <button @click="selectQuarterStitch('BL')" :class="['dropdown-item', { active: stitchType === 'quarterBL' }]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
                <line x1="12" y1="12" x2="3" y2="21" stroke-width="2.5" />
              </svg>
              <span>Bottom-Left</span>
            </button>
            <button @click="selectQuarterStitch('BR')" :class="['dropdown-item', { active: stitchType === 'quarterBR' }]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
                <line x1="12" y1="12" x2="21" y2="21" stroke-width="2.5" />
              </svg>
              <span>Bottom-Right</span>
            </button>
          </div>
        </div>

        <!-- Three-Quarter Stitch with dropdown -->
        <div class="stitch-dropdown-wrapper">
          <button @click="toggleDropdown('threeQuarter', $event)" :class="['btn', 'btn-small', 'btn-with-dropdown', { active: isThreeQuarterActive }]" title="3/4 Stitch">
            <!-- Bottom-Right 3/4 -->
            <svg v-if="stitchType === 'threeQuarterTL'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
              <polygon points="21,3 21,21 3,21" fill="currentColor" opacity="0.7" />
            </svg>
            <!-- Bottom-Left 3/4 -->
            <svg v-else-if="stitchType === 'threeQuarterTR'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
              <polygon points="3,3 3,21 21,21" fill="currentColor" opacity="0.7" />
            </svg>
            <!-- Top-Right 3/4 -->
            <svg v-else-if="stitchType === 'threeQuarterBL'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
              <polygon points="3,3 21,3 21,21" fill="currentColor" opacity="0.7" />
            </svg>
            <!-- Top-Left 3/4 -->
            <svg v-else-if="stitchType === 'threeQuarterBR'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
              <polygon points="3,3 21,3 3,21" fill="currentColor" opacity="0.7" />
            </svg>
            <!-- Default (when no three-quarter is selected) -->
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
              <polygon points="21,3 21,21 3,21" fill="currentColor" opacity="0.7" />
            </svg>
            <span class="dropdown-arrow">▼</span>
          </button>

          <div v-if="openDropdown === 'threeQuarter'" class="stitch-dropdown">
            <button @click="selectThreeQuarterStitch('TL')" :class="['dropdown-item', { active: stitchType === 'threeQuarterTL' }]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
                <polygon points="21,3 21,21 3,21" fill="currentColor" opacity="0.7" />
              </svg>
              <span>Bottom Right</span>
            </button>
            <button @click="selectThreeQuarterStitch('TR')" :class="['dropdown-item', { active: stitchType === 'threeQuarterTR' }]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
                <polygon points="3,3 3,21 21,21" fill="currentColor" opacity="0.7" />
              </svg>
              <span>Bottom Left</span>
            </button>
            <button @click="selectThreeQuarterStitch('BL')" :class="['dropdown-item', { active: stitchType === 'threeQuarterBL' }]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
                <polygon points="3,3 21,3 21,21" fill="currentColor" opacity="0.7" />
              </svg>
              <span>Top Right</span>
            </button>
            <button @click="selectThreeQuarterStitch('BR')" :class="['dropdown-item', { active: stitchType === 'threeQuarterBR' }]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" stroke-width="1.5" />
                <polygon points="3,3 21,3 3,21" fill="currentColor" opacity="0.7" />
              </svg>
              <span>Top Left</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="setting-group" v-if="tool === 'draw' || tool === 'erase'">
      <label>Brush Size:</label>
      <div>
        <button v-for="size in [1, 2, 3, 4, 5]" :key="size" @click="$emit('update:brushSize', size)"
          :class="['btn', 'btn-small', 'btn-brush-size', { active: brushSize === size }]">
          {{ size }}
        </button>
      </div>
    </div>

    <!-- Eyedropper color info display (always visible when eyedropper is selected) -->
    <div v-if="tool === 'eyedropper'" class="color-info-display">
      <label>Hovered Color:</label>
      <div v-if="hoveredColorInfo" class="color-info-content">
        <div class="color-info-swatch" :style="{ backgroundColor: hoveredColorInfo.hex || 'transparent' }"></div>
        <div class="color-info-text">
          <strong>{{ hoveredColorInfo.code }}</strong>
          <span>{{ hoveredColorInfo.name }}</span>
          <small v-if="hoveredColorInfo.hex">{{ hoveredColorInfo.hex }}</small>
        </div>
      </div>
      <div v-else class="color-info-placeholder">
        <div class="color-info-swatch placeholder"></div>
        <div class="color-info-text">
          <span class="placeholder-text">Hover over canvas to see color</span>
        </div>
      </div>
    </div>
    <div v-if="showClearButton" class="setting-group">
      <button @click="$emit('clearGrid')" class="btn btn-small">
        🗑️ Clear All
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  currentColor: {
    type: String,
    required: true
  },
  tool: {
    type: String,
    required: true
  },
  brushSize: {
    type: Number,
    required: true
  },
  stitchType: {
    type: String,
    default: 'full'
  },
  hoveredColorInfo: {
    type: Object,
    default: null
  },
  showClearButton: {
    type: Boolean,
    default: false
  },
  showGridSize: {
    type: Boolean,
    default: false
  },
  gridWidth: {
    type: Number,
    default: 30
  },
  gridHeight: {
    type: Number,
    default: 30
  }
})

const emit = defineEmits(['update:currentColor', 'update:tool', 'update:brushSize', 'update:stitchType', 'clearGrid', 'update:gridWidth', 'update:gridHeight', 'resize'])

// Local grid size state (for inputs)
const localGridWidth = ref(props.gridWidth)
const localGridHeight = ref(props.gridHeight)

// Watch props to update local state when grid is resized externally
watch(() => props.gridWidth, (newVal) => {
  localGridWidth.value = newVal
})
watch(() => props.gridHeight, (newVal) => {
  localGridHeight.value = newVal
})

// Apply grid size only when button is clicked
const applyGridSize = () => {
  emit('update:gridWidth', localGridWidth.value)
  emit('update:gridHeight', localGridHeight.value)
  emit('resize')
}

// Tool name display logic
const hoveredTool = ref(null)
const hoveredStitchType = ref(null)

const toolNames = {
  draw: 'Draw',
  erase: 'Erase',
  bucket: 'Fill',
  eyedropper: 'Eyedropper',
  hand: 'Move/Hand'
}

const displayedToolName = computed(() => {
  const tool = hoveredTool.value || props.tool
  return toolNames[tool] || tool
})

// Dropdown state for quarter and three-quarter stitches
const openDropdown = ref(null) // 'quarter' or 'threeQuarter' or null

const toggleDropdown = (type, event) => {
  event.stopPropagation()
  openDropdown.value = openDropdown.value === type ? null : type
}

const selectQuarterStitch = (corner) => {
  emit('update:stitchType', `quarter${corner}`)
  openDropdown.value = null
}

const selectThreeQuarterStitch = (corner) => {
  emit('update:stitchType', `threeQuarter${corner}`)
  openDropdown.value = null
}

// Check if a quarter or three-quarter stitch is active
const isQuarterActive = computed(() => {
  return props.stitchType.startsWith('quarter')
})

const isThreeQuarterActive = computed(() => {
  return props.stitchType.startsWith('threeQuarter')
})

// Close dropdown when clicking outside
const handleClickOutside = () => {
  openDropdown.value = null
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.settings-panel {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.setting-group>div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.setting-group label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
  width: 100%;
}

.tool-name {
  color: #667eea;
  font-weight: 600;
}

.setting-group input[type="number"] {
  width: 60px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.setting-group #grid-size-setting {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.setting-group #grid-size-setting button {
  flex: 1;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-brush-size {
  padding: 0.5em;
  font-size: 0.85rem;
  width: 32px;
  height: 32px;
}

.btn-direction {
  padding: 0.4rem;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Eyedropper color info display */
.color-info-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin: 0;
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

.color-info-swatch.placeholder {
  background: repeating-linear-gradient(45deg,
      rgba(255, 255, 255, 0.3),
      rgba(255, 255, 255, 0.3) 10px,
      rgba(255, 255, 255, 0.1) 10px,
      rgba(255, 255, 255, 0.1) 20px);
}

.color-info-placeholder {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.placeholder-text {
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  font-size: 0.9rem;
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

/* Dropdown styles for quarter and three-quarter stitches */
.stitch-dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.btn-with-dropdown {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.dropdown-arrow {
  font-size: 0.6em;
  opacity: 0.7;
}

.stitch-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 160px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: white;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
  font-size: 0.85rem;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.active {
  background: #667eea;
  color: white;
}

.dropdown-item.active svg {
  stroke: white;
}

.dropdown-item.active svg rect {
  fill: none;
}

.dropdown-item.active svg polygon {
  fill: white;
}

.dropdown-item.active svg line {
  stroke: white;
}

.dropdown-item:first-child {
  border-radius: 4px 4px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 4px 4px;
}
</style>
