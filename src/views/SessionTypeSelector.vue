<script setup lang="ts">
import { SessionType, getSessionTypesWithLabels } from '@/stores/types'

const props = defineProps<{
  selectedType?: SessionType
}>()

const emit = defineEmits<{
  (e: 'select', type: SessionType | undefined): void
}>()

const sessionTypes = getSessionTypesWithLabels()
</script>

<template>
  <div class="session-type-selector">
    <label class="label">Session Type</label>
    <div class="types-grid">
      <button
        v-for="type in sessionTypes"
        :key="type.value"
        @click="emit('select', type.value)"
        class="type-button"
        :class="{ active: props.selectedType === type.value }"
      >
        {{ type.label }}
      </button>
      <button
        @click="emit('select', undefined)"
        class="type-button"
        :class="{ active: props.selectedType === undefined }"
      >
        None
      </button>
    </div>
  </div>
</template>

<style scoped>
.session-type-selector {
  margin-bottom: 1.5rem;
}

.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--color-text);
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.type-button {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.type-button:hover {
  background: var(--color-background-soft);
  border-color: var(--color-primary);
}

.type-button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

@media (max-width: 640px) {
  .types-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
