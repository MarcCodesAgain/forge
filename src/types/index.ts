export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface Set {
  id: string;
  reps: number;
  weight: number; // kg
}

export interface WorkoutDay {
  id: string;
  name: string; // e.g. "Lunes - Pecho"
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  days: WorkoutDay[];
  createdAt: string;
}

export interface WorkoutLog {
  id: string;
  planId: string;
  dayId: string;
  date: string; // ISO
  exercises: LoggedExercise[];
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
}

export interface LoggedSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
}
