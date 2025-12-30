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
          :class="{ transparent: currentColor === TRANSPARENT }"
          :style="currentColor !== TRANSPARENT ? { background: currentColor } : {}"
        >
          <div v-if="currentColor === TRANSPARENT" class="checkered-bg"></div>
        </div>
        <div class="current-color-name" v-html="getColorName(currentColor)"></div>
      </div>
    </div>

    <!-- Palette Colors -->
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
        @click="$emit('update:currentColor', color)"
        :title="getColorName(color)"
      >
        <template v-if="color === TRANSPARENT">
          <div class="checkered-bg"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { allDMCColors, TRANSPARENT } from '../../utils/dmcColors'

defineProps({
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

// Get color name for display
const getColorName = (color) => {
  if (color === TRANSPARENT) {
    return 'Transparent / Empty'
  }
  const dmcColor = allDMCColors.find(c => c.hex === color)
  return dmcColor ? `<p>DMC ${dmcColor.code}</p><p>${dmcColor.name}</p>` : color
}
</script>

<style scoped>
.palette {
  background: var(--bg-elevated);
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex:1;
  border: 1px solid var(--border-color-hover);
  box-shadow: var(--shadow-sm);
}

.palette h3 {
  margin: 0;
  color: var(--text-primary);
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
  color: var(--text-primary);
  font-size: 0.9rem;
}

.current-color-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.current-color-swatch {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  border: 3px solid var(--color-primary);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.current-color-swatch.transparent {
  position: relative;
  overflow: hidden;
}

.current-color-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.85rem;
  line-height: 1.3;
  flex: 1;
}

.current-color-name :deep(p) {
  margin: 0;
}

.palette-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  overflow-y: auto;
  padding: 0.25rem;
}

.palette-color {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.palette-color:hover {
  transform: scale(1.15);
  z-index: 1;
}

.palette-color.active {
  border-color: var(--color-primary);
  border-width: 3px;
  box-shadow: 0 0 0 2px rgba(212, 185, 162, 0.25);
}

.palette-color.transparent {
  position: relative;
  overflow: hidden;
}

.checkered-bg {
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(45deg, var(--checkered-bg) 25%, transparent 25%),
    linear-gradient(-45deg, var(--checkered-bg) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--checkered-bg) 75%),
    linear-gradient(-45deg, transparent 75%, var(--checkered-bg) 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
}
</style>
