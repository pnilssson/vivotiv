import { ZodIssue } from "zod";

export interface ActionResponse {
  success: boolean;
  errors: ZodIssue[];
  message: string | null;
}

export interface ProgramResponse {
  id: string;
  start_date: string; // ISO 8601 date string
  end_date: string; // ISO 8601 date string
  user_id: string;
  workouts: Workout[];
  version: number;
}

export interface ConfigurationResponse {
  id: string;
  user_id: string;
  sessions: number;
  time: number;
  workout_focuses: WorkoutFocus[];
  workout_types: WorkoutType[];
  environments: Environment[];
  preferred_days: Environment[];
  equipment: string;
  generate_automatically: boolean;
}

export interface ProfileResponse {
  id: string;
  name: string | null;
  email: string;
  program_tokens: string;
  stripe_customer_id: string;
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

export interface Environment {
  id: string;
  name: string;
}

export interface PreferredDay {
  id: string;
  name: string;
  number: number;
}
