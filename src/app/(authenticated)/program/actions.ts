"use server";

import {
  archiveProgramCommand,
  completeWorkoutCommand,
  handleProgramInserts,
  uncompleteWorkoutCommand,
} from "@/db/commands";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { programSchema } from "@/lib/zod/schema";
import {
  ActionResponse,
  ConfigurationResponse,
  ProgramResponse,
  WorkoutTypeResponse,
} from "@/types/types";
import { revalidatePath } from "next/cache";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import {
  getConfigurationQuery,
  getCurrentProgramQuery,
  getWorkoutTypesQuery,
} from "@/db/queries";
import * as Sentry from "@sentry/nextjs";

export async function getCurrentProgram(): Promise<ProgramResponse | null> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  return await getCurrentProgramQuery(user.id);
}

export async function archiveProgram(programId: string) {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  await archiveProgramCommand(programId, user.id);
  revalidatePath("/program", "page");
}

export async function completeWorkout(workoutId: string) {
  const supabase = await createClient();
  await getUserOrRedirect(supabase);

  await completeWorkoutCommand(workoutId);
  revalidatePath("/program", "page");
}

export async function uncompleteWorkout(workoutId: string) {
  const supabase = await createClient();
  await getUserOrRedirect(supabase);

  await uncompleteWorkoutCommand(workoutId);
  revalidatePath("/program", "page");
}

export async function generateProgram(): Promise<ActionResponse> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  const configuration = await getConfigurationQuery(user.id);

  if (!configuration) {
    Sentry.captureMessage(
      "No configuration was found for user when generating program.",
      { user: { id: user.id, email: user.email }, level: "error" }
    );
    return {
      success: false,
      errors: [],
      message: "No configuration found.",
    };
  }
  const prompt = await getPrompt(configuration);

  try {
    const { object: program, usage } = await generateObject({
      model: openai("gpt-4o"),
      mode: "json",
      schemaName: "home-training",
      schemaDescription: "One week of home training.",
      schema: programSchema,
      prompt,
      temperature: 0.3,
    });

    await handleProgramInserts(
      program,
      user.id,
      prompt,
      usage.promptTokens,
      usage.completionTokens
    );
  } catch (error) {
    Sentry.captureException(error, {
      user: { id: user.id, email: user.email },
      extra: { prompt },
    });
    throw new Error("Error when generating a program.");
  }

  revalidatePath("/program", "page");
  return {
    success: true,
    errors: [],
    message: "A new program is ready for you!",
  };
}

