import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { GymSession } from './types'
import { SessionType } from './types'
import { isLegacyFormat, convertLegacySession } from './importUtils'
import { getExerciseId } from './exercises'

const STORAGE_KEY = 'gymtracker-sessions'
const SESSION_ID_COUNTER_KEY = 'gymtracker-session-id-counter'

export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref<GymSession[]>([])
  const activeSession = ref<GymSession | null>(null)

  // Get next session ID (incremental integer starting from 0)
  const getNextSessionId = (): number => {
    try {
      const stored = localStorage.getItem(SESSION_ID_COUNTER_KEY)
      const counter = stored ? parseInt(stored, 10) : -1
      const nextCounter = counter + 1
      localStorage.setItem(SESSION_ID_COUNTER_KEY, nextCounter.toString())
      return nextCounter
    } catch (error) {
      console.error('Failed to get next session ID:', error)
      // Fallback - use timestamp mod a large number to avoid conflicts
      return Date.now() % 1000000
    }
  }

  // Initialize ID counters based on existing sessions
  const initializeIdCounters = () => {
    try {
      // Initialize session counter
      const sessionCounterStored = localStorage.getItem(SESSION_ID_COUNTER_KEY)
      if (!sessionCounterStored) {
        let maxSessionId = -1
        sessions.value.forEach((session) => {
          if (typeof session.id === 'number' && session.id > maxSessionId) {
            maxSessionId = session.id
          }
        })
        localStorage.setItem(SESSION_ID_COUNTER_KEY, maxSessionId.toString())
      }
    } catch (error) {
      console.error('Failed to initialize ID counters:', error)
    }
  }

  // Load sessions from localStorage
  const loadSessions = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const loaded = JSON.parse(stored) as GymSession[]
        // Ensure sessionType values are valid SessionType enums (they come back as strings from JSON)
        sessions.value = loaded.map((session) => ({
          ...session,
          sessionType: session.sessionType ? (session.sessionType as SessionType) : undefined,
        }))
        // Initialize counters after loading sessions
        initializeIdCounters()
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  // Save sessions to localStorage
  const saveSessions = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
    } catch (error) {
      console.error('Failed to save sessions:', error)
    }
  }

  // Import sessions from JSON (for importing old data)
  const importSessions = (importedData: unknown) => {
    let convertedSessions: GymSession[]

    // Check if it's legacy format and convert if needed
    if (isLegacyFormat(importedData)) {
      convertedSessions = importedData.map((legacy) =>
        convertLegacySession(legacy, getNextSessionId),
      )
    } else if (Array.isArray(importedData)) {
      // Assume it's already in the new format
      convertedSessions = importedData as GymSession[]
    } else {
      throw new Error('Invalid import format: expected an array of sessions')
    }

    // Merge with existing, avoiding duplicates by ID
    const existingIds = new Set(sessions.value.map((s) => s.id))
    const newSessions = convertedSessions.filter((s) => !existingIds.has(s.id))

    // For imported sessions, assign new incremental IDs if they conflict
    const importedWithNewIds = newSessions.map((session) => {
      if (typeof session.id === 'number' && !existingIds.has(session.id)) {
        // Already has proper integer ID and doesn't conflict, keep it
        return session
      }
      // Generate new incremental ID
      const newSessionId = getNextSessionId()
      // Also update exercise IDs if needed (convert to string IDs from names)
      const exercisesWithNewIds = session.exercises.map((exercise) => ({
        ...exercise,
        id: typeof exercise.id === 'string' ? exercise.id : getExerciseId(exercise.name),
      }))
      return {
        ...session,
        id: newSessionId,
        exercises: exercisesWithNewIds,
      }
    })

    sessions.value = [...sessions.value, ...importedWithNewIds].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    // Re-initialize counters after import to ensure they're up to date
    initializeIdCounters()
    saveSessions()
  }

  // Start a new session
  const startSession = (sessionType?: SessionType) => {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0] || now.toISOString().substring(0, 10)
    const startTime = now.toISOString()
    activeSession.value = {
      id: getNextSessionId(),
      date: dateStr,
      startTime,
      sessionType,
      exercises: [],
    }
  }

  // Add exercise to active session
  const addExercise = (exerciseName: string) => {
    if (!activeSession.value) return

    const exercise = {
      id: getExerciseId(exerciseName),
      name: exerciseName,
      sets: [],
    }
    activeSession.value.exercises.push(exercise)
  }

  // Add set to exercise
  const addSet = (
    exerciseId: string,
    set: { reps?: number; weight?: number; duration?: number; distance?: number; notes?: string },
  ) => {
    if (!activeSession.value) return

    const exercise = activeSession.value.exercises.find((e) => e.id === exerciseId)
    if (exercise) {
      exercise.sets.push(set)
    }
  }

  // Remove set from exercise
  const removeSet = (exerciseId: string, setIndex: number) => {
    if (!activeSession.value) return

    const exercise = activeSession.value.exercises.find((e) => e.id === exerciseId)
    if (exercise) {
      exercise.sets.splice(setIndex, 1)
    }
  }

  // Remove exercise from active session
  const removeExercise = (exerciseId: string) => {
    if (!activeSession.value) return

    const index = activeSession.value.exercises.findIndex((e) => e.id === exerciseId)
    if (index !== -1) {
      activeSession.value.exercises.splice(index, 1)
    }
  }

  // Finish active session
  const finishSession = () => {
    if (!activeSession.value) return

    activeSession.value.endTime = new Date().toISOString()
    sessions.value.unshift(activeSession.value)
    sessions.value.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    saveSessions()

    const finished = activeSession.value
    activeSession.value = null
    return finished
  }

  // Cancel active session
  const cancelSession = () => {
    activeSession.value = null
  }

  // Delete a completed session
  const deleteSession = (sessionId: number) => {
    const index = sessions.value.findIndex((s) => s.id === sessionId)
    if (index !== -1) {
      sessions.value.splice(index, 1)
      saveSessions()
    }
  }

  // Get sessions grouped by date
  const sessionsByDate = computed(() => {
    const grouped: Record<string, GymSession[]> = {}
    sessions.value.forEach((session) => {
      const date = session.date
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(session)
    })
    return grouped
  })

  // Get dates with sessions (for calendar)
  const datesWithSessions = computed(() => {
    return new Set(sessions.value.map((s) => s.date))
  })

  // Get total sessions count
  const totalSessions = computed(() => sessions.value.length)

  // Initialize: load from localStorage
  loadSessions()

  return {
    sessions,
    activeSession,
    sessionsByDate,
    datesWithSessions,
    totalSessions,
    startSession,
    addExercise,
    addSet,
    removeSet,
    removeExercise,
    finishSession,
    cancelSession,
    deleteSession,
    importSessions,
    loadSessions,
    saveSessions,
  }
})

// Re-export types for convenience
export type { GymSession, Exercise, ExerciseSet } from './types'
