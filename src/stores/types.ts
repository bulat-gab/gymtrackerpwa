export enum SessionType {
  Legs = 'legs',
  Chest = 'chest',
  Back = 'back',
  Arms = 'arms',
  Shoulders = 'shoulders',
  Mixed = 'mixed',
  Core = 'core',
  Cardio = 'cardio',
  FullBody = 'fullBody',
  CrossFit = 'crossFit',
}

// Helper to validate and convert string to SessionType
export const isValidSessionType = (value: unknown): value is SessionType => {
  return typeof value === 'string' && Object.values(SessionType).includes(value as SessionType)
}

// Helper to safely convert string to SessionType or undefined
export const toSessionType = (value: unknown): SessionType | undefined => {
  return isValidSessionType(value) ? value : undefined
}

// Get all session types with labels in display order
export const getSessionTypesWithLabels = (): Array<{ value: SessionType; label: string }> => {
  return [
    { value: SessionType.Legs, label: 'Legs' },
    { value: SessionType.Chest, label: 'Chest' },
    { value: SessionType.Back, label: 'Back' },
    { value: SessionType.Arms, label: 'Arms' },
    { value: SessionType.Shoulders, label: 'Shoulders' },
    { value: SessionType.Core, label: 'Core' },
    { value: SessionType.Cardio, label: 'Cardio' },
    { value: SessionType.FullBody, label: 'Full Body' },
    { value: SessionType.CrossFit, label: 'CrossFit' },
    { value: SessionType.Mixed, label: 'Mixed' },
  ]
}

// Get display label for a session type
export const getSessionTypeLabel = (type: SessionType): string => {
  const types = getSessionTypesWithLabels()
  return types.find((t) => t.value === type)?.label || type
}

export interface ExerciseSet {
  reps?: number
  weight?: number
  duration?: number // in seconds
  distance?: number // in meters
  notes?: string
}

export interface Exercise {
  id: string
  name: string
  sets: ExerciseSet[]
  notes?: string
}

export interface GymSession {
  id: string
  startTime: string // ISO datetime string
  endTime?: string // ISO datetime string
  sessionType?: SessionType
  exercises: Exercise[]
  notes?: string
}

/**
 * Gets the local date (YYYY-MM-DD) from a session's startTime
 */
export const getSessionDate = (session: GymSession): string => {
  const date = new Date(session.startTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
