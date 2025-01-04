import {
  ConfigurationResponse,
  Environment,
  WorkoutFocus,
  WorkoutType,
} from "@/types/types";
import { db } from "./db";
import { cache } from "react";

export const getConfigurationQuery = cache(async (userId: string) => {
  const result = await db.query.configuration.findFirst({
    with: {
      workoutFocuses: {
        with: { workoutFocus: true },
      },
      workoutTypes: {
        with: { workoutType: true },
      },
      environments: {
        with: { environment: true },
      },
    },
    where: (configuration, { eq }) => eq(configuration.user_id, userId),
  });

  if (!result) return null; // Handle case when no configuration is found

  const flattenedResult: ConfigurationResponse = {
    id: result.id,
    userId: result.user_id || "", // Default to empty string if user_id is null
    sessions: result.sessions,
    time: result.time,
    equipment: result.equipment || "", // Default to empty string if equipment is null
    workoutFocuses: result.workoutFocuses
      ? result.workoutFocuses.map((focus) => focus.workoutFocus as WorkoutFocus)
      : [], // Default to empty array if workoutFocuses is null
    workoutTypes: result.workoutTypes
      ? result.workoutTypes.map((type) => type.workoutType as WorkoutType)
      : [], // Default to empty array if workoutTypes is null
    environments: result.environments
      ? result.environments.map((env) => env.environment as Environment)
      : [], // Default to empty array if environments is null
  };

  return flattenedResult;
});

export const getWorkoutFocusQuery = cache(async () => {
  const result = await db.query.workoutFocus.findMany();
  return result as unknown as WorkoutFocus[];
});

export const getWorkoutTypesQuery = cache(async () => {
  const result = await db.query.workoutType.findMany();
  return result as unknown as WorkoutType[];
});

export const getEnvironmentsQuery = cache(async () => {
  const result = await db.query.environment.findMany();
  return result as unknown as Environment[];
});
