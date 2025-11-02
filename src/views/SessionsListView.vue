<script setup lang="ts">
import { computed } from 'vue'
import { useSessionsStore } from '@/stores/sessions'

const store = useSessionsStore()

const sortedSessions = computed(() => {
  return [...store.sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatTime = (timeString: string) => {
  const date = new Date(timeString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getDuration = (session: { startTime: string; endTime?: string }) => {
  if (!session.endTime) return 'N/A'
  const start = new Date(session.startTime)
  const end = new Date(session.endTime)
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000 / 60)
  const hours = Math.floor(diff / 60)
  const minutes = diff % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const deleteSession = (sessionId: number) => {
  if (confirm('Delete this session? This action cannot be undone.')) {
    store.deleteSession(sessionId)
  }
}

const getTotalSets = (session: { exercises: { sets: unknown[] }[] }) => {
  return session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)
}
</script>

<template>
  <div class="sessions-list">
    <header>
      <h1>Sessions History</h1>
      <p class="subtitle">{{ store.totalSessions }} total sessions</p>
    </header>

    <div v-if="sortedSessions.length === 0" class="empty-state">
      <p>No sessions yet. Start your first workout session!</p>
    </div>

    <div v-else class="sessions-container">
      <div v-for="session in sortedSessions" :key="session.id" class="session-card">
        <div class="session-header">
          <router-link :to="`/session/${session.id}`" class="session-link">
            <div class="session-date-info">
              <h2>{{ formatDate(session.date) }}</h2>
              <p class="session-time">
                {{ formatTime(session.startTime) }}
                <span v-if="session.endTime"> - {{ formatTime(session.endTime) }}</span>
              </p>
              <p class="session-duration">Duration: {{ getDuration(session) }}</p>
            </div>
          </router-link>
          <button @click="deleteSession(session.id)" class="btn-delete" aria-label="Delete session">
            ×
          </button>
        </div>

        <div class="session-stats">
          <div class="stat">
            <span class="stat-label">Exercises</span>
            <span class="stat-value">{{ session.exercises.length }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Total Sets</span>
            <span class="stat-value">{{ getTotalSets(session) }}</span>
          </div>
        </div>

        <div class="exercises-summary">
          <h3>Exercises:</h3>
          <ul>
            <li v-for="exercise in session.exercises" :key="exercise.id">
              <strong>{{ exercise.name }}</strong>
              <span class="sets-count">{{ exercise.sets.length }} sets</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sessions-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

header {
  margin-bottom: 2rem;
}

header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.subtitle {
  color: var(--color-text-secondary);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
}

.sessions-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.session-card {
  background: var(--color-background-soft);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.session-link {
  text-decoration: none;
  color: inherit;
  flex: 1;
}

.session-link:hover .session-date-info h2 {
  color: var(--color-primary);
}

.session-date-info h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
}

.session-time {
  margin: 0.25rem 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.session-duration {
  margin: 0.25rem 0 0 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.btn-delete {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0.25rem 0.5rem;
  line-height: 1;
}

.btn-delete:hover {
  color: #ff4444;
}

.session-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
}

.exercises-summary h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.exercises-summary ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.exercises-summary li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

.exercises-summary li:last-child {
  border-bottom: none;
}

.sets-count {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

:root {
  --color-primary: #42b983;
  --color-text-secondary: #666;
}

@media (max-width: 640px) {
  .session-stats {
    gap: 1rem;
  }

  .session-header {
    flex-direction: column;
  }

  .btn-delete {
    align-self: flex-end;
  }
}
</style>
