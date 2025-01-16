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
  workouts: WorkoutResponse[];
  created: Date;
}

export interface ConfigurationResponse {
  id: string;
  user_id: string;
  sessions: number;
  time: number;
  workout_types: WorkoutTypeResponse[];
  preferred_days: PreferredDayResponse[];
  experience: ExperienceResponse;
  equipment: string;
  generate_automatically: boolean;
  created: Date;
}

export interface ProfileResponse {
  id: string;
  name: string | null;
  email: string;
  program_tokens: number;
  stripe_customer_id: string;
  created: Date;
}

export interface FeedbackResponse {
  id: string;
  user_id: string;
  feedback: string;
  created: Date;
}

export interface ExerciseResponse {
  id: string;
  title: string;
  description: string;
  execution: string;
  completed: boolean;
}

export interface WarmUpResponse {
  id: string;
  description: string;
  exercises: ExerciseResponse[] | null;
}

export interface WorkoutResponse {
  id: string;
  date: string; // ISO 8601 date string
  completed: boolean;
  description: string;
  warmup: WarmUpResponse | null;
  exercises: ExerciseResponse[] | null;
}

export interface WorkoutTypeResponse {
  id: string;
  name: string;
}

export interface PreferredDayResponse {
  id: string;
  name: string;
  number: number;
}

export interface ExperienceResponse {
  id: string;
  name: string;
  description: string | null;
  level: number;
}
