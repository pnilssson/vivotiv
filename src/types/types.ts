import { ZodIssue } from "zod";

export interface FormResponse {
  success: boolean;
  errors: ZodIssue[];
}

export interface ProgramResponse {
  id: string;
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  userId: string;
  workouts: Workout[] | null;
  version: number;
}

export interface ProgramMetadataResponse {
  id: string;
  startDate: string;
  endDate: string;
}

export interface ConfigurationResponse {
  id: string;
  userId: string;
  sessions: number;
  time: number;
  workoutFocuses: WorkoutFocus[];
  workoutTypes: WorkoutType[];
  availableSpaces: AvailableSpace[];
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  execution: string;
}

export interface WarmUp {
  id: string;
  description: string;
  exercises: Exercise[] | null;
}

export interface Workout {
  id: string;
  date: string; // ISO 8601 date string
  completed: boolean;
  description: string;
  warmup: WarmUp;
  exercises: Exercise[] | null;
}

export interface WorkoutFocus {
  id: string;
  name: string;
}

export interface WorkoutType {
  id: string;
  name: string;
}

export interface AvailableSpace {
  id: string;
  name: string;
}

export interface GenerateFormValues {
  startDate: Date;
  sessions: number;
  time: number;
  prioritize: string[] | null;
  types: string[] | null;
  equipment: string[] | null;
}
