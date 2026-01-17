import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSessionsStore } from '../../src/stores/sessions'
import { SessionType } from '../../src/stores/types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

global.localStorage = localStorageMock as Storage

// Mock crypto.randomUUID
global.crypto = {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 9),
} as Crypto

describe('Sessions Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('Session Management', () => {
    it('should start a new session', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Legs)

      expect(store.activeSession).not.toBeNull()
      expect(store.activeSession?.sessionType).toBe(SessionType.Legs)
      expect(store.activeSession?.exercises).toEqual([])
    })

    it('should persist active session to localStorage', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Chest)

      const stored = localStorage.getItem('gymtracker-active-session')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.sessionType).toBe('chest')
    })

    it('should load active session from localStorage on initialization', () => {
      const store = useSessionsStore()
      store.startSession(SessionType.Arms)
      const sessionId = store.activeSession?.id

      // Create a new store instance to simulate page reload
      setActivePinia(createPinia())
      const newStore = useSessionsStore()

      expect(newStore.activeSession).not.toBeNull()
      expect(newStore.activeSession?.id).toBe(sessionId)
      expect(newStore.activeSession?.sessionType).toBe(SessionType.Arms)
    })

    it('should finish a session and move it to completed sessions', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Back)
      const sessionId = store.activeSession?.id

      store.finishSession()

      expect(store.activeSession).toBeNull()
      expect(store.sessions).toHaveLength(1)
      expect(store.sessions[0]?.id).toBe(sessionId)
      expect(store.sessions[0]?.endTime).toBeDefined()
    })

    it('should allow finishing session with no exercises', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Cardio)
      const finishedSession = store.finishSession()

      expect(finishedSession).not.toBeUndefined()
      expect(finishedSession?.exercises).toEqual([])
      expect(store.sessions).toHaveLength(1)
    })

    it('should cancel active session without saving', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Core)
      store.cancelSession()

      expect(store.activeSession).toBeNull()
      expect(store.sessions).toHaveLength(0)
    })

    it('should delete a completed session', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Legs)
      store.finishSession()

      const sessionId = store.sessions[0]?.id
      expect(sessionId).toBeDefined()

      store.deleteSession(sessionId!)

      expect(store.sessions).toHaveLength(0)
    })
  })

  describe('Exercise Management', () => {
    it('should add exercise to active session', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Chest)
      store.addExercise('Bench Press')

      expect(store.activeSession?.exercises).toHaveLength(1)
      expect(store.activeSession?.exercises[0]?.name).toBe('Bench Press')
      expect(store.activeSession?.exercises[0]?.sets).toEqual([])
    })

    it('should add set to exercise', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Arms)
      store.addExercise('Bicep Curls')

      const exerciseId = store.activeSession?.exercises[0]?.id
      expect(exerciseId).toBeDefined()

      store.addSet(exerciseId!, { reps: 10, weight: 15 })

      expect(store.activeSession?.exercises[0]?.sets).toHaveLength(1)
      expect(store.activeSession?.exercises[0]?.sets[0]?.reps).toBe(10)
      expect(store.activeSession?.exercises[0]?.sets[0]?.weight).toBe(15)
    })

    it('should remove set from exercise', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Legs)
      store.addExercise('Squats')

      const exerciseId = store.activeSession?.exercises[0]?.id!
      store.addSet(exerciseId, { reps: 10, weight: 100 })
      store.addSet(exerciseId, { reps: 8, weight: 110 })

      expect(store.activeSession?.exercises[0]?.sets).toHaveLength(2)

      store.removeSet(exerciseId, 0)

      expect(store.activeSession?.exercises[0]?.sets).toHaveLength(1)
      expect(store.activeSession?.exercises[0]?.sets[0]?.weight).toBe(110)
    })

    it('should remove exercise from active session', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Back)
      store.addExercise('Pull-ups')
      store.addExercise('Rows')

      const firstExerciseId = store.activeSession?.exercises[0]?.id!

      store.removeExercise(firstExerciseId)

      expect(store.activeSession?.exercises).toHaveLength(1)
      expect(store.activeSession?.exercises[0]?.name).toBe('Rows')
    })

    it('should persist exercise changes to localStorage', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Shoulders)
      store.addExercise('Shoulder Press')

      const stored = localStorage.getItem('gymtracker-active-session')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.exercises).toHaveLength(1)
      expect(parsed.exercises[0].name).toBe('Shoulder Press')
    })
  })

  describe('Session Retrieval', () => {
    it('should get session by ID', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.FullBody)
      const session = store.finishSession()

      const retrieved = store.getSessionById(session!.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(session!.id)
    })

    it('should return undefined for non-existent session ID', () => {
      const store = useSessionsStore()

      const retrieved = store.getSessionById('non-existent-id')

      expect(retrieved).toBeUndefined()
    })

    it('should compute sessionsByDate correctly', () => {
      const store = useSessionsStore()

      // Create session on a specific date
      store.startSession(SessionType.Legs)
      const date = '2026-01-15'
      if (store.activeSession) {
        store.activeSession.date = date
        store.activeSession.startTime = `${date}T10:00:00Z`
      }
      store.finishSession()

      const sessionsByDate = store.sessionsByDate
      expect(sessionsByDate.has(date)).toBe(true)
      expect(sessionsByDate.get(date)).toHaveLength(1)
    })

    it('should compute totalSessions correctly', () => {
      const store = useSessionsStore()

      expect(store.totalSessions).toBe(0)

      store.startSession(SessionType.Chest)
      store.finishSession()

      expect(store.totalSessions).toBe(1)

      store.startSession(SessionType.Back)
      store.finishSession()

      expect(store.totalSessions).toBe(2)
    })
  })

  describe('Session Updates', () => {
    it('should update completed session', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Mixed)
      const session = store.finishSession()

      store.updateSession(session!.id, {
        sessionType: SessionType.CrossFit,
        notes: 'Great workout!',
      })

      const updated = store.getSessionById(session!.id)
      expect(updated?.sessionType).toBe(SessionType.CrossFit)
      expect(updated?.notes).toBe('Great workout!')
    })

    it('should preserve session ID when updating', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Core)
      const session = store.finishSession()
      const originalId = session!.id

      store.updateSession(originalId, {
        notes: 'Updated notes',
      })

      const updated = store.getSessionById(originalId)
      expect(updated?.id).toBe(originalId)
    })
  })

  describe('Persistence', () => {
    it('should save sessions to localStorage', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Legs)
      store.finishSession()

      const stored = localStorage.getItem('gymtracker-sessions')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed).toHaveLength(1)
    })

    it('should load sessions from localStorage on initialization', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Back)
      store.finishSession()

      // Create new store instance to simulate page reload
      setActivePinia(createPinia())
      const newStore = useSessionsStore()

      expect(newStore.sessions).toHaveLength(1)
    })

    it('should clear active session from localStorage when finished', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Arms)
      expect(localStorage.getItem('gymtracker-active-session')).not.toBeNull()

      store.finishSession()
      expect(localStorage.getItem('gymtracker-active-session')).toBeNull()
    })

    it('should clear active session from localStorage when cancelled', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Shoulders)
      expect(localStorage.getItem('gymtracker-active-session')).not.toBeNull()

      store.cancelSession()
      expect(localStorage.getItem('gymtracker-active-session')).toBeNull()
    })
  })

  describe('UUID Generation', () => {
    it('should generate unique session IDs', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Legs)
      const id1 = store.activeSession?.id
      store.finishSession()

      store.startSession(SessionType.Chest)
      const id2 = store.activeSession?.id
      store.finishSession()

      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
    })

    it('should use string UUIDs for session IDs', () => {
      const store = useSessionsStore()

      store.startSession(SessionType.Core)

      expect(typeof store.activeSession?.id).toBe('string')
      expect(store.activeSession?.id).toMatch(/^test-uuid-/)
    })
  })
})
