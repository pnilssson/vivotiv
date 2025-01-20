"use server";

import {
  ConfigurationResponse,
  ExerciseTypeResponse,
  ExperienceResponse,
  FeedbackResponse,
  PreferredDayResponse,
  ProfileResponse,
  ProgramResponse,
  WorkoutTypeResponse,
} from "@/lib/types";
import { db } from "./db";
import { cache } from "react";
import { asc, gte } from "drizzle-orm";
import { subDays, subMinutes } from "date-fns";
import { exerciseType, experience, preferredDay, workoutType } from "./schema";

export const getActiveProgramExistQuery = cache(async (userId: string) => {
  const exists = await db.query.program.findFirst({
    columns: { id: true },
    where: (program, { and, eq }) =>
      and(eq(program.user_id, userId), eq(program.archived, false)),
  });

  return !!exists; // Return true if a record exists, false otherwise
});

export const getCurrentProgramQuery = cache(async (userId: string) => {
  const result = await db.query.program.findFirst({
    where: (program, { eq, and }) =>
      and(eq(program.user_id, userId), eq(program.archived, false)),
    with: {
      workouts: {
        with: {
          warmup: {
            with: {
              exercises: true,
            },
          },
          exercises: {
            with: { exerciseType: true },
          },
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
        exerciseType: exercise.exerciseType,
      })),
    })),
  };

  return programResponse;
});

export const getCurrentGeneratedProgramsCountByUserIdQuery = cache(
  async (userId: string) => {
    const sixDaysAgo = subDays(new Date(), 6);

    const result = await db.query.program.findMany({
      columns: {
        id: true,
      },
      where: (program, { eq, and, gte }) =>
        and(eq(program.user_id, userId), gte(program.created, sixDaysAgo)),
    });

    return result.length;
  }
);

export const getConfigurationExistQuery = cache(async (userId: string) => {
  const exists = await db.query.configuration.findFirst({
    columns: { id: true },
    where: (configuration, { eq }) => eq(configuration.user_id, userId),
  });

  return !!exists; // Return true if a record exists, false otherwise
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
      experience: true,
    },
    where: (configuration, { eq }) => eq(configuration.user_id, userId),
  });

  if (!result) return null;

  const flattenedResult: ConfigurationResponse = {
    id: result.id,
    user_id: result.user_id || "",
    sessions: result.sessions,
    time: result.time,
    equipment: result.equipment || "",
    created: result.created,
    workout_types: result.workoutTypes
      ? result.workoutTypes.map(
          (type) => type.workoutType as WorkoutTypeResponse
        )
      : [],
    preferred_days: result.prefferedDays
      ? result.prefferedDays.map(
          (day) => day.preferredDay as PreferredDayResponse
        )
      : [],
    experience: result.experience,
    generate_automatically: result.generate_automatically,
  };

  return flattenedResult;
});

export const getConfigurationIdByUserIdQuery = async (userId: string) => {
  const result = await db.query.configuration.findFirst({
    columns: {
      id: true,
    },
    where: (configuration, { eq }) => eq(configuration.user_id, userId),
  });

  if (!result) return null;

  return result.id;
};

export const getExerciseTypeQuery = cache(async () => {
  const result = await db.query.exerciseType.findMany();
  return result as ExerciseTypeResponse[];
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

export const getExperiencesQuery = cache(async () => {
  const result = await db.query.experience.findMany({
    orderBy: [asc(experience.level)],
  });
  return result as ExperienceResponse[];
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
