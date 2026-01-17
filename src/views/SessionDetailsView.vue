<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionsStore } from '@/stores/sessions'
import type { Exercise, ExerciseSet, GymSession } from '@/stores/types'
import { SessionType } from '@/stores/types'
import { getExerciseId } from '@/stores/exercises'
import ExerciseSelector from '@/components/ExerciseSelector.vue'
import SessionTypeSelector from '@/views/SessionTypeSelector.vue'

const route = useRoute()
const router = useRouter()
const store = useSessionsStore()

const isEditing = ref(false)
const editedSession = ref<GymSession | null>(null)
const showAddExercise = ref(false)
const newExerciseName = ref('')

onMounted(() => {
  const sessionId = route.params.id as string
  const session = store.getSessionById(sessionId)
  if (!session) {
    router.push('/sessions')
    return
  }
  // Create a deep copy for editing - explicitly type it as GymSession
  editedSession.value = JSON.parse(JSON.stringify(session)) as GymSession
})

const session = computed(() => editedSession.value)

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0] || ''
}

const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString)
  return date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
}

const getDuration = computed(() => {
  if (!session.value || !session.value.endTime) return 'N/A'
  const start = new Date(session.value.startTime)
  const end = new Date(session.value.endTime)
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000 / 60)
  const hours = Math.floor(diff / 60)
  const minutes = diff % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
})

const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  if (editedSession.value) {
    const originalSession = store.getSessionById(editedSession.value.id)
    if (originalSession) {
      editedSession.value = JSON.parse(JSON.stringify(originalSession))
    }
  }
  isEditing.value = false
  showAddExercise.value = false
}

const saveChanges = () => {
  if (!editedSession.value) return

  // Validate dates
  const startDate = new Date(editedSession.value.startTime)
  const endDate = editedSession.value.endTime ? new Date(editedSession.value.endTime) : null

  if (endDate && endDate < startDate) {
    alert('End time cannot be before start time')
    return
  }

  // Update the date field to match startTime
  if (!editedSession.value) return

  // startTime is always required in GymSession interface
  editedSession.value.date = formatDate(editedSession.value.startTime as string)

  store.updateSession(editedSession.value.id, editedSession.value)
  isEditing.value = false
  showAddExercise.value = false
}

const updateDate = (field: 'date' | 'startTime' | 'endTime', value: string) => {
  if (!editedSession.value) return

  if (field === 'date') {
    // Update startTime date part
    const startDateTime = new Date(editedSession.value.startTime)
    const newDate = new Date(value)
    startDateTime.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
    editedSession.value.startTime = startDateTime.toISOString()

    // Update endTime date part if it exists
    if (editedSession.value.endTime) {
      const endDateTime = new Date(editedSession.value.endTime)
      endDateTime.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
      editedSession.value.endTime = endDateTime.toISOString()
    }
  } else {
    if (field === 'endTime') {
      editedSession.value.endTime = value
    } else if (field === 'startTime') {
      editedSession.value.startTime = value
      // value is guaranteed to be a string (function parameter)
      editedSession.value.date = formatDate(value)
    }
  }
}

const updateSessionType = (type: SessionType | undefined) => {
  if (!editedSession.value) return
  editedSession.value.sessionType = type
}

const addExercise = () => {
  if (!editedSession.value || !newExerciseName.value.trim()) return

  const exercise: Exercise = {
    id: getExerciseId(newExerciseName.value.trim()),
    name: newExerciseName.value.trim(),
    sets: [],
  }
  editedSession.value.exercises.push(exercise)
  newExerciseName.value = ''
  showAddExercise.value = false
}

const removeExercise = (exerciseId: string) => {
  if (!editedSession.value) return
  const index = editedSession.value.exercises.findIndex((e) => e.id === exerciseId)
  if (index !== -1) {
    editedSession.value.exercises.splice(index, 1)
  }
}

const addSet = (exerciseId: string) => {
  if (!editedSession.value) return
  const exercise = editedSession.value.exercises.find((e) => e.id === exerciseId)
  if (exercise) {
    exercise.sets.push({})
  }
}

const removeSet = (exerciseId: string, setIndex: number) => {
  if (!editedSession.value) return
  const exercise = editedSession.value.exercises.find((e) => e.id === exerciseId)
  if (exercise) {
    exercise.sets.splice(setIndex, 1)
  }
}

const updateSet = (
  exerciseId: string,
  setIndex: number,
  field: keyof ExerciseSet,
  value: number | string | undefined,
) => {
  if (!editedSession.value) return
  const exercise = editedSession.value.exercises.find((e) => e.id === exerciseId)
  if (exercise && exercise.sets[setIndex]) {
    if (value === '' || value === null) {
      delete exercise.sets[setIndex][field]
    } else {
      exercise.sets[setIndex][field] = value as never
    }
  }
}

