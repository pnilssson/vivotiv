import {
  ConfigurationResponse,
  PreferredDay,
  ProfileResponse,
  ProgramResponse,
  WorkoutFocus,
  WorkoutType,
} from "@/types/types";
import { db } from "./db";
import { cache } from "react";

export const getProgramByIdQuery = cache(async (id: string, userId: string) => {
  const result = await db.query.program.findFirst({
    where: (program, { eq, and }) =>
      and(
        eq(program.user_id, userId),
        eq(program.id, id),
        eq(program.archived, false)
      ),
  });

  return result as ProgramResponse;
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
  });

  return result as ProgramResponse;
});

export const getConfigurationQuery = cache(async (userId: string) => {
  const result = await db.query.configuration.findFirst({
    with: {
      workoutFocuses: {
        with: { workoutFocus: true },
      },
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
    workout_focuses: result.workoutFocuses
      ? result.workoutFocuses.map((focus) => focus.workoutFocus as WorkoutFocus)
      : [], // Default to empty array if workoutFocuses is null
    workout_types: result.workoutTypes
      ? result.workoutTypes.map((type) => type.workoutType as WorkoutType)
      : [], // Default to empty array if workoutTypes is null
    preferred_days: result.prefferedDays
      ? result.prefferedDays.map((day) => day.preferredDay as PreferredDay)
      : [], // Default to empty array if preferredDays is null
    generate_automatically: result.generate_automatically,
  };

  return flattenedResult;
});

export const getWorkoutFocusQuery = cache(async () => {
  const result = await db.query.workoutFocus.findMany();
  return result as WorkoutFocus[];
});

export const getWorkoutTypesQuery = cache(async () => {
  const result = await db.query.workoutType.findMany();
  return result as WorkoutType[];
});

export const getPreferredDaysQuery = cache(async () => {
  const result = await db.query.preferredDay.findMany();
  return result as PreferredDay[];
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
