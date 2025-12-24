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
      <label>Current Color:</label>
      <input
        :value="currentColor"
        @input="$emit('update:currentColor', $event.target.value)"
        type="color"
      />
      <span class="color-display" :style="{ background: currentColor }"></span>
    </div>

    <div class="setting-group">
      <label>Tool:</label>
      <button
        @click="$emit('update:tool', 'draw')"
        :class="['btn', 'btn-small', { active: tool === 'draw' }]"
      >
        ✏️ Draw
      </button>
      <button
        @click="$emit('update:tool', 'erase')"
        :class="['btn', 'btn-small', { active: tool === 'erase' }]"
      >
        🧹 Erase
      </button>
      <button
        @click="$emit('update:tool', 'bucket')"
        :class="['btn', 'btn-small', { active: tool === 'bucket' }]"
      >
        🪣 Fill
      </button>
      <button
        @click="$emit('update:tool', 'eyedropper')"
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
        @click="$emit('update:brushSize', size)"
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
    </div>

    <div v-if="showClearButton" class="setting-group">
      <button @click="$emit('clearGrid')" class="btn btn-small">
        🗑️ Clear All
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
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
  canUndo: {
    type: Boolean,
    required: true
  },
  canRedo: {
    type: Boolean,
    required: true
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

defineEmits(['update:currentColor', 'update:tool', 'update:brushSize', 'undo', 'redo', 'clearGrid', 'update:gridWidth', 'update:gridHeight', 'resize'])
</script>

<style scoped>
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
