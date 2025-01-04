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

export const programRequestSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required.",
    invalid_type_error: "Invalid start date.",
  }),
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
  prioritize: z.string().array().nullable(),
  types: z.string().array().nullable(),
  equipment: z.string().array().nullable(),
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
  workoutFocuses: z.string().array().nullable(),
  workoutTypes: z.string().array().nullable(),
  environments: z.string().array().nullable(),
  equipment: z.string().nullable(),
});
