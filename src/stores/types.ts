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
}

// Helper to validate and convert string to SessionType
export const isValidSessionType = (value: unknown): value is SessionType => {
  return typeof value === 'string' && Object.values(SessionType).includes(value as SessionType)
}

// Helper to safely convert string to SessionType or undefined
export const toSessionType = (value: unknown): SessionType | undefined => {
  return isValidSessionType(value) ? value : undefined
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
  id: number
  date: string // ISO date string
  startTime: string // ISO datetime string
  endTime?: string // ISO datetime string
  sessionType?: SessionType
  exercises: Exercise[]
  notes?: string
}
