<!--
  Grid Controls Component
  Edge-positioned buttons for grid modification
-->

<template>
  <div class="grid-controls">
    <!-- Top controls -->
    <div class="control-edge top">
      <button @click="$emit('addRowTop')" class="btn-edge btn-add" title="Add row to top">+</button>
      <button @click="$emit('removeRowTop')" class="btn-edge btn-remove" :disabled="gridHeight <= 5" title="Remove top row">−</button>
    </div>

    <!-- Bottom controls -->
    <div class="control-edge bottom">
      <button @click="$emit('addRowBottom')" class="btn-edge btn-add" title="Add row to bottom">+</button>
      <button @click="$emit('removeRowBottom')" class="btn-edge btn-remove" :disabled="gridHeight <= 5" title="Remove bottom row">−</button>
    </div>

    <!-- Left controls -->
    <div class="control-edge left">
      <button @click="$emit('addColumnLeft')" class="btn-edge btn-add" title="Add column to left">+</button>
      <button @click="$emit('removeColumnLeft')" class="btn-edge btn-remove" :disabled="gridWidth <= 5" title="Remove left column">−</button>
    </div>

    <!-- Right controls -->
    <div class="control-edge right">
      <button @click="$emit('addColumnRight')" class="btn-edge btn-add" title="Add column to right">+</button>
      <button @click="$emit('removeColumnRight')" class="btn-edge btn-remove" :disabled="gridWidth <= 5" title="Remove right column">−</button>
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
}

.control-edge {
  position: absolute;
  display: flex;
  gap: 0.5rem;
  pointer-events: auto;
}

.control-edge.top {
  left: 50%;
  transform: translateX(-50%);
}

.control-edge.bottom {
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
}

.control-edge.left {
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.control-edge.right {
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.btn-edge {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.btn-edge:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.btn-edge:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.btn-edge:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: #f5f5f5;
}

.btn-add {
  color: #4caf50;
  border-color: #4caf50;
}

.btn-add:hover:not(:disabled) {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.btn-remove {
  color: #f44336;
  border-color: #f44336;
}

.btn-remove:hover:not(:disabled) {
  background: #f44336;
  color: white;
  border-color: #f44336;
}
</style>
