<!--
  Color Palette Component
  Shared DMC thread color palette for CreateDesign and EditDesign views
-->

<template>
  <div class="palette">
    <h3>Color Palette</h3>

    <!-- Current Color Display -->
    <div class="current-color-display">
      <label>Current Color:</label>
      <div class="current-color-box">
        <div
          class="current-color-swatch"
          :class="{ 'transparent checkered-bg': currentColor === TRANSPARENT }"
          :style="currentColor !== TRANSPARENT ? { background: currentColor } : {}"
        >
          <!-- <div v-if="currentColor === TRANSPARENT" class="checkered-bg"> {{ getColorName(currentColor) }}</div> -->
        </div>
        <div class="current-color-name">{{ getColorName(currentColor) }}</div>
      </div>
    </div>

    <!-- Palette Colors -->
    <div class="palette-colors">
      <div
        v-for="(color, index) in uniquePaletteColors"
        :key="`${color}-${index}`"
        class="palette-color-item"
        @click="$emit('update:currentColor', color)"
      >
        <div
          class="palette-color-swatch"
          :class="{
            active: currentColor === color,
            transparent: color === TRANSPARENT,
            'checkered-bg': color === TRANSPARENT
          }"
          :style="color !== TRANSPARENT ? { background: color } : {}"
          :title="getColorName(color)"
        >
          <span class="color-code" :style="{ color: getTextColor(color) }">{{ getColorCode(color) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { allDMCColors, TRANSPARENT } from '../../utils/dmcColors'

const props = defineProps({
  currentColor: {
    type: String,
    required: true
  },
  paletteColors: {
    type: Array,
    required: true
  }
})

defineEmits(['update:currentColor'])

// Deduplicate colors (remove duplicate hex values)
const uniquePaletteColors = computed(() => {
  return [...new Set(props.paletteColors)]
})

// Get color name for display
const getColorName = (color) => {
  if (color === TRANSPARENT) {
    return 'Transparent / Empty'
  }
  const dmcColor = allDMCColors.find(c => c.hex === color)
  return dmcColor ? `DMC ${dmcColor.code} - ${dmcColor.name}` : color
}

// Get color code for display
const getColorCode = (color) => {
  if (color === TRANSPARENT) {
    return 'EMPTY'
  }
  const dmcColor = allDMCColors.find(c => c.hex === color)
  return dmcColor ? dmcColor.code : '?'
}

// Calculate luminance and determine text color (black or white)
const getTextColor = (color) => {
  if (color === TRANSPARENT) {
    return '#333'
  }

  // Convert hex to RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calculate relative luminance using WCAG formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}
</script>

<style scoped>
.palette {
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.palette h3 {
  margin: 0;
  color: #333;
  font-size: 1rem;
}

/* Current Color Display */
.current-color-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.current-color-display label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.current-color-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.current-color-swatch {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  border: 3px solid #667eea;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.current-color-swatch.transparent {
  position: relative;
  overflow: hidden;
}

.current-color-name {
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
  line-height: 1.3;
  flex: 1;
}

.palette-colors {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(62px, 1fr));
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.25rem;
}

.palette-color-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}

.palette-color-swatch {
  width: 62px;
  height: 32px;
  border-radius: 4px;
  border: 2px solid #ddd;
  transition: all 0.2s;
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.palette-color-item:hover .palette-color-swatch {
  transform: translateY(-2px);
  z-index: 1;
}

.palette-color-swatch.active {
  border-color: #667eea;
  border-width: 3px;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.palette-color-swatch.transparent {
  position: relative;
  overflow: hidden;
}

.checkered-bg {
  background-image:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
  z-index: 0;
}

.palette-color-swatch .color-code {
  font-size:12px;
  font-weight: 600;
  user-select: none;
  position: relative;
  z-index: 1;
}
</style>
