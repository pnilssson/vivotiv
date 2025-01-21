import { ActionResponse } from "@/lib/types";

export const INITIAL_FORM_STATE: ActionResponse = {
  success: false,
  errors: [],
  message: null,
};

export const MOTIVATIONAL_TITLES = [
  "You got this",
  "You are doing great",
  "Let's do this",
  "Do it for you",
  "Be proud of yourself",
  "Own your week",
  "This is your time",
  "You are in charge",
  "Commit to you",
  "Strive for progress",
];

export const MIN_DATE = new Date(0);

export const PROGRAM_GENERATION_LIMIT = 99;
export const PROGRAM_ARCHIVED_LIMIT = 5;
