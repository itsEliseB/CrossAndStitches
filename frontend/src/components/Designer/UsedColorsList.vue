<!--
  Used Colors List Component
  Displays all colors currently used in the design with stitch counts
-->

<template>
  <div class="used-colors-panel">
    <h3>Used Colors ({{ usedColorsData.length }})</h3>

    <div v-if="usedColorsData.length === 0" class="empty-state">
      No colors used yet
    </div>

    <template v-else>
      <!-- Selected Color Detail Display -->
      <div v-if="selectedColor" class="selected-color-display">
        <div class="selected-color-swatch" :style="{ backgroundColor: selectedColor.hex }">
          <span class="swatch-code" :style="{ color: getTextColor(selectedColor.hex) }">{{ selectedColor.code }}</span>
        </div>
        <div class="selected-color-info">
          <div class="color-name">{{ selectedColor.name }} </div>
          <div class="stitch-count">{{ selectedColor.stitchCount }} stitches</div>
        </div>
      </div>

      <!-- Color Swatches Grid -->
      <div class="used-colors-grid">
        <div
          v-for="colorData in usedColorsData"
          :key="colorData.hex"
          class="color-square"
          :class="{ active: selectedColor?.hex === colorData.hex }"
          :style="{ backgroundColor: colorData.hex }"
          :title="`DMC ${colorData.code} - ${colorData.stitchCount} stitches`"
          @click="selectColor(colorData)"
        ></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { allDMCColors, TRANSPARENT, isTransparent } from '../../utils/dmcColors'

const props = defineProps({
  grid: {
    type: Array,
    required: true
  }
})

// Selected color for detail view
const selectedColor = ref(null)

// Helper function to extract colors from cell (handles both string and object formats)
const getCellColors = (cell) => {
  if (!cell || isTransparent(cell)) return []
  // If cell is a string, it's a full stitch color
  if (typeof cell === 'string') return [cell]
  // If cell is an object with any type of stitches
  const colors = []
  if (cell.forward) colors.push(cell.forward)
  if (cell.backward) colors.push(cell.backward)
  if (cell.quarterTL) colors.push(cell.quarterTL)
  if (cell.quarterTR) colors.push(cell.quarterTR)
  if (cell.quarterBL) colors.push(cell.quarterBL)
  if (cell.quarterBR) colors.push(cell.quarterBR)
  if (cell.threeQuarterTL) colors.push(cell.threeQuarterTL)
  if (cell.threeQuarterTR) colors.push(cell.threeQuarterTR)
  if (cell.threeQuarterBL) colors.push(cell.threeQuarterBL)
  if (cell.threeQuarterBR) colors.push(cell.threeQuarterBR)
  return colors
}

// Compute used colors with stitch counts
const usedColorsData = computed(() => {
  // Flatten grid and count occurrences
  const colorCounts = {}

  props.grid.forEach(row => {
    row.forEach(cell => {
      const colors = getCellColors(cell)
      colors.forEach(color => {
        if (!isTransparent(color)) {
          colorCounts[color] = (colorCounts[color] || 0) + 1
        }
      })
    })
  })

  // Convert to array with DMC info
  return Object.entries(colorCounts)
    .map(([hex, count]) => {
      const dmcColor = allDMCColors.find(c => c.hex === hex)
      return {
        hex,
        code: dmcColor?.code || '???',
        name: dmcColor?.name || 'Unknown',
        stitchCount: count
      }
    })
    .sort((a, b) => b.stitchCount - a.stitchCount) // Sort by most used
})

// Auto-select first color when colors change
watch(usedColorsData, (newColors) => {
  if (newColors.length > 0 && !selectedColor.value) {
    selectedColor.value = newColors[0]
  } else if (newColors.length === 0) {
    selectedColor.value = null
  } else if (selectedColor.value) {
    // Update selected color data if it still exists
    const updated = newColors.find(c => c.hex === selectedColor.value.hex)
    if (updated) {
      selectedColor.value = updated
    } else {
      selectedColor.value = newColors[0]
    }
  }
}, { immediate: true })

// Select a color
const selectColor = (colorData) => {
  selectedColor.value = colorData
}

// Calculate luminance and determine text color (black or white)
const getTextColor = (hex) => {
  if (!hex) return '#333'

  // Convert hex to RGB
  const hexClean = hex.replace('#', '')
  const r = parseInt(hexClean.substring(0, 2), 16)
  const g = parseInt(hexClean.substring(2, 4), 16)
  const b = parseInt(hexClean.substring(4, 6), 16)

  // Calculate relative luminance using WCAG formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}
</script>

<style scoped>
.used-colors-panel {
  background: var(--bg-elevated);
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid var(--border-color-hover);
  box-shadow: var(--shadow-sm);
}

.used-colors-panel h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.empty-state {
  padding: 1rem;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.9rem;
  font-style: italic;
}

/* Selected Color Detail Display */
.selected-color-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.selected-color-swatch {
  width: 50px;
  height: 100%;
  border-radius: 4px;
  border: 3px solid var(--color-primary);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-color-swatch .swatch-code {
  font-size: 12px;
  font-weight: 600;
  user-select: none;
  position: relative;
  z-index: 1;
}

.selected-color-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.color-code {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.color-name {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.2;
}

.stitch-count {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-weight: 500;
  margin-top: 0.15rem;
}

/* Color Swatches Grid */
.used-colors-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.25rem;
  max-height: 200px;
  overflow-y: auto;
}

.color-square {
  width: 36px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.color-square:hover {
  transform: scale(1.15);
  z-index: 1;
}

.color-square.active {
  border-color: var(--color-primary);
  border-width: 3px;
  box-shadow: 0 0 0 2px rgba(212, 185, 162, 0.25);
}
</style>
