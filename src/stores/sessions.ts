import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { GymSession } from './types'
import { SessionType, getSessionDate } from './types'
import { isLegacyFormat, convertLegacySession } from './importUtils'
import { getExerciseId } from './exercises'

const STORAGE_KEY = 'gymtracker-sessions'
const ACTIVE_SESSION_KEY = 'gymtracker-active-session'

export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref<GymSession[]>([])
  const activeSession = ref<GymSession | null>(null)

  // Generate a unique session ID using UUID v4
  const generateSessionId = (): string => {
    return crypto.randomUUID()
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

  // Save active session to localStorage
  const saveActiveSession = () => {
    try {
      if (activeSession.value) {
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(activeSession.value))
      } else {
        localStorage.removeItem(ACTIVE_SESSION_KEY)
      }
    } catch (error) {
      console.error('Failed to save active session:', error)
    }
  }

  // Load active session from localStorage
  const loadActiveSession = () => {
    try {
      const stored = localStorage.getItem(ACTIVE_SESSION_KEY)
      if (stored) {
        const loaded = JSON.parse(stored) as GymSession
        activeSession.value = {
          ...loaded,
          sessionType: loaded.sessionType ? (loaded.sessionType as SessionType) : undefined,
        }
      }
    } catch (error) {
      console.error('Failed to load active session:', error)
    }
  }

  // Import sessions from JSON (for importing old data)
  const importSessions = (importedData: unknown) => {
    let convertedSessions: GymSession[]

    // Check if it's legacy format and convert if needed
    if (isLegacyFormat(importedData)) {
      convertedSessions = importedData.map((legacy) =>
        convertLegacySession(legacy, generateSessionId),
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

    // Ensure all exercise IDs are strings
    const importedWithCleanIds = newSessions.map((session) => ({
      ...session,
      exercises: session.exercises.map((exercise) => ({
        ...exercise,
        id: typeof exercise.id === 'string' ? exercise.id : getExerciseId(exercise.name),
      })),
    }))

    sessions.value = [...sessions.value, ...importedWithCleanIds].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )

    saveSessions()
  }

  // Start a new session
  const startSession = (sessionType?: SessionType) => {
    const now = new Date()
    const startTime = now.toISOString()
    activeSession.value = {
      id: generateSessionId(),
      startTime,
      sessionType,
      exercises: [],
    }
    saveActiveSession()
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
    saveActiveSession()
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
      saveActiveSession()
    }
  }

  // Remove set from exercise
  const removeSet = (exerciseId: string, setIndex: number) => {
    if (!activeSession.value) return

    const exercise = activeSession.value.exercises.find((e) => e.id === exerciseId)
    if (exercise) {
      exercise.sets.splice(setIndex, 1)
      saveActiveSession()
    }
  }

  // Remove exercise from active session
  const removeExercise = (exerciseId: string) => {
    if (!activeSession.value) return

    const index = activeSession.value.exercises.findIndex((e) => e.id === exerciseId)
    if (index !== -1) {
      activeSession.value.exercises.splice(index, 1)
      saveActiveSession()
    }
  }

  // Finish active session
  const finishSession = () => {
    if (!activeSession.value) return

    activeSession.value.endTime = new Date().toISOString()
    sessions.value.unshift(activeSession.value)
    sessions.value.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    saveSessions()

    const finished = activeSession.value
    activeSession.value = null
    saveActiveSession()
    return finished
  }

  // Cancel active session
  const cancelSession = () => {
    activeSession.value = null
    saveActiveSession()
  }

  // Delete a completed session
  const deleteSession = (sessionId: string) => {
    const index = sessions.value.findIndex((s) => s.id === sessionId)
    if (index !== -1) {
      sessions.value.splice(index, 1)
      saveSessions()
    }
  }

  // Get session by ID
  const getSessionById = (sessionId: string): GymSession | undefined => {
    return sessions.value.find((s) => s.id === sessionId)
  }

  // Update a completed session
  const updateSession = (sessionId: string, updates: Partial<GymSession>) => {
    const index = sessions.value.findIndex((s) => s.id === sessionId)
    if (index !== -1) {
      const currentSession = sessions.value[index]
      if (currentSession) {
        // Ensure id is preserved and required fields are present
        sessions.value[index] = {
          ...currentSession,
          ...updates,
          id: sessionId, // Ensure id is always present
          startTime: updates.startTime ?? currentSession.startTime,
          exercises: updates.exercises ?? currentSession.exercises,
        }
        saveSessions()
      }
    }
  }

  // Get sessions grouped by date
  const sessionsByDate = computed(() => {
    const grouped: Record<string, GymSession[]> = {}
    sessions.value.forEach((session) => {
      const date = getSessionDate(session)
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(session)
    })
    return grouped
  })

  // Get dates with sessions (for calendar)
  const datesWithSessions = computed(() => {
    return new Set(sessions.value.map((s) => getSessionDate(s)))
  })

  // Get total sessions count
  const totalSessions = computed(() => sessions.value.length)

  // Initialize: load from localStorage
  loadSessions()
  loadActiveSession()

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
    getSessionById,
    updateSession,
    importSessions,
    loadSessions,
    saveSessions,
  }
})

// Re-export types for convenience
export type { GymSession, Exercise, ExerciseSet } from './types'
