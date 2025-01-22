import { ActionResponse } from "@/lib/types";

export const INITIAL_FORM_STATE: ActionResponse = {
  success: false,
  errors: [],
  message: null,
};

export const MOTIVATIONAL_TITLES = [
  "You got this",
  "You're doing great",
  "Just do it",
  "Do it for you",
  "Be proud of yourself",
  "This is your time",
  "You are in charge",
  "Commit to you",
  "Strive for progress",
  "Consistency is key",
  "Stay focused",
  "Believe in yourself",
  "One step at a time",
  "You’ve got what it takes",
];

export const MIN_DATE = new Date(0);

export const PROGRAM_GENERATION_LIMIT = 15;
export const PROGRAM_ARCHIVED_LIMIT = 5;
