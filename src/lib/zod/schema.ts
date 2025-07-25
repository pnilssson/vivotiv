import { z } from "zod";

export const exerciseTypeSchema = z.object({
  name: z.string(),
  description: z.string(),
  promptDescription: z.string(),
});

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
  exercises: z.array(exerciseSchema.extend({ exercise_type_id: z.string() })),
});

export const programSchema = z.object({
  start_date: z.string().date(),
  end_date: z.string().date(),
  workouts: z.array(workoutSchema),
});

export const configurationRequestSchema = z.object({
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
  workout_types: z.string().array().nullable(),
  preferred_days: z.string().array().nullable(),
  experience_id: z.string({
    required_error: "Experience is required.",
  }),
  equipment: z
    .string()
    .max(1000, "Maximum 1000 characters.")
    .regex(
      /^[\w,\s]*$/,
      "Please provide equipment in English. Allowed characters: a-z, A-Z, 0-9, comma, space."
    )
    .nullable(),
  generate_automatically: z.boolean(),
});

export const feedbackRequestSchema = z.object({
  feedback: z.string().min(1, {
    message: "Feedback is required.",
  }),
});
