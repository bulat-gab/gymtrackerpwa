<script setup lang="ts">
import { ref, computed } from 'vue'
import { getExercisesByType, getAllExerciseNames } from '@/stores/exercises'
import type { SessionType } from '@/stores/types'

const props = defineProps<{
  sessionType?: SessionType
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', exerciseName: string): void
}>()

const searchQuery = ref('')
const showDropdown = ref(false)

const filteredExercises = computed(() => {
  let exercises = props.sessionType
    ? getExercisesByType(props.sessionType).map((ex) => ex.name)
    : getAllExerciseNames()

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    exercises = exercises.filter((name) => name.toLowerCase().includes(query))
  }

  return exercises.slice(0, 10) // Limit to 10 results
})

const selectExercise = (exerciseName: string) => {
  emit('update:modelValue', exerciseName)
  emit('select', exerciseName)
  searchQuery.value = ''
  showDropdown.value = false
}

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
  searchQuery.value = value
  showDropdown.value = true
}

const handleFocus = () => {
  showDropdown.value = true
}

const handleBlur = () => {
  // Delay to allow click events to fire first
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}
</script>

<template>
  <div class="exercise-selector">
    <input
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      placeholder="Search exercises..."
      class="input"
      autocomplete="off"
    />
    <div v-if="showDropdown && filteredExercises.length > 0" class="dropdown">
      <button
        v-for="exercise in filteredExercises"
        :key="exercise"
        @mousedown.prevent="selectExercise(exercise)"
        class="dropdown-item"
      >
        {{ exercise }}
      </button>
    </div>
    <div v-if="showDropdown && searchQuery && filteredExercises.length === 0" class="dropdown">
      <div class="dropdown-item empty">No exercises found</div>
    </div>
  </div>
</template>

<style scoped>
.exercise-selector {
  position: relative;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 1rem;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: var(--color-background-soft);
}

.dropdown-item.empty {
  color: var(--color-text-secondary);
  cursor: default;
}

.dropdown-item.empty:hover {
  background: none;
}
</style>
