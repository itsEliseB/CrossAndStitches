<!--
  Grid Controls Component
  Shared grid modification controls for CreateDesign and EditDesign views
-->

<template>
  <div class="grid-controls">
    <h3>Modify Grid</h3>
    <div class="controls-layout">
      <div class="control-row">
        <button @click="$emit('addRowTop')" class="btn btn-small btn-add">⬆️ Add Row Top</button>
        <button @click="$emit('removeRowTop')" class="btn btn-small btn-remove" :disabled="gridHeight <= 5">❌ Remove Top</button>
      </div>
      <div class="control-row">
        <button @click="$emit('addColumnLeft')" class="btn btn-small btn-add">⬅️ Add Column Left</button>
        <button @click="$emit('removeColumnLeft')" class="btn btn-small btn-remove" :disabled="gridWidth <= 5">❌ Remove Left</button>
        <span class="grid-info">{{ gridHeight }}×{{ gridWidth }}</span>
        <button @click="$emit('removeColumnRight')" class="btn btn-small btn-remove" :disabled="gridWidth <= 5">❌ Remove Right</button>
        <button @click="$emit('addColumnRight')" class="btn btn-small btn-add">➡️ Add Column Right</button>
      </div>
      <div class="control-row">
        <button @click="$emit('addRowBottom')" class="btn btn-small btn-add">⬇️ Add Row Bottom</button>
        <button @click="$emit('removeRowBottom')" class="btn btn-small btn-remove" :disabled="gridHeight <= 5">❌ Remove Bottom</button>
      </div>
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
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.grid-controls h3 {
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
}

.controls-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.control-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.grid-info {
  min-width: 80px;
  text-align: center;
  font-weight: bold;
  color: #667eea;
  padding: 0.5rem;
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

.btn-small {
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-add {
  background: #e6f7e6;
  border-color: #28a745;
  color: #28a745;
}

.btn-add:hover:not(:disabled) {
  background: #28a745;
  color: white;
}

.btn-remove {
  background: #ffe6e6;
  border-color: #dc3545;
  color: #dc3545;
}

.btn-remove:hover:not(:disabled) {
  background: #dc3545;
  color: white;
}
</style>
