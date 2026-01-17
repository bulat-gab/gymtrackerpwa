import type { Exercise, ExerciseSet, GymSession } from './types'
import { SessionType } from './types'
import { getExerciseId } from './exercises'

// Legacy format types (for importing old data)
export interface LegacyExercise {
  Id: number
  Name: string
  Sets: number
  Reps: number
  Weight: number
  Notes: string | null
}

export interface LegacySession {
  Id: number
  StartTime: string
  EndTime: string
  Notes: string | null
  SessionType: number
  Exercises: LegacyExercise[]
  Duration: string
  SchemaVersion: number
}

// Convert legacy format to new format
export const convertLegacySession = (
  legacy: LegacySession,
  generateSessionId: () => string,
): GymSession => {
  const startDate = new Date(legacy.StartTime)
  const endDate = new Date(legacy.EndTime)
  const dateStr = startDate.toISOString().split('T')[0] || startDate.toISOString().substring(0, 10)

  // Convert exercises: old format has Sets/Reps/Weight as single values (all sets same)
  // Handle empty exercises array (legacy sessions with no exercises)
  const exercises: Exercise[] = (legacy.Exercises || []).map((legacyEx, idx) => {
    const sets: ExerciseSet[] = []
    // Create sets array - each set has the same reps/weight in legacy format
    const numSets = legacyEx.Sets || 0
    for (let i = 0; i < numSets; i++) {
      sets.push({
        reps: legacyEx.Reps > 0 ? legacyEx.Reps : undefined,
        weight: legacyEx.Weight > 0 ? legacyEx.Weight : undefined,
        notes: legacyEx.Notes || undefined,
      })
    }

    const exerciseName = legacyEx.Name || 'Unnamed Exercise'
    return {
      id: getExerciseId(exerciseName),
      name: exerciseName,
      sets,
      notes: legacyEx.Notes || undefined,
    }
  })

  // Map legacy SessionType enum (bit flags) to new SessionType enum
  // Legacy: Legs=1, Chest=2, Back=4, Shoulders=8, Core=16, CrossFit=32, Cardio=64, FullBody=128, Mobility=256, Arms=512
  const mapLegacySessionType = (type: number): SessionType | undefined => {
    if (type === 0) return undefined
    if (type & 1) return SessionType.Legs // Legs
    if (type & 2) return SessionType.Chest // Chest
    if (type & 4) return SessionType.Back // Back
    if (type & 8) return SessionType.Shoulders // Shoulders
    if (type & 16) return SessionType.Core // Core
    if (type & 64) return SessionType.Cardio // Cardio
    if (type & 128) return SessionType.FullBody // FullBody
    if (type & 512) return SessionType.Arms // Arms
    // If multiple flags or unknown, default to Mixed
    return SessionType.Mixed
  }

  return {
    id: generateSessionId(),
    date: dateStr,
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
    sessionType: mapLegacySessionType(legacy.SessionType),
    exercises,
    notes: legacy.Notes || undefined,
  }
}

// Check if data is in legacy format
export const isLegacyFormat = (data: unknown): data is LegacySession[] => {
  if (!Array.isArray(data) || data.length === 0) return false
  const first = data[0]
  return (
    typeof first === 'object' &&
    first !== null &&
    'StartTime' in first &&
    'Exercises' in first &&
    'Id' in first
  )
}
