import { describe, it, expect } from 'vitest'
import { convertLegacySession, isLegacyFormat } from '../../src/stores/importUtils'
import { SessionType } from '../../src/stores/types'
import oldSessions from './old_sessions.json'

// Mock UUID generator for consistent testing
const mockGenerateId = (() => {
  let counter = 0
  return () => `test-session-${++counter}`
})()

describe('Import Utilities - Real Data', () => {
  it('should parse old_sessions.json file', () => {
    expect(Array.isArray(oldSessions)).toBe(true)
    expect(oldSessions.length).toBe(81)
  })

  it('should recognize old_sessions.json as legacy format', () => {
    expect(isLegacyFormat(oldSessions)).toBe(true)
  })

  it('should identify sessions with valid dates', () => {
    oldSessions.forEach((session, index) => {
      const startDate = new Date(session.StartTime)
      const endDate = new Date(session.EndTime)

      expect(
        isNaN(startDate.getTime()),
        `Session ${index} (ID: ${session.Id}) has invalid StartTime: ${session.StartTime}`
      ).toBe(false)

      expect(
        isNaN(endDate.getTime()),
        `Session ${index} (ID: ${session.Id}) has invalid EndTime: ${session.EndTime}`
      ).toBe(false)
    })
  })

  it('should convert all sessions from old_sessions.json', () => {
    oldSessions.forEach((legacySession, index) => {
      const converted = convertLegacySession(legacySession, mockGenerateId)

      // Verify basic structure with context
      expect(converted, `Session ${index} (ID: ${legacySession.Id})`).toHaveProperty('id')
      expect(converted, `Session ${index} (ID: ${legacySession.Id})`).toHaveProperty('date')
      expect(converted, `Session ${index} (ID: ${legacySession.Id})`).toHaveProperty('startTime')
      expect(converted, `Session ${index} (ID: ${legacySession.Id})`).toHaveProperty('endTime')
      expect(converted, `Session ${index} (ID: ${legacySession.Id})`).toHaveProperty('exercises')

      // Verify types
      expect(typeof converted.id, `Session ${index} (ID: ${legacySession.Id}) - id should be string`).toBe('string')
      expect(typeof converted.date, `Session ${index} (ID: ${legacySession.Id}) - date should be string`).toBe('string')
      expect(typeof converted.startTime, `Session ${index} (ID: ${legacySession.Id}) - startTime should be string`).toBe('string')
      expect(Array.isArray(converted.exercises), `Session ${index} (ID: ${legacySession.Id}) - exercises should be array`).toBe(true)

      // Verify date format (YYYY-MM-DD)
      expect(converted.date, `Session ${index} (ID: ${legacySession.Id}) - date format should be YYYY-MM-DD`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  it('should convert session types correctly from old_sessions.json', () => {
    // Session type 32 = CrossFit in the old format
    const crossFitSessions = oldSessions.filter((s) => s.SessionType === 32)
    expect(crossFitSessions.length).toBeGreaterThan(0)

    crossFitSessions.forEach((legacySession) => {
      const converted = convertLegacySession(legacySession, mockGenerateId)
      expect(converted.sessionType).toBe(SessionType.CrossFit)
    })
  })

  it('should handle sessions with exercises from old_sessions.json', () => {
    const sessionsWithExercises = oldSessions.filter((s) => s.Exercises && s.Exercises.length > 0)

    if (sessionsWithExercises.length > 0) {
      sessionsWithExercises.forEach((legacySession) => {
        const converted = convertLegacySession(legacySession, mockGenerateId)

        expect(converted.exercises.length).toBe(legacySession.Exercises.length)

        converted.exercises.forEach((exercise) => {
          expect(exercise).toHaveProperty('id')
          expect(exercise).toHaveProperty('name')
          expect(exercise).toHaveProperty('sets')
          expect(Array.isArray(exercise.sets)).toBe(true)
        })
      })
    }
  })

  it('should handle empty exercises from old_sessions.json', () => {
    const sessionsWithoutExercises = oldSessions.filter(
      (s) => !s.Exercises || s.Exercises.length === 0,
    )

    if (sessionsWithoutExercises.length > 0) {
      sessionsWithoutExercises.forEach((legacySession) => {
        const converted = convertLegacySession(legacySession, mockGenerateId)
        expect(converted.exercises).toEqual([])
      })
    }
  })

  it('should preserve notes from old_sessions.json', () => {
    const sessionsWithNotes = oldSessions.filter((s) => s.Notes && s.Notes.trim() !== '')

    if (sessionsWithNotes.length > 0) {
      sessionsWithNotes.forEach((legacySession) => {
        const converted = convertLegacySession(legacySession, mockGenerateId)
        expect(converted.notes).toBe(legacySession.Notes)
      })
    }
  })

  it('should handle null notes from old_sessions.json', () => {
    const sessionsWithNullNotes = oldSessions.filter((s) => s.Notes === null || s.Notes === '')

    if (sessionsWithNullNotes.length > 0) {
      sessionsWithNullNotes.forEach((legacySession) => {
        const converted = convertLegacySession(legacySession, mockGenerateId)
        expect(converted.notes).toBeUndefined()
      })
    }
  })

  it('should generate valid ISO date strings from old_sessions.json', () => {
    oldSessions.forEach((legacySession, index) => {
      const converted = convertLegacySession(legacySession, mockGenerateId)

      // Verify date is valid ISO string
      expect(() => new Date(converted.date), `Session ${index} (ID: ${legacySession.Id}) - date should be valid`).not.toThrow()
      expect(() => new Date(converted.startTime), `Session ${index} (ID: ${legacySession.Id}) - startTime should be valid`).not.toThrow()
      expect(() => new Date(converted.endTime!), `Session ${index} (ID: ${legacySession.Id}) - endTime should be valid`).not.toThrow()

      // Verify parsed dates are valid
      const startDate = new Date(converted.startTime)
      const endDate = new Date(converted.endTime!)
      expect(startDate.getTime(), `Session ${index} (ID: ${legacySession.Id}) - startDate should not be NaN`).not.toBeNaN()
      expect(endDate.getTime(), `Session ${index} (ID: ${legacySession.Id}) - endDate should not be NaN`).not.toBeNaN()

      // Verify end time is after start time
      expect(
        endDate.getTime(),
        `Session ${index} (ID: ${legacySession.Id}) - endTime (${converted.endTime}) should be >= startTime (${converted.startTime})`
      ).toBeGreaterThanOrEqual(startDate.getTime())
    })
  })

  it('should calculate duration from start and end times even when Duration field is null/empty', () => {
    oldSessions.forEach((legacySession, index) => {
      const converted = convertLegacySession(legacySession, mockGenerateId)

      // All sessions should have both startTime and endTime
      expect(converted.startTime, `Session ${index} (ID: ${legacySession.Id}) should have startTime`).toBeDefined()
      expect(converted.endTime, `Session ${index} (ID: ${legacySession.Id}) should have endTime`).toBeDefined()

      // Calculate duration from timestamps
      const startDate = new Date(converted.startTime)
      const endDate = new Date(converted.endTime!)
      const calculatedDurationMs = endDate.getTime() - startDate.getTime()

      // Duration should be calculable (non-negative)
      expect(
        calculatedDurationMs,
        `Session ${index} (ID: ${legacySession.Id}) - duration should be >= 0 (start: ${converted.startTime}, end: ${converted.endTime})`
      ).toBeGreaterThanOrEqual(0)

      // Verify duration is reasonable (less than 24 hours)
      const maxDurationMs = 24 * 60 * 60 * 1000 // 24 hours
      expect(
        calculatedDurationMs,
        `Session ${index} (ID: ${legacySession.Id}) - duration should be less than 24 hours`
      ).toBeLessThan(maxDurationMs)
    })
  })

  it('should convert full old_sessions.json dataset without errors', () => {
    const convertedSessions = oldSessions.map((legacy) =>
      convertLegacySession(legacy, mockGenerateId),
    )

    expect(convertedSessions.length).toBe(oldSessions.length)

    // Verify all have unique IDs
    const ids = convertedSessions.map((s) => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})