const deleteSession = () => {
  if (!editedSession.value) return
  if (confirm('Delete this session? This action cannot be undone.')) {
    store.deleteSession(editedSession.value.id)
    router.back()
  }
}
</script>

<template>
  <div class="session-details">
    <div v-if="!session" class="loading">Loading...</div>

    <template v-else>
      <header class="details-header">
        <div>
          <button @click="router.back()" class="btn-back">← Back</button>
          <h1>Session Details</h1>
        </div>
        <div class="header-actions">
          <button v-if="!isEditing" @click="startEdit" class="btn btn-primary">Edit</button>
          <template v-else>
            <button @click="cancelEdit" class="btn btn-secondary">Cancel</button>
            <button @click="saveChanges" class="btn btn-primary">Save</button>
          </template>
          <button @click="deleteSession" class="btn btn-danger">Delete</button>
        </div>
      </header>

      <div class="session-info">
        <!-- Date -->
        <div class="info-row">
          <label>Date</label>
          <input
            v-if="isEditing"
            type="date"
            :value="formatDate(session.date)"
            @input="(e) => updateDate('date', (e.target as HTMLInputElement).value)"
            class="input"
          />
          <span v-else>{{ new Date(session.date).toLocaleDateString() }}</span>
        </div>

        <!-- Start Time -->
        <div class="info-row">
          <label>Start Time</label>
          <input
            v-if="isEditing"
            type="datetime-local"
            :value="formatDateTime(session.startTime)"
            @input="(e) => updateDate('startTime', (e.target as HTMLInputElement).value)"
            class="input"
          />
          <span v-else>{{ new Date(session.startTime).toLocaleString() }}</span>
        </div>

        <!-- End Time -->
        <div class="info-row">
          <label>End Time</label>
          <input
            v-if="isEditing"
            type="datetime-local"
            :value="session.endTime ? formatDateTime(session.endTime) : ''"
            @input="(e) => updateDate('endTime', (e.target as HTMLInputElement).value)"
            class="input"
          />
          <span v-else>{{
            session.endTime ? new Date(session.endTime).toLocaleString() : 'N/A'
          }}</span>
        </div>

        <!-- Duration -->
        <div class="info-row">
          <label>Duration</label>
          <span>{{ getDuration }}</span>
        </div>

        <!-- Session Type -->
        <div class="info-row">
          <label>Session Type</label>
          <SessionTypeSelector
            v-if="isEditing"
            :selected-type="session.sessionType"
            @select="updateSessionType"
          />
          <span v-else>{{
            session.sessionType
              ? session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)
              : 'None'
          }}</span>
        </div>

        <!-- Notes -->
        <div class="info-row">
          <label>Notes</label>
          <textarea
            v-if="isEditing"
            v-model="session.notes"
            class="textarea"
            placeholder="Add session notes..."
            rows="3"
          />
          <span v-else>{{ session.notes || 'No notes' }}</span>
        </div>
      </div>

      <!-- Exercises -->
      <div class="exercises-section">
        <div class="section-header">
          <h2>Exercises ({{ session.exercises.length }})</h2>
          <button
            v-if="isEditing && !showAddExercise"
            @click="showAddExercise = true"
            class="btn btn-primary"
          >
            + Add Exercise
          </button>
        </div>

        <!-- Add Exercise Form -->
        <div v-if="isEditing && showAddExercise" class="add-exercise-form">
          <ExerciseSelector
            v-model="newExerciseName"
            :session-type="session.sessionType"
            @select="addExercise"
          />
          <div class="form-actions">
            <button
              @click="addExercise"
              class="btn btn-primary"
              :disabled="!newExerciseName.trim()"
            >
              Add
            </button>
            <button
              @click="((showAddExercise = false), (newExerciseName = ''))"
              class="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Exercises List -->
        <div v-if="session.exercises.length === 0" class="empty-state">
          <p>No exercises in this session</p>
        </div>

        <div v-else class="exercises-list">
          <div v-for="exercise in session.exercises" :key="exercise.id" class="exercise-card">
            <div class="exercise-header">
              <h3>{{ exercise.name }}</h3>
              <button
                v-if="isEditing"
                @click="removeExercise(exercise.id)"
                class="btn-remove"
                aria-label="Remove exercise"
              >
                ×
              </button>
            </div>

            <!-- Sets -->
            <div class="sets-section">
              <div class="sets-header">
                <span>Sets ({{ exercise.sets.length }})</span>
                <button v-if="isEditing" @click="addSet(exercise.id)" class="btn btn-small">
                  + Add Set
                </button>
              </div>

              <div v-if="exercise.sets.length === 0" class="empty-sets">No sets recorded</div>

              <table v-else class="sets-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Reps</th>
                    <th>Weight (kg)</th>
                    <th>Duration (s)</th>
                    <th>Distance (m)</th>
                    <th>Notes</th>
                    <th v-if="isEditing"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(set, setIndex) in exercise.sets" :key="setIndex">
                    <td>{{ setIndex + 1 }}</td>
                    <td>
                      <input
                        v-if="isEditing"
                        type="number"
                        :value="set.reps"
                        @input="
                          (e) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              'reps',
                              parseInt((e.target as HTMLInputElement).value) || undefined,
                            )
                        "
                        class="input-small"
                        placeholder="-"
                      />
                      <span v-else>{{ set.reps ?? '-' }}</span>
                    </td>
                    <td>
                      <input
                        v-if="isEditing"
                        type="number"
                        step="0.5"
                        :value="set.weight"
                        @input="
                          (e) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              'weight',
                              parseFloat((e.target as HTMLInputElement).value) || undefined,
                            )
                        "
                        class="input-small"
                        placeholder="-"
                      />
                      <span v-else>{{ set.weight ?? '-' }}</span>
                    </td>
                    <td>
                      <input
                        v-if="isEditing"
                        type="number"
                        :value="set.duration"
                        @input="
                          (e) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              'duration',
                              parseInt((e.target as HTMLInputElement).value) || undefined,
                            )
                        "
                        class="input-small"
                        placeholder="-"
                      />
                      <span v-else>{{ set.duration ?? '-' }}</span>
                    </td>
                    <td>
                      <input
                        v-if="isEditing"
                        type="number"
                        :value="set.distance"
                        @input="
                          (e) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              'distance',
                              parseFloat((e.target as HTMLInputElement).value) || undefined,
                            )
                        "
                        class="input-small"
                        placeholder="-"
                      />
                      <span v-else>{{ set.distance ?? '-' }}</span>
                    </td>
                    <td>
                      <input
                        v-if="isEditing"
                        type="text"
                        :value="set.notes"
                        @input="
                          (e) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              'notes',
                              (e.target as HTMLInputElement).value || undefined,
                            )
                        "
                        class="input-small"
                        placeholder="-"
                      />
                      <span v-else>{{ set.notes || '-' }}</span>
                    </td>
                    <td v-if="isEditing">
                      <button
                        @click="removeSet(exercise.id, setIndex)"
                        class="btn-remove"
                        aria-label="Remove set"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Exercise Notes -->
            <div v-if="exercise.notes || isEditing" class="exercise-notes">
              <label>Exercise Notes</label>
              <input
                v-if="isEditing"
                type="text"
                v-model="exercise.notes"
                class="input"
                placeholder="Add exercise notes..."
              />
              <span v-else>{{ exercise.notes || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.session-details {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.details-header h1 {
  margin: 0.5rem 0 0 0;
}

.btn-back {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem 0;
  margin-bottom: 0.5rem;
}

.btn-back:hover {
  text-decoration: underline;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.session-info {
  background: var(--color-background-soft);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid var(--color-border);
}

.info-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: start;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.input,
.textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.9rem;
}

.textarea {
  resize: vertical;
  font-family: inherit;
}

.exercises-section {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
}

.add-exercise-form {
  background: var(--color-background-soft);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid var(--color-border);
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.exercise-card {
  background: var(--color-background-soft);
  border-radius: 8px;
  padding: 1.5rem;
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
}

.btn-remove {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0.25rem 0.5rem;
  line-height: 1;
}

.btn-remove:hover {
  color: #ff4444;
}

.sets-section {
  margin-top: 1rem;
}

.sets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.empty-sets {
  color: var(--color-text-secondary);
  font-style: italic;
  padding: 1rem 0;
}

.sets-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

.sets-table th,
.sets-table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.sets-table th {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.sets-table td {
  font-size: 0.9rem;
}

.input-small {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.85rem;
}

.exercise-notes {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.exercise-notes label {
  display: block;
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-border);
}

.btn-danger {
  background: #ff4444;
  color: white;
}

.btn-danger:hover {
  background: #cc0000;
}

.btn-small {
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .details-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .sets-table {
    font-size: 0.8rem;
  }

  .sets-table th,
  .sets-table td {
    padding: 0.25rem;
  }

  .input-small {
    font-size: 0.75rem;
    padding: 0.2rem 0.4rem;
  }
}
</style>
