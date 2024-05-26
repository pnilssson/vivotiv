import { ZodIssue } from "zod";

export interface ActionResponse {
  success: boolean;
  errors: ZodIssue[];
}

export interface ProgramActionResponse extends ActionResponse {
  program: Program | null;
}

// Interface for Amount
interface Amount {
  sets: number | null;
  reps: number | null;
  type: string;
}

// Interface for WarmUpExercise
interface WarmUpExercise {
  title: string;
  description: string;
  amount: Amount;
}

// Interface for WarmUp
interface WarmUp {
  description: string;
  duration: number;
  exercises: WarmUpExercise[];
}

// Interface for Exercise
interface Exercise {
  title: string;
  description: string;
  amount: Amount;
  restPeriod: number;
}

// Interface for Workout
interface Workout {
  date: string; // ISO 8601 date string
  completed: boolean;
  description: string;
  warmup: WarmUp;
  exercises: Exercise[];
}

// Interface for Program
interface Program {
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  workouts: Workout[];
}