const getPrompt = async (data: ConfigurationResponse): Promise<string> => {
  const allWorkoutTypes = await getWorkoutTypesQuery();
  const { sessions, time, workout_types, equipment, preferred_days } = data;
  const excludedWorkoutTypes = getExcludedWorkoutTypes(
    allWorkoutTypes,
    workout_types
  );

  const today = new Date();
  const formattedStartDate = today.toISOString().split("T")[0]; // Use ISO format for start date
  const formattedEndDate = new Date(today.setDate(today.getDate() + 6))
    .toISOString()
    .split("T")[0]; // Calculate end date as 6 days after start
  const assignedDates = assignSessionsToDays(
    sessions,
    formattedStartDate,
    preferred_days.map((day) => day.name)
  );
  const workoutDatesText = `Workouts will be scheduled on these dates: ${assignedDates.join(", ")}.`;

  const typesText =
    workout_types.length > 0
      ? `The workouts MUST include ${workout_types
          .map((a) => a.name)
          .join(
            " and "
          )} exercises and CANNOT include ${excludedWorkoutTypes.join(" and ")} exercises.`
      : "The workouts should include strength, conditioning and mobility exercises.";

  const equipmentText =
    equipment.length > 0
      ? `The available equipment includes ${equipment}.`
      : "No additional equipment is available.";

  // Calculate warmup and workout times with rounding
  const warmupTime = Math.round(time * 0.2);
  const warmupExercises = Math.ceil(warmupTime / 3);
  const workoutExerciseTime = Math.round(time * 0.8);
  const workoutExercises = Math.floor(workoutExerciseTime / 5);

  return `You are tasked with generating a one-week home-training program that aligns with the following requirements:

1. Program Details:
   - Start date: ${formattedStartDate}
   - End date: ${formattedEndDate}
   - Sessions: ${sessions}
   - ${workoutDatesText}

2. Workout Structure:
   - IMPORTANT: ${typesText}
   - Each workout should contain:
     - Warm-up exercises: ${warmupExercises}-${warmupExercises + 1}.
     - Workout exercises: ${workoutExercises}-${workoutExercises + 1}.
     - IMPORTANT: Vary number of exercises between sessions.

3. Available Equipment:
   - ${equipmentText}

4. Exercise Executions:
   - Vary execution types across exercises within each workout.
     - Reps and sets
     - AMRAP (as many reps as possible within a time frame)
     - EMOM (every minute on the minute)
     - Tabata (20 seconds of high-intensity work followed by 10 seconds of rest, repeated for 8 rounds)
     - For Time (Complete a specific reps of exercises as quickly as possible)
   - IMPORTANT: If reps and sets is used the execution MUST include rest period.

5. Exercise Description:
   - Provide a clear, user-friendly description of how to perform the exercise.`;
};

const getExcludedWorkoutTypes = (
  allWorkoutTypes: WorkoutTypeResponse[],
  workout_types: WorkoutTypeResponse[]
): string[] => {
  // Filter out workout types from allWorkoutTypes whose names do not exist in workout_types
  return allWorkoutTypes
    .filter(
      (workoutType) => !workout_types.some((wt) => wt.name === workoutType.name)
    )
    .map((workoutType) => workoutType.name);
};

function assignSessionsToDays(
  sessions: number,
  startDate: string,
  prioritizedDays: string[]
): string[] {
  const dayMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const start = new Date(startDate);
  const allDates: string[] = [];

  // Get all prioritized days' dates in the next week
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i); // Increment day by i

    const dayOfWeek = currentDate.getDay(); // Get the day of the week (0-6)

    if (
      prioritizedDays.some((day) => dayMap[day.toLowerCase()] === dayOfWeek)
    ) {
      allDates.push(currentDate.toISOString().split("T")[0]);
    }
  }

  const assignedDates: string[] = [];

  if (sessions > allDates.length) {
    // More sessions than prioritized days, assign remaining sessions to any day
    const remainingSessions = sessions - allDates.length;

    // First, assign one session to each prioritized day
    assignedDates.push(...allDates);

    // Then, randomly assign remaining sessions to any day (including prioritized days)
    const remainingDays = getAllDaysInWeek(startDate); // Get all the days of the week
    const extraSessions = getRandomDays(remainingSessions, remainingDays);
    assignedDates.push(...extraSessions);
  } else {
    // Fewer sessions than prioritized days, randomly assign sessions to the prioritized days
    const randomPrioritizedDays = getRandomDays(sessions, allDates);
    assignedDates.push(...randomPrioritizedDays);
  }

  return assignedDates;
}

// Helper function to get all days of the week
function getAllDaysInWeek(startDate: string): string[] {
  const start = new Date(startDate);
  const allDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    allDays.push(currentDate.toISOString().split("T")[0]);
  }
  return allDays;
}

// Helper function to randomly select 'n' days from an array
function getRandomDays(n: number, daysArray: string[]): string[] {
  const selectedDays: string[] = [];
  const shuffledDays = [...daysArray];
  for (let i = shuffledDays.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDays[i], shuffledDays[j]] = [shuffledDays[j], shuffledDays[i]];
  }

  // Select the first 'n' shuffled days
  selectedDays.push(...shuffledDays.slice(0, n));
  return selectedDays;
}
