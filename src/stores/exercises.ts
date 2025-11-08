import { v4 as uuidv4 } from 'uuid'
import { SessionType } from './types'

export interface PredefinedExercise {
  id: string
  name: string
  types: SessionType[]
}

// Generate UUID for exercises
export const generateExerciseId = (name: string): string => {
  return uuidv4()
}

// prettier-ignore
export const predefinedExercises: PredefinedExercise[] = [
    // Legs
    { id: 'squat', name: 'Squat', types: [SessionType.Legs] },
    { id: 'leg_press', name: 'Leg Press', types: [SessionType.Legs] },
    { id: 'hamstring_curls', name: 'Hamstring Curls', types: [SessionType.Legs] },
    { id: 'quad_extension', name: 'Quad Extension', types: [SessionType.Legs] },
    { id: 'sumo_deadlift', name: 'Sumo Deadlift', types: [SessionType.Legs] },
    { id: 'calf_raises', name: 'Calf Raises', types: [SessionType.Legs] },
    { id: 'lunges', name: 'Lunges', types: [SessionType.Legs] },
    { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', types: [SessionType.Legs] },

    // Chest
    { id: 'barbell_bench_press', name: 'Barbell Bench Press', types: [SessionType.Chest] },
    { id: 'dumbbell_bench_press', name: 'Dumbbell Bench Press', types: [SessionType.Chest] },
    { id: 'barbell_incline_bench_press', name: 'Incline Barbell Press', types: [SessionType.Chest] },
    { id: 'dumbbell_incline_press', name: 'Incline Dumbbell Press', types: [SessionType.Chest] },
    { id: 'chest_fly', name: 'Chest Fly', types: [SessionType.Chest] },
    { id: 'push_ups', name: 'Push Ups', types: [SessionType.Chest] },
    { id: 'dips', name: 'Dips', types: [SessionType.Chest, SessionType.Arms] },
    { id: 'cable_fly', name: 'Cable Fly', types: [SessionType.Chest] },

    // Back
    { id: 'deadlift', name: 'Deadlift', types: [SessionType.Back] },
    { id: 'pull_ups', name: 'Pull Ups', types: [SessionType.Back] },
    { id: 'chin_ups', name: 'Chin Ups', types: [SessionType.Back] },
    { id: 'bent_over_row', name: 'Bent Over Row', types: [SessionType.Back] },
    { id: 'seated_cable_row', name: 'Seated Cable Row', types: [SessionType.Back] },
    { id: 'lat_pulldown', name: 'Lat Pulldown', types: [SessionType.Back] },
    { id: 't_bar_row', name: 'T-Bar Row', types: [SessionType.Back] },
    { id: 'cable_row', name: 'Cable Row', types: [SessionType.Back] },
    { id: 'shrugs', name: 'Shrugs', types: [SessionType.Back, SessionType.Shoulders] },

    // Arms
    { id: 'bicep_curl', name: 'Bicep Curl', types: [SessionType.Arms] },
    { id: 'hammer_curl', name: 'Hammer Curl', types: [SessionType.Arms] },
    { id: 'tricep_pushdown', name: 'Tricep Pushdown', types: [SessionType.Arms] },
    { id: 'overhead_tricep_extension', name: 'Overhead Tricep Extension', types: [SessionType.Arms] },
    { id: 'french_bench_press', name: 'French Bench Press', types: [SessionType.Arms] },
    { id: 'close_grip_bench_press', name: 'Close-Grip Bench Press', types: [SessionType.Arms] },
    { id: 'cable_curl', name: 'Cable Curl', types: [SessionType.Arms] },
    { id: 'tricep_dips', name: 'Tricep Dips', types: [SessionType.Arms] },

    // Shoulders
    { id: 'barbell_overhead_press', name: 'Barbell Overhead Press', types: [SessionType.Shoulders] },
    { id: 'seated_db_press', name: 'Seated DB Press', types: [SessionType.Shoulders] },
    { id: 'lateral_raise', name: 'Lateral Raise', types: [SessionType.Shoulders] },
    { id: 'front_raise', name: 'Front Raise', types: [SessionType.Shoulders] },
    { id: 'rear_delt_fly', name: 'Rear Delt Fly', types: [SessionType.Shoulders] },
    { id: 'face_pulls', name: 'Face Pulls', types: [SessionType.Shoulders] },
    { id: 'arnold_press', name: 'Arnold Press', types: [SessionType.Shoulders] },
    { id: 'cable_lateral_raise', name: 'Cable Lateral Raise', types: [SessionType.Shoulders] },
    { id: 'handstand_practice', name: 'Handstand Practice', types: [SessionType.Shoulders] },
    { id: 'handstand_push_ups', name: 'Handstand Push Ups', types: [SessionType.Shoulders] },


    // Core
    { id: 'plank', name: 'Plank', types: [SessionType.Core] },
    { id: 'crunches', name: 'Crunches', types: [SessionType.Core] },
    { id: 'russian_twists', name: 'Russian Twists', types: [SessionType.Core] },
    { id: 'leg_raises', name: 'Leg Raises', types: [SessionType.Core] },
    { id: 'dead_bug', name: 'Dead Bug', types: [SessionType.Core] },
    { id: 'mountain_climbers', name: 'Mountain Climbers', types: [SessionType.Core] },

    // Cardio
    { id: 'running', name: 'Running', types: [SessionType.Cardio] },
    { id: 'cycling', name: 'Cycling', types: [SessionType.Cardio] },
    { id: 'rowing', name: 'Rowing', types: [SessionType.Cardio] },
    { id: 'elliptical', name: 'Elliptical', types: [SessionType.Cardio] },
    { id: 'stair_climber', name: 'Stair Climber', types: [SessionType.Cardio] },

    // Full Body / Mixed
    { id: 'burpees', name: 'Burpees', types: [SessionType.FullBody, SessionType.Mixed] },
    { id: 'kettlebell_swings', name: 'Kettlebell Swings', types: [SessionType.FullBody, SessionType.Mixed] },
    { id: 'thruster', name: 'Thruster', types: [SessionType.FullBody, SessionType.Mixed] }, 
]

// Get exercises filtered by session type
export const getExercisesByType = (sessionType?: SessionType): PredefinedExercise[] => {
  if (!sessionType) return predefinedExercises
  return predefinedExercises.filter((ex) => ex.types.includes(sessionType))
}

// Get all unique exercise names (for search/autocomplete)
export const getAllExerciseNames = (): string[] => {
  return [...new Set(predefinedExercises.map((ex) => ex.name))]
}

// Get predefined exercise by name
export const getPredefinedExerciseByName = (name: string): PredefinedExercise | undefined => {
  return predefinedExercises.find((ex) => ex.name === name)
}

// Get predefined exercise by ID
export const getPredefinedExerciseById = (id: string): PredefinedExercise | undefined => {
  return predefinedExercises.find((ex) => ex.id === id)
}

// Get exercise ID from name (uses predefined ID if available, otherwise generates one)
export const getExerciseId = (name: string): string => {
  const predefined = getPredefinedExerciseByName(name)
  return predefined ? predefined.id : generateExerciseId(name)
}
