<!--
  Save Panel Component
  Shared save/update form for CreateDesign and EditDesign views
-->

<template>
  <div class="save-panel">
    <div class="panel-left">
      <router-link v-if="showCancel" to="/designs" class="btn btn-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>My Designs</span>
      </router-link>
      <div class="title-group">
        <!-- Display mode: show title + edit button -->
        <div v-if="!isEditingTitle" class="title-display">
          <span class="title-text">{{ title || titlePlaceholder }}</span>
          <button
            @click="startEditingTitle"
            class="edit-btn"
            type="button"
            aria-label="Edit title"
            title="Edit title"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
          </button>
        </div>

        <!-- Edit mode: show input -->
        <input
          v-else
          ref="titleInput"
          :value="title"
          @input="$emit('update:title', $event.target.value)"
          @blur="stopEditingTitle"
          @keyup.enter="stopEditingTitle"
          @keyup.escape="stopEditingTitle"
          type="text"
          :placeholder="titlePlaceholder"
          class="title-input"
        />
      </div>
    </div>
    <!-- <div class="form-group"> -->
    <!-- <label>Description:</label> -->
    <!-- <textarea -->
    <!-- :value="description" -->
    <!-- @input="$emit('update:description', $event.target.value)" -->
    <!-- :placeholder="descriptionPlaceholder" -->
    <!-- ></textarea> -->
    <!-- </div> -->
    <div class="setting-group">
      <button @click="$emit('undo')" :disabled="!canUndo" class="btn btn-small" title="Undo (Ctrl+Z)">
        ↶ Undo
      </button>
      <button @click="$emit('redo')" :disabled="!canRedo" class="btn btn-small" title="Redo (Ctrl+Y)">
        ↷ Redo
      </button>
    </div>
    <button @click="$emit('save')" class="btn btn-primary" :disabled="saving">
      {{ saving ? 'Saving...' : saveButtonText }}
    </button>

    <div v-if="saveError" class="error-message">{{ saveError }}</div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  saving: {
    type: Boolean,
    required: true
  },
  saveError: {
    type: String,
    default: null
  },
  panelTitle: {
    type: String,
    default: 'Save Design'
  },
  saveButtonText: {
    type: String,
    default: 'Save Design'
  },
  titlePlaceholder: {
    type: String,
    default: ''
  },
  descriptionPlaceholder: {
    type: String,
    default: ''
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  canUndo: {
    type: Boolean,
    required: true
  },
  canRedo: {
    type: Boolean,
    required: true
  },
})

defineEmits(['update:title', 'update:description', 'save', 'undo', 'redo'])

// Inline title editing
const isEditingTitle = ref(false)
const titleInput = ref(null)

const startEditingTitle = async () => {
  isEditingTitle.value = true
  await nextTick()
  titleInput.value?.focus()
}

const stopEditingTitle = () => {
  isEditingTitle.value = false
}
</script>

<style scoped>
.save-panel {
  background: white;
  padding: 1em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee
}

.panel-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Title group */
.title-group {
  min-width: 250px;
  border-left: solid 1px #ddd;
  padding-left: 1rem;
}

.title-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.title-display:hover {
  background-color: #f5f5f5;
}

.title-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  min-width: 200px;
}

.edit-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0.6;
}

.edit-btn:hover {
  opacity: 1;
  background-color: #e0e0e0;
  color: #333;
}

.title-input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #667eea;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 500;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.setting-group {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
}

.btn:hover {
  background: #f5f5f5;
}

.btn-back {
  border: none;
  color: #5f4d31;
}

.btn-back svg {
  flex-shrink: 0;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  cursor: not-allowed;
}

.error-message {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #fee;
  color: #c33;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>
