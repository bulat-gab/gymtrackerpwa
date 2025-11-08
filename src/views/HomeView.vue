<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsStore } from '@/stores/sessions'
import { SessionType } from '@/stores/types'
import SessionTypeSelector from './SessionTypeSelector.vue'

const router = useRouter()
const store = useSessionsStore()

const hasActiveSession = computed(() => store.activeSession !== null)
const showTypeSelector = ref(false)
const selectedType = ref<SessionType | undefined>(undefined)

const startSession = () => {
  if (!hasActiveSession.value && !showTypeSelector.value) {
    showTypeSelector.value = true
    return
  }
  store.startSession(selectedType.value)
  router.push('/session')
}

const onTypeSelect = (type: SessionType | undefined) => {
  selectedType.value = type
  showTypeSelector.value = false
  store.startSession(type)
  router.push('/session')
}

const continueSession = () => {
  router.push('/session')
}

const importJsonFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string)
      // Handle both array and object formats
      const data = Array.isArray(json) ? json : json.sessions || json.Sessions || json

      if (Array.isArray(data) && data.length > 0) {
        store.importSessions(data)
        alert(`Successfully imported ${data.length} session(s)!`)
      } else {
        alert('No sessions found in the file.')
      }
    } catch (error) {
      alert(
        `Failed to import sessions: ${error instanceof Error ? error.message : 'Invalid format'}`,
      )
      console.error('Import error:', error)
    }
  }
  reader.readAsText(file)
  // Reset input so same file can be imported again
  input.value = ''
}
</script>

<template>
  <div class="home">
    <header>
      <h1>Gym Tracker</h1>
      <p class="subtitle">Track your workouts and progress</p>
    </header>

    <div class="quick-stats">
      <div class="stat-card">
        <div class="stat-value">{{ store.totalSessions }}</div>
        <div class="stat-label">Total Sessions</div>
      </div>
    </div>

    <div class="actions">
      <div v-if="showTypeSelector && !hasActiveSession" class="type-selector-section">
        <SessionTypeSelector :selected-type="selectedType" @select="onTypeSelect" />
        <button @click="showTypeSelector = false" class="btn btn-secondary">Cancel</button>
      </div>

      <template v-else>
        <button v-if="!hasActiveSession" @click="startSession" class="btn btn-primary btn-large">
          Start Workout Session
        </button>

        <button v-else @click="continueSession" class="btn btn-primary btn-large">
          Continue Active Session
        </button>
      </template>

      <div class="nav-buttons">
        <router-link to="/sessions" class="btn btn-secondary"> View Sessions </router-link>
        <router-link to="/calendar" class="btn btn-secondary"> Calendar </router-link>
      </div>
    </div>

    <div class="import-section">
      <h2>Import Sessions</h2>
      <p class="import-description">Import your previous workout sessions from a JSON file</p>
      <label for="import-file" class="btn btn-secondary">
        Choose JSON File
        <input
          id="import-file"
          type="file"
          accept=".json"
          @change="importJsonFile"
          style="display: none"
        />
      </label>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.subtitle {
  color: var(--color-text-secondary);
  margin: 0;
}

.quick-stats {
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-background-soft);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid var(--color-border);
}

.stat-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.nav-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.import-section {
  background: var(--color-background-soft);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  text-align: center;
}

.import-section h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.import-description {
  color: var(--color-text-secondary);
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-background-soft);
}

.btn-large {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
}

:root {
  --color-primary: #42b983;
  --color-primary-hover: #35a372;
  --color-text-secondary: #666;
}

@media (max-width: 640px) {
  .nav-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
