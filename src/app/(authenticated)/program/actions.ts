"use server";

import { archiveProgramCommand, handleProgramInserts } from "@/db/commands";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { programSchema } from "@/lib/zod/schema";
import {
  ActionResponse,
  ConfigurationResponse,
  ProgramResponse,
} from "@/types/types";
import { revalidatePath } from "next/cache";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { getConfigurationQuery, getCurrentProgramQuery } from "@/db/queries";
import { log } from "next-axiom";
import { redirect } from "next/navigation";

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
  redirect("/program");
}

export async function generateProgram(): Promise<ActionResponse> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  const configuration = await getConfigurationQuery(user.id);

  if (!configuration) {
    log.error("No configuration was found for user when generating program.", {
      userId: user.id,
    });
    return {
      success: false,
      errors: [],
      message: "No configuration found.",
    };
  }
  const prompt = getPrompt(configuration);

  try {
    const { object: program, usage } = await generateObject({
      model: openai("gpt-4o"),
      mode: "json",
      schemaName: "home-training",
      schemaDescription: "One week of home training.",
      schema: programSchema,
      prompt,
      temperature: 1.1,
    });

    await handleProgramInserts(
      program,
      user.id,
      prompt,
      usage.promptTokens,
      usage.completionTokens
    );
  } catch (error) {
    log.error("Error when generating a program.", { error });
    throw new Error("Error when generating a program.");
  }

  revalidatePath("/program", "page");
  return {
    success: true,
    errors: [],
    message: "A new program is ready for you!",
  };
}

function getPrompt(data: ConfigurationResponse): string {
  const {
    sessions,
    time,
    workout_focuses,
    workout_types,
    environments,
    equipment,
    preferred_days,
  } = data;

  const today = new Date();
  const { exercises, warmupExercises } = getExercises(time);
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

  const prioritizeText =
    workout_focuses.length > 0
      ? `The program should include strength, conditioning and mobility exercises but prioritize ${workout_focuses
          .map((a) => a.name)
          .join(", ")}`
      : "The program should include strength, conditioning and mobility exercises.";

  const typesText =
    workout_types.length > 0
      ? `${workout_types
          .map((a) => a.name)
          .join(" and ")} must be included in at least one session.`
      : "";

  const environmentText =
    environments.length > 0
      ? `${environments
          .map((a) => a.name)
          .join(
            " and "
          )} is available and can be considered when creating the exercises.`
      : "";

  const equipmentText =
    equipment.length > 0
      ? `The available equipment includes ${equipment}.`
      : "No additional equipment is available.";

  return `You are tasked with generating a one-week home-training program that aligns with the following requirements:

1. **Program Details**:
   - Start date: ${formattedStartDate}
   - End date: ${formattedEndDate}
   - Sessions: ${sessions}
   - ${workoutDatesText}

2. **Workout Structure**:
   - Each workout should contain:
     - ${exercises} main exercises. 
     - ${warmupExercises} warm-up exercises, relevant to the session's focus.
   - ${prioritizeText}
   - ${typesText}

3. **Available Equipment and Space**:
   - ${equipmentText}
   - ${environmentText}

4. **Exercise Execution**:
   - Vary execution types across sessions:
     - Reps and sets (e.g., 3 sets of 10 reps).
     - AMRAP (as many reps as possible within a time frame).
     - EMOM (every minute on the minute).
   - Always include rest periods in the execution of exercises.

5. **Exercise Descriptions**:
   - Provide clear, user-friendly descriptions of how to perform each exercise.`;
}

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

function getExercises(time: number) {
  let exercises = "0";
  let warmupExercises = "0";

  if (time <= 20) {
    exercises = "3-4";
    warmupExercises = "1-2";
  } else if (time > 20 && time <= 40) {
    exercises = "5-6";
    warmupExercises = "2-3";
  } else if (time > 40) {
    // Adjusted to handle scenarios > 40 correctly
    exercises = "6-8";
    warmupExercises = "2-4";
  }

  return { exercises, warmupExercises };
}
