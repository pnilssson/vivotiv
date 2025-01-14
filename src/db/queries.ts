import {
  ConfigurationResponse,
  FeedbackResponse,
  PreferredDayResponse,
  ProfileResponse,
  ProgramResponse,
  WorkoutTypeResponse,
} from "@/lib/types";
import { db } from "./db";
import { cache } from "react";
import { asc, gte } from "drizzle-orm";
import { subMinutes } from "date-fns";
import { preferredDay, workoutType } from "./schema";

export const getProgramByIdQuery = cache(async (id: string, userId: string) => {
  const result = await db.query.program.findFirst({
    where: (program, { eq, and }) =>
      and(
        eq(program.user_id, userId),
        eq(program.id, id),
        eq(program.archived, false)
      ),
  });

  return result as unknown as ProgramResponse;
});

export const getCurrentProgramQuery = cache(async (userId: string) => {
  const today = new Date().toISOString().split("T")[0];

  const result = await db.query.program.findFirst({
    where: (program, { eq, gte, lte, and }) =>
      and(
        eq(program.user_id, userId),
        eq(program.archived, false),
        lte(program.start_date, today),
        gte(program.end_date, today)
      ),
    with: {
      workouts: {
        with: {
          warmup: {
            with: {
              exercises: true,
            },
          },
          exercises: true,
        },
      },
    },
  });

  if (!result) return null; // Handle case where no program is found

  // Build the final ProgramResponse
  const programResponse: ProgramResponse = {
    id: result.id,
    start_date: result.start_date,
    end_date: result.end_date,
    user_id: result.user_id,
    created: result.created,
    workouts: result.workouts.map((workout) => ({
      id: workout.id,
      date: workout.date,
      completed: workout.completed,
      description: workout.description,
      warmup: workout.warmup
        ? {
            id: workout.warmup.id,
            description: workout.warmup.description,
            exercises: workout.warmup.exercises.map((exercise) => ({
              id: exercise.id,
              title: exercise.title,
              description: exercise.description,
              execution: exercise.execution,
              completed: exercise.completed,
            })),
          }
        : null,
      exercises: workout.exercises.map((exercise) => ({
        id: exercise.id,
        title: exercise.title,
        description: exercise.description,
        execution: exercise.execution,
        completed: exercise.completed,
      })),
    })),
  };

  return programResponse;
});

export const getConfigurationQuery = cache(async (userId: string) => {
  const result = await db.query.configuration.findFirst({
    with: {
      workoutTypes: {
        with: { workoutType: true },
      },
      prefferedDays: {
        with: { preferredDay: true },
      },
    },
    where: (configuration, { eq }) => eq(configuration.user_id, userId),
  });

  if (!result) return null; // Handle case when no configuration is found

  const flattenedResult: ConfigurationResponse = {
    id: result.id,
    user_id: result.user_id || "", // Default to empty string if user_id is null
    sessions: result.sessions,
    time: result.time,
    equipment: result.equipment || "", // Default to empty string if equipment is null
    created: result.created,
    workout_types: result.workoutTypes
      ? result.workoutTypes.map(
          (type) => type.workoutType as WorkoutTypeResponse
        )
      : [], // Default to empty array if workoutTypes is null
    preferred_days: result.prefferedDays
      ? result.prefferedDays.map(
          (day) => day.preferredDay as PreferredDayResponse
        )
      : [], // Default to empty array if preferredDays is null
    generate_automatically: result.generate_automatically,
  };

  return flattenedResult;
});

export const getWorkoutTypesQuery = cache(async () => {
  const result = await db.query.workoutType.findMany({
    orderBy: [asc(workoutType.name)],
  });
  return result as WorkoutTypeResponse[];
});

export const getPreferredDaysQuery = cache(async () => {
  const result = await db.query.preferredDay.findMany({
    orderBy: [asc(preferredDay.number)],
  });
  return result as PreferredDayResponse[];
});

export const getProfileByEmailQuery = cache(async (email: string) => {
  const result = await db.query.profile.findFirst({
    where: (profile, { eq }) => eq(profile.email, email),
  });
  return result as ProfileResponse | undefined;
});

export const getProfileByIdQuery = cache(async (userId: string) => {
  const result = await db.query.profile.findFirst({
    where: (profile, { eq }) => eq(profile.id, userId),
  });
  return result as ProfileResponse;
});

export const getAnyFeedbackWithinLastMinuteByUserIdQuery = cache(
  async (userId: string) => {
    const oneMinuteAgo = subMinutes(new Date(), 1); // Get the date-time one hour ago
    const result = await db.query.feedback.findFirst({
      where: (feedback, { eq, and }) =>
        and(eq(feedback.user_id, userId), gte(feedback.created, oneMinuteAgo)),
    });
    return result as FeedbackResponse | undefined;
  }
);
