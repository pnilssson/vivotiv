import { ZodIssue } from "zod";

export interface FormResponse {
  success: boolean;
  errors: ZodIssue[];
}

export interface ProgramFormResponse extends FormResponse {
  program: Program | null;
}

export interface ProgramResponse {
  id: string,
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
	userId: string,
	prompt: string,
	program: string,
	version: number,
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

export interface Program {
  id: string;
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  workouts: Workout[] | null;
  userId: string;
}

export interface GenerateFormValues {
  startDate: Date;
  sessions: number;
  time: number;
  prioritize: string[] | null;
  types: string[] | null;
  equipment: string[] | null;
}
