import { z } from "zod";

export const exerciseSchema = z.object({
  title: z.string(),
  description: z.string(),
  execution: z.string(),
});

export const warmUpSchema = z.object({
  description: z.string(),
  exercises: z.array(exerciseSchema),
});

export const workoutSchema = z.object({
  date: z.string().date(),
  completed: z.boolean(),
  description: z.string(),
  warmup: warmUpSchema,
  exercises: z.array(exerciseSchema),
});

export const programSchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
  workouts: z.array(workoutSchema),
});
