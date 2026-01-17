import { describe, it, expect } from 'vitest'
import { SessionType, isValidSessionType, toSessionType } from '../../src/stores/types'

describe('Session Types', () => {
  describe('SessionType enum', () => {
    it('should have all expected session types', () => {
      expect(SessionType.Legs).toBe('legs')
      expect(SessionType.Chest).toBe('chest')
      expect(SessionType.Back).toBe('back')
      expect(SessionType.Arms).toBe('arms')
      expect(SessionType.Shoulders).toBe('shoulders')
      expect(SessionType.Mixed).toBe('mixed')
      expect(SessionType.Core).toBe('core')
      expect(SessionType.Cardio).toBe('cardio')
      expect(SessionType.FullBody).toBe('fullBody')
      expect(SessionType.CrossFit).toBe('crossFit')
    })

    it('should have correct number of session types', () => {
      const sessionTypes = Object.values(SessionType)
      expect(sessionTypes).toHaveLength(10)
    })
  })

  describe('isValidSessionType', () => {
    it('should return true for valid session type strings', () => {
      expect(isValidSessionType('legs')).toBe(true)
      expect(isValidSessionType('chest')).toBe(true)
      expect(isValidSessionType('back')).toBe(true)
      expect(isValidSessionType('arms')).toBe(true)
      expect(isValidSessionType('shoulders')).toBe(true)
      expect(isValidSessionType('mixed')).toBe(true)
      expect(isValidSessionType('core')).toBe(true)
      expect(isValidSessionType('cardio')).toBe(true)
      expect(isValidSessionType('fullBody')).toBe(true)
      expect(isValidSessionType('crossFit')).toBe(true)
    })

    it('should return false for invalid session type strings', () => {
      expect(isValidSessionType('invalid')).toBe(false)
      expect(isValidSessionType('LEGS')).toBe(false)
      expect(isValidSessionType('leg')).toBe(false)
      expect(isValidSessionType('')).toBe(false)
    })

    it('should return false for non-string values', () => {
      expect(isValidSessionType(123)).toBe(false)
      expect(isValidSessionType(null)).toBe(false)
      expect(isValidSessionType(undefined)).toBe(false)
      expect(isValidSessionType({})).toBe(false)
      expect(isValidSessionType([])).toBe(false)
      expect(isValidSessionType(true)).toBe(false)
    })

    it('should work with SessionType enum values', () => {
      expect(isValidSessionType(SessionType.Legs)).toBe(true)
      expect(isValidSessionType(SessionType.CrossFit)).toBe(true)
    })
  })

  describe('toSessionType', () => {
    it('should convert valid strings to SessionType', () => {
      expect(toSessionType('legs')).toBe(SessionType.Legs)
      expect(toSessionType('chest')).toBe(SessionType.Chest)
      expect(toSessionType('crossFit')).toBe(SessionType.CrossFit)
    })

    it('should return undefined for invalid strings', () => {
      expect(toSessionType('invalid')).toBeUndefined()
      expect(toSessionType('LEGS')).toBeUndefined()
      expect(toSessionType('')).toBeUndefined()
    })

    it('should return undefined for non-string values', () => {
      expect(toSessionType(123)).toBeUndefined()
      expect(toSessionType(null)).toBeUndefined()
      expect(toSessionType(undefined)).toBeUndefined()
      expect(toSessionType({})).toBeUndefined()
      expect(toSessionType([])).toBeUndefined()
    })

    it('should handle SessionType enum values', () => {
      expect(toSessionType(SessionType.Back)).toBe(SessionType.Back)
      expect(toSessionType(SessionType.FullBody)).toBe(SessionType.FullBody)
    })
  })
})
