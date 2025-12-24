<!--
  Save Panel Component
  Shared save/update form for CreateDesign and EditDesign views
-->

<template>
  <div class="save-panel">
    <h3>{{ panelTitle }}</h3>
    <div class="form-group">
      <label>Title:</label>
      <input
        :value="title"
        @input="$emit('update:title', $event.target.value)"
        type="text"
        :placeholder="titlePlaceholder"
      />
    </div>
    <div class="form-group">
      <label>Description:</label>
      <textarea
        :value="description"
        @input="$emit('update:description', $event.target.value)"
        :placeholder="descriptionPlaceholder"
      ></textarea>
    </div>
    <button @click="$emit('save')" class="btn btn-primary" :disabled="saving">
      {{ saving ? 'Saving...' : saveButtonText }}
    </button>
    <router-link v-if="showCancel" to="/designs" class="btn">Cancel</router-link>
    <div v-if="saveError" class="error-message">{{ saveError }}</div>
  </div>
</template>

<script setup>
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
  }
})

defineEmits(['update:title', 'update:description', 'save'])
</script>

<style scoped>
.save-panel {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.save-panel h3 {
  margin-bottom: 1rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  margin-right: 0.5rem;
}

.btn:hover {
  background: #f5f5f5;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee;
  color: #c33;
  border-radius: 4px;
}
</style>
