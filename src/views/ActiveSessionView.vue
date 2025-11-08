<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsStore } from '@/stores/sessions'
import type { ExerciseSet } from '@/stores/types'
import ExerciseSelector from '@/components/ExerciseSelector.vue'

const router = useRouter()
const store = useSessionsStore()

const newExerciseName = ref('')
const showAddExercise = ref(false)

const sessionDuration = computed(() => {
  if (!store.activeSession) return '0:00'

  const start = new Date(store.activeSession.startTime)
  const now = new Date()
  const diff = Math.floor((now.getTime() - start.getTime()) / 1000)

  const minutes = Math.floor(diff / 60)
  const seconds = diff % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const addExercise = () => {
  if (newExerciseName.value.trim()) {
    store.addExercise(newExerciseName.value.trim())
    newExerciseName.value = ''
    showAddExercise.value = false
  }
}

const finishSession = () => {
  if (store.activeSession && store.activeSession.exercises.length > 0) {
    store.finishSession()
    router.push('/')
  } else {
    alert('Add at least one exercise before finishing the session')
  }
}

const cancelSession = () => {
  if (confirm('Cancel this session? All progress will be lost.')) {
    store.cancelSession()
    router.push('/')
  }
}

const addSet = (exerciseId: string) => {
  store.addSet(exerciseId, { reps: 0, weight: 0 })
}

const updateSet = (
  exerciseId: string,
  setIndex: number,
  field: keyof ExerciseSet,
  value: number | string,
) => {
  const exercise = store.activeSession?.exercises.find((e) => e.id === exerciseId)
  if (exercise && exercise.sets[setIndex]) {
    exercise.sets[setIndex][field] = value as never
  }
}
</script>

<template>
  <div class="active-session">
    <header class="session-header">
      <div>
        <h1>Active Session</h1>
        <p v-if="store.activeSession?.sessionType" class="session-type">
          Type:
          {{
            store.activeSession.sessionType.charAt(0).toUpperCase() +
            store.activeSession.sessionType.slice(1)
          }}
        </p>
      </div>
      <div class="session-info">
        <span class="duration">Duration: {{ sessionDuration }}</span>
        <button @click="cancelSession" class="btn btn-secondary">Cancel</button>
      </div>
    </header>

    <div v-if="!store.activeSession" class="no-session">
      <p>No active session</p>
      <router-link to="/" class="btn btn-primary">Go Home</router-link>
    </div>

    <div v-else class="session-content">
      <!-- Add Exercise -->
      <div class="add-exercise-section">
        <button v-if="!showAddExercise" @click="showAddExercise = true" class="btn btn-primary">
          + Add Exercise
        </button>

        <div v-else class="add-exercise-form">
          <ExerciseSelector
            v-model="newExerciseName"
            :session-type="store.activeSession?.sessionType"
            @select="addExercise"
          />
          <div class="form-actions">
            <button @click="addExercise" class="btn btn-primary">Add</button>
            <button @click="showAddExercise = false" class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Exercises List -->
      <div v-if="store.activeSession.exercises.length === 0" class="empty-state">
        <p>No exercises yet. Add your first exercise to get started!</p>
      </div>

      <div v-else class="exercises-list">
        <div
          v-for="exercise in store.activeSession.exercises"
          :key="exercise.id"
          class="exercise-card"
        >
          <div class="exercise-header">
            <h3>{{ exercise.name }}</h3>
            <button
              @click="store.removeExercise(exercise.id)"
              class="btn-icon"
              aria-label="Remove exercise"
            >
              ×
            </button>
          </div>

          <!-- Sets -->
          <div class="sets-list">
            <div v-for="(set, setIndex) in exercise.sets" :key="setIndex" class="set-row">
              <span class="set-number">Set {{ setIndex + 1 }}</span>
              <input
                type="number"
                :value="set.reps || ''"
                @input="
                  updateSet(
                    exercise.id,
                    setIndex,
                    'reps',
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
                placeholder="Reps"
                class="input-small"
                min="0"
              />
              <input
                type="number"
                :value="set.weight || ''"
                @input="
                  updateSet(
                    exercise.id,
                    setIndex,
                    'weight',
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
                placeholder="Weight (kg)"
                class="input-small"
                min="0"
                step="0.5"
              />
              <button
                @click="store.removeSet(exercise.id, setIndex)"
                class="btn-icon-small"
                aria-label="Remove set"
              >
                ×
              </button>
            </div>
            <button @click="addSet(exercise.id)" class="btn btn-small">+ Add Set</button>
          </div>
        </div>
      </div>

      <!-- Finish Button -->
      <div class="finish-section">
        <button
          @click="finishSession"
          class="btn btn-primary btn-large"
          :disabled="store.activeSession.exercises.length === 0"
        >
          Finish Session
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active-session {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.session-header h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
}

.session-type {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.duration {
  font-weight: 600;
  color: var(--color-text);
}

.no-session {
  text-align: center;
  padding: 3rem 1rem;
}

.session-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.add-exercise-section {
  margin-bottom: 1rem;
}

.add-exercise-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exercise-card {
  background: var(--color-background-soft);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--color-border);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.exercise-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.sets-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.set-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.set-number {
  min-width: 60px;
  font-weight: 500;
}

.input-small {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.9rem;
}

.finish-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-border);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-large {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0.25rem 0.5rem;
  line-height: 1;
}

.btn-icon:hover {
  color: var(--color-text);
}

.btn-icon-small {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0.25rem;
  line-height: 1;
}

.btn-icon-small:hover {
  color: var(--color-text);
}

.input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 1rem;
  width: 100%;
}

:root {
  --color-primary: #42b983;
  --color-primary-hover: #35a372;
  --color-text-secondary: #666;
}

@media (max-width: 640px) {
  .session-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .session-info {
    width: 100%;
    justify-content: space-between;
  }

  .set-row {
    flex-wrap: wrap;
  }

  .input-small {
    min-width: 80px;
  }
}
</style>
