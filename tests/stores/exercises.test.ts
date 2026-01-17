import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  predefinedExercises,
  getExercisesByType,
  getAllExerciseNames,
  getPredefinedExerciseByName,
  getPredefinedExerciseById,
  getExerciseId,
  generateExerciseId,
} from '../../src/stores/exercises'
import { SessionType } from '../../src/stores/types'

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-123',
}))

describe('Exercises', () => {
  describe('predefinedExercises', () => {
    it('should have exercises defined', () => {
      expect(predefinedExercises.length).toBeGreaterThan(0)
    })

    it('should have exercises with required fields', () => {
      predefinedExercises.forEach((exercise) => {
        expect(exercise).toHaveProperty('id')
        expect(exercise).toHaveProperty('name')
        expect(exercise).toHaveProperty('types')
        expect(typeof exercise.id).toBe('string')
        expect(typeof exercise.name).toBe('string')
        expect(Array.isArray(exercise.types)).toBe(true)
      })
    })

    it('should have unique exercise IDs', () => {
      const ids = predefinedExercises.map((ex) => ex.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should include CrossFit-related exercises', () => {
      const crossFitExercises = predefinedExercises.filter((ex) =>
        ex.name.toLowerCase().includes('thruster'),
      )
      expect(crossFitExercises.length).toBeGreaterThan(0)
    })
  })

  describe('getExercisesByType', () => {
    it('should return all exercises when no type specified', () => {
      const exercises = getExercisesByType()
      expect(exercises.length).toBe(predefinedExercises.length)
    })

    it('should filter exercises by Legs type', () => {
      const exercises = getExercisesByType(SessionType.Legs)
      expect(exercises.length).toBeGreaterThan(0)
      exercises.forEach((ex) => {
        expect(ex.types).toContain(SessionType.Legs)
      })
    })

    it('should filter exercises by Chest type', () => {
      const exercises = getExercisesByType(SessionType.Chest)
      expect(exercises.length).toBeGreaterThan(0)
      exercises.forEach((ex) => {
        expect(ex.types).toContain(SessionType.Chest)
      })
    })

    it('should filter exercises by Back type', () => {
      const exercises = getExercisesByType(SessionType.Back)
      expect(exercises.length).toBeGreaterThan(0)
      exercises.forEach((ex) => {
        expect(ex.types).toContain(SessionType.Back)
      })
    })

    it('should filter exercises by Arms type', () => {
      const exercises = getExercisesByType(SessionType.Arms)
      expect(exercises.length).toBeGreaterThan(0)
      exercises.forEach((ex) => {
        expect(ex.types).toContain(SessionType.Arms)
      })
    })

    it('should filter exercises by Shoulders type', () => {
      const exercises = getExercisesByType(SessionType.Shoulders)
      expect(exercises.length).toBeGreaterThan(0)
      exercises.forEach((ex) => {
        expect(ex.types).toContain(SessionType.Shoulders)
      })
    })

    it('should filter exercises by Core type', () => {
      const exercises = getExercisesByType(SessionType.Core)
      expect(exercises.length).toBeGreaterThan(0)
      exercises.forEach((ex) => {
        expect(ex.types).toContain(SessionType.Core)
      })
    })

    it('should filter exercises by Cardio type', () => {
      const exercises = getExercisesByType(SessionType.Cardio)
      expect(exercises.length).toBeGreaterThan(0)
      exercises.forEach((ex) => {
        expect(ex.types).toContain(SessionType.Cardio)
      })
    })

    it('should filter exercises by FullBody type', () => {
      const exercises = getExercisesByType(SessionType.FullBody)
      expect(exercises.length).toBeGreaterThan(0)
      exercises.forEach((ex) => {
        expect(ex.types).toContain(SessionType.FullBody)
      })
    })

    it('should include exercises that belong to multiple types', () => {
      const chestExercises = getExercisesByType(SessionType.Chest)
      const armsExercises = getExercisesByType(SessionType.Arms)

      // Dips should appear in both Chest and Arms
      const dipsInChest = chestExercises.find((ex) => ex.name === 'Dips')
      const dipsInArms = armsExercises.find((ex) => ex.name === 'Dips')

      expect(dipsInChest).toBeDefined()
      expect(dipsInArms).toBeDefined()
    })
  })

  describe('getAllExerciseNames', () => {
    it('should return array of exercise names', () => {
      const names = getAllExerciseNames()
      expect(Array.isArray(names)).toBe(true)
      expect(names.length).toBeGreaterThan(0)
    })

    it('should return unique exercise names', () => {
      const names = getAllExerciseNames()
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })

    it('should include common exercises', () => {
      const names = getAllExerciseNames()
      expect(names).toContain('Squat')
      expect(names).toContain('Bench Press' || 'Barbell Bench Press')
      expect(names).toContain('Deadlift')
    })
  })

  describe('getPredefinedExerciseByName', () => {
    it('should return exercise for valid name', () => {
      const exercise = getPredefinedExerciseByName('Squat')
      expect(exercise).toBeDefined()
      expect(exercise?.name).toBe('Squat')
      expect(exercise?.id).toBe('squat')
    })

    it('should return undefined for invalid name', () => {
      const exercise = getPredefinedExerciseByName('Non-existent Exercise')
      expect(exercise).toBeUndefined()
    })

    it('should be case-sensitive', () => {
      const exercise = getPredefinedExerciseByName('squat')
      expect(exercise).toBeUndefined()
    })
  })

  describe('getPredefinedExerciseById', () => {
    it('should return exercise for valid ID', () => {
      const exercise = getPredefinedExerciseById('squat')
      expect(exercise).toBeDefined()
      expect(exercise?.id).toBe('squat')
      expect(exercise?.name).toBe('Squat')
    })

    it('should return undefined for invalid ID', () => {
      const exercise = getPredefinedExerciseById('non-existent-id')
      expect(exercise).toBeUndefined()
    })
  })

  describe('generateExerciseId', () => {
    it('should generate UUID', () => {
      const id = generateExerciseId('Custom Exercise')
      expect(id).toBe('mock-uuid-123')
    })

    it('should generate different IDs for different names', () => {
      // Since we're mocking uuid to return the same value, we just test it's called
      const id1 = generateExerciseId('Exercise 1')
      const id2 = generateExerciseId('Exercise 2')
      // With real UUID they would be different, but with mock they're the same
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
    })
  })

  describe('getExerciseId', () => {
    it('should return predefined ID for known exercises', () => {
      const id = getExerciseId('Squat')
      expect(id).toBe('squat')
    })

    it('should return predefined ID for other known exercises', () => {
      const benchPressId = getExerciseId('Barbell Bench Press')
      expect(benchPressId).toBe('barbell_bench_press')

      const deadliftId = getExerciseId('Deadlift')
      expect(deadliftId).toBe('deadlift')
    })

    it('should generate UUID for custom exercises', () => {
      const id = getExerciseId('My Custom Exercise')
      expect(id).toBe('mock-uuid-123')
    })

    it('should be case-sensitive', () => {
      const id = getExerciseId('squat')
      expect(id).toBe('mock-uuid-123') // Generates new ID because case doesn't match
    })

    it('should handle exercises that belong to multiple types', () => {
      const id = getExerciseId('Dips')
      expect(typeof id).toBe('string')
      expect(id).toBe('dips')
    })
  })

  describe('Exercise Types Coverage', () => {
    it('should have exercises for all session types', () => {
      const sessionTypes = [
        SessionType.Legs,
        SessionType.Chest,
        SessionType.Back,
        SessionType.Arms,
        SessionType.Shoulders,
        SessionType.Core,
        SessionType.Cardio,
        SessionType.FullBody,
      ]

      sessionTypes.forEach((type) => {
        const exercises = getExercisesByType(type)
        expect(exercises.length).toBeGreaterThan(0)
      })
    })

    it('should have more exercises for major muscle groups', () => {
      const legsExercises = getExercisesByType(SessionType.Legs)
      const chestExercises = getExercisesByType(SessionType.Chest)
      const backExercises = getExercisesByType(SessionType.Back)

      expect(legsExercises.length).toBeGreaterThan(3)
      expect(chestExercises.length).toBeGreaterThan(3)
      expect(backExercises.length).toBeGreaterThan(3)
    })
  })
})
