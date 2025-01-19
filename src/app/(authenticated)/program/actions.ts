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
import { ActionResponse, ProgramResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { getConfigurationQuery, getCurrentProgramQuery } from "@/db/queries";
import * as Sentry from "@sentry/nextjs";
import { getPrompt } from "@/lib/prompt";

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
    message: "Your new program is ready!",
  };
}
