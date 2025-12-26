<!--
  Settings Panel Component
  Shared settings panel for CreateDesign and EditDesign views
-->

<template>
  <div class="settings-panel">
    <!-- Grid Size Settings (only shown in Create mode) -->
    <div v-if="showGridSize" class="setting-group">
      <label>Grid Size:</label>
      <input
        :value="gridWidth"
        @input="$emit('update:gridWidth', Number($event.target.value))"
        type="number"
        min="10"
        max="100"
      />
      ×
      <input
        :value="gridHeight"
        @input="$emit('update:gridHeight', Number($event.target.value))"
        type="number"
        min="10"
        max="100"
      />
      <button @click="$emit('resize')" class="btn btn-small">Resize (centered)</button>
    </div>

    <div class="setting-group">
      <label>Tool: <span class="tool-name">{{ displayedToolName }}</span></label>
      <div>
        <button
          @click="$emit('update:tool', 'draw')"
          @mouseenter="hoveredTool = 'draw'"
          @mouseleave="hoveredTool = null"
          :class="['btn', 'btn-small', { active: tool === 'draw' }]"
          title="Draw"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
        </button>
        <button
          @click="$emit('update:tool', 'erase')"
          @mouseenter="hoveredTool = 'erase'"
          @mouseleave="hoveredTool = null"
          :class="['btn', 'btn-small', { active: tool === 'erase' }]"
          title="Erase"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 20H7L3 16l8-8 4 4 5 5z"/>
            <path d="M11 12l-6 6"/>
          </svg>
        </button>
        <button
          @click="$emit('update:tool', 'bucket')"
          @mouseenter="hoveredTool = 'bucket'"
          @mouseleave="hoveredTool = null"
          :class="['btn', 'btn-small', { active: tool === 'bucket' }]"
          title="Fill"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6.8 11.9L3.7 8.8a2.41 2.41 0 0 1 0-3.4l2.1-2.1a2.41 2.41 0 0 1 3.4 0l3.1 3.1"/>
            <path d="M10.4 8.5l5.1 5.1c.9.9.9 2.4 0 3.3l-3.5 3.5c-.9.9-2.4.9-3.3 0L3.6 15.3c-.9-.9-.9-2.4 0-3.3l3.5-3.5"/>
            <path d="M19 14.5a2 2 0 1 1 2 2 1.5 1.5 0 0 1-1.5 1.5h-4"/>
          </svg>
        </button>
        <button
          @click="$emit('update:tool', 'eyedropper')"
          @mouseenter="hoveredTool = 'eyedropper'"
          @mouseleave="hoveredTool = null"
          :class="['btn', 'btn-small', { active: tool === 'eyedropper' }]"
          title="Eyedropper"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 22l1-1h3l9-9"/>
            <path d="M3 21v-3l9-9"/>
            <path d="M15 6l3-3a2 2 0 1 1 3 3l-3 3m-6-6l6 6"/>
          </svg>
        </button>
        <button
          @click="$emit('update:tool', 'hand')"
          @mouseenter="hoveredTool = 'hand'"
          @mouseleave="hoveredTool = null"
          :class="['btn', 'btn-small', { active: tool === 'hand' }]"
          title="Pan"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="setting-group" v-if="tool === 'draw' || tool === 'erase'">
      <label>Brush Size:</label>
      <div>
        <button
          v-for="size in [1, 2, 3, 4, 5]"
          :key="size"
          @click="$emit('update:brushSize', size)"
          :class="['btn', 'btn-small', 'btn-brush-size', { active: brushSize === size }]"
        >
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

    <!-- <div class="setting-group">
      <label>History:</label>
      <button
        @click="$emit('undo')"
        :disabled="!canUndo"
        class="btn btn-small"
        title="Undo (Ctrl+Z)"
      >
        ↶ Undo
      </button>
      <button
        @click="$emit('redo')"
        :disabled="!canRedo"
        class="btn btn-small"
        title="Redo (Ctrl+Y)"
      >
        ↷ Redo
      </button>
    </div> -->

    <div v-if="showClearButton" class="setting-group">
      <button @click="$emit('clearGrid')" class="btn btn-small">
        🗑️ Clear All
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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
  hoveredColorInfo: {
    type: Object,
    default: null
  },
  // canUndo: {
  //   type: Boolean,
  //   required: true
  // },
  // canRedo: {
  //   type: Boolean,
  //   required: true
  // },
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

defineEmits(['update:currentColor', 'update:tool', 'update:brushSize', 'clearGrid', 'update:gridWidth', 'update:gridHeight', 'resize'])

// Tool name display logic
const hoveredTool = ref(null)

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

.setting-group > div {
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
  min-width: 50px;
  font-size: 0.85rem;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  flex-shrink: 0;
}

.color-info-swatch.placeholder {
  background: repeating-linear-gradient(
    45deg,
    rgba(255,255,255,0.3),
    rgba(255,255,255,0.3) 10px,
    rgba(255,255,255,0.1) 10px,
    rgba(255,255,255,0.1) 20px
  );
}

.color-info-placeholder {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.placeholder-text {
  color: rgba(255,255,255,0.8);
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
</style>
