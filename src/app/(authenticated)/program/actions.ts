"use server";

import {
  archiveProgramCommand,
  completeWorkoutCommand,
  deleteOldProgramsByUserIdCommand,
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
import {
  getConfigurationQuery,
  getCurrentProgramQuery,
  getCurrentGeneratedProgramsCountByUserIdQuery,
} from "@/db/queries";
import * as Sentry from "@sentry/nextjs";
import { getPrompt } from "@/lib/prompt";
import { log } from "next-axiom";
import { PROGRAM_GENERATION_LIMIT } from "@/lib/constants";

export async function getCurrentProgram(): Promise<ProgramResponse | null> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  return await getCurrentProgramQuery(user.id);
}

export async function archiveProgram(programId: string) {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  log.info("User archived program.", {
    userId: user.id,
    email: user.email,
    programId,
  });
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

export async function getCurrentGeneratedProgramsCount() {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  await getUserOrRedirect(supabase);
  return await getCurrentGeneratedProgramsCountByUserIdQuery(user.id);
}

export async function generateProgram(): Promise<ActionResponse> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  const currentGeneratedProgramsCount =
    await getCurrentGeneratedProgramsCount();
  if (currentGeneratedProgramsCount >= PROGRAM_GENERATION_LIMIT) {
    Sentry.captureMessage(
      "User reached max number of program generations during the last 7 days and should not have been able to generate a new program.",
      { user: { id: user.id, email: user.email }, level: "error" }
    );
    return {
      success: false,
      errors: [],
      message:
        "You have reached your weekly limit of five program generations.",
    };
  }

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

    const programId = await handleProgramInserts(
      program,
      user.id,
      prompt,
      usage.promptTokens,
      usage.completionTokens
    );
    log.info("User generated a new program.", {
      userId: user.id,
      email: user.email,
      programId,
    });
  } catch (error) {
    Sentry.captureException(error, {
      user: { id: user.id, email: user.email },
      extra: { prompt },
    });
    throw new Error("Error when generating a program.");
  }

  await deleteOldProgramsByUserIdCommand(user.id);
  revalidatePath("/program", "page");
  return {
    success: true,
    errors: [],
    message: "Your new program is ready!",
  };
}
