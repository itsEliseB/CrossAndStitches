<!--
  Grid Controls Component
  Edge-positioned buttons for grid modification
-->

<template>
  <div class="grid-controls">
    <!-- Top controls -->
    <div class="control-edge top">
      <button @click="$emit('addRowTop')" class="btn-edge btn-add" title="Add row to top">+</button>
      <button @click="$emit('removeRowTop')" class="btn-edge btn-remove" :disabled="gridHeight <= 1" title="Remove top row">−</button>
    </div>

    <!-- Bottom controls -->
    <div class="control-edge bottom">
      <button @click="$emit('addRowBottom')" class="btn-edge btn-add" title="Add row to bottom">+</button>
      <button @click="$emit('removeRowBottom')" class="btn-edge btn-remove" :disabled="gridHeight <= 1" title="Remove bottom row">−</button>
    </div>

    <!-- Left controls -->
    <div class="control-edge left">
      <button @click="$emit('addColumnLeft')" class="btn-edge btn-add" title="Add column to left">+</button>
      <button @click="$emit('removeColumnLeft')" class="btn-edge btn-remove" :disabled="gridWidth <= 1" title="Remove left column">−</button>
    </div>

    <!-- Right controls -->
    <div class="control-edge right">
      <button @click="$emit('addColumnRight')" class="btn-edge btn-add" title="Add column to right">+</button>
      <button @click="$emit('removeColumnRight')" class="btn-edge btn-remove" :disabled="gridWidth <= 1" title="Remove right column">−</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  gridWidth: {
    type: Number,
    required: true
  },
  gridHeight: {
    type: Number,
    required: true
  }
})

defineEmits(['addRowTop', 'removeRowTop', 'addRowBottom', 'removeRowBottom', 'addColumnLeft', 'removeColumnLeft', 'addColumnRight', 'removeColumnRight'])
</script>

<style scoped>
.grid-controls {
  position: absolute;
  inset: 0;
  pointer-events: none;
  margin:-1rem;
}

.control-edge {
  position: absolute;
  display: flex;
  gap: 0.5rem;
  pointer-events: auto;
}

.control-edge.top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.control-edge.bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.control-edge.left {
  right:100%;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.control-edge.right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.btn-edge {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 2px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-xs);
}

.btn-edge:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.btn-edge:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-xs);
}

.btn-edge:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: var(--bg-secondary);
}

.btn-add {
  color: var(--color-success);
  border-color: var(--color-success);
}

.btn-add:hover:not(:disabled) {
  background: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.btn-remove {
  color: var(--color-error);
  border-color: var(--color-error);
}

.btn-remove:hover:not(:disabled) {
  background: var(--color-error);
  color: white;
  border-color: var(--color-error);
}
</style>
