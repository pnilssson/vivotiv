import { ZodIssue } from "zod";

export interface ActionResponse {
  success: boolean;
  errors: ZodIssue[];
}

export interface ProgramActionResponse extends ActionResponse {
  program: Program | null;
}

interface Exercise {
  title: string;
  description: string;
  execution: string;
}

interface WarmUp {
  description: string;
  exercises: Exercise[];
}

interface Workout {
  date: string; // ISO 8601 date string
  completed: boolean;
  description: string;
  warmup: WarmUp;
  exercises: Exercise[];
}

interface Program {
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  workouts: Workout[];
}
