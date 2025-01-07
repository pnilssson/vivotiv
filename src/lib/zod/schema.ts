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
  start_date: z.string().date(),
  end_date: z.string().date(),
  workouts: z.array(workoutSchema),
});

export const configurationRequestSchema = z.object({
  id: z.string().nullable(),
  sessions: z.coerce
    .number({
      required_error: "Sessions is required.",
    })
    .positive()
    .lte(7),
  time: z.coerce
    .number({
      required_error: "Session length is required.",
    })
    .positive()
    .gte(15, "Session length cannot be less than 15 minutes.")
    .lte(60, "Session length cannot be more than 60 minutes."),
  workout_focuses: z.string().array().nullable(),
  workout_types: z.string().array().nullable(),
  environments: z.string().array().nullable(),
  preferred_days: z.string().array().nullable(),
  equipment: z.string().nullable(),
  generate_automatically: z.boolean(),
});
