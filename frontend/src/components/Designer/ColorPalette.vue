<!--
  Color Palette Component
  Shared DMC thread color palette for CreateDesign and EditDesign views
-->

<template>
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
        @click="$emit('update:currentColor', color)"
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
  return dmcColor ? `DMC ${dmcColor.code} - ${dmcColor.name}` : color
}
</script>

<style scoped>
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
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
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

.color-info strong {
  color: #333;
}
</style>
