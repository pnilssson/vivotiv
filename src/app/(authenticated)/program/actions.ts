"use server";

import {
  archiveProgramCommand,
  completeWorkoutCommand,
  uncompleteWorkoutCommand,
  updateProfileGeneratingCommand,
} from "@/db/commands";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { ActionResponse, ProgramResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";
import {
  getConfigurationQuery,
  getCurrentProgramQuery,
  getCurrentGeneratedProgramsQuery,
  getConfigurationExistQuery,
  getProfileByIdQuery,
  getActiveProgramExistQuery,
  getGeneratingQuery,
} from "@/db/queries";
import * as Sentry from "@sentry/nextjs";
import { log } from "next-axiom";
import { PROGRAM_GENERATION_LIMIT } from "@/lib/constants";
import { redirect } from "next/navigation";
import { shortDate } from "@/lib/utils";
import { inngest } from "@/lib/inngest/client";

export async function validateConfigurationExist(): Promise<void> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  const result = await getConfigurationExistQuery(user.id);
  if (!result) redirect("/program/configuration-missing");
}

export async function validateMembership(): Promise<void> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  const result = await getProfileByIdQuery(user.id);
  if (shortDate(new Date(result.membership_end_date)) >= shortDate()) return;
  redirect("/program/no-active-membership");
}

export async function validateGenerating(): Promise<void> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  const result = await getGeneratingQuery(user.id);
  if (result) redirect("/program/generating-program");
}

export async function getCurrentProgram(): Promise<ProgramResponse | null> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  const result = await getCurrentProgramQuery(user.id);
  if (!result) redirect("/program/no-active-program");
  return result;
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

export async function completeWorkout(
  workoutId: string
): Promise<ActionResponse> {
  const supabase = await createClient();
  await getUserOrRedirect(supabase);

  await completeWorkoutCommand(workoutId);
  revalidatePath("/program", "page");
  return {
    success: true,
    errors: [],
    message: null,
  };
}

export async function uncompleteWorkout(
  workoutId: string
): Promise<ActionResponse> {
  const supabase = await createClient();
  await getUserOrRedirect(supabase);

  await uncompleteWorkoutCommand(workoutId);
  revalidatePath("/program", "page");
  return {
    success: true,
    errors: [],
    message: null,
  };
}

export async function getCurrentGeneratedPrograms() {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  await getUserOrRedirect(supabase);
  return await getCurrentGeneratedProgramsQuery(user.id);
}

export async function generateProgram(): Promise<ActionResponse> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  const activeProgramExists = await getActiveProgramExistQuery(user.id);
  if (activeProgramExists) {
    return {
      success: false,
      errors: [],
      message:
        "An active program already exists. Archive the current active program if you want to generate a new one.",
    };
  }

  const currentGeneratedPrograms = await getCurrentGeneratedPrograms();
  if (currentGeneratedPrograms >= PROGRAM_GENERATION_LIMIT) {
    Sentry.captureMessage(
      "User reached max number of program generations during the last 7 days and should not have been able to generate a new program.",
      { user: { id: user.id, email: user.email }, level: "error" }
    );
    return {
      success: false,
      errors: [],
      message: `You have reached the weekly limit of ${PROGRAM_GENERATION_LIMIT} program generations.`,
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

  await inngest.send({
    name: "app/program.requested",
    data: {
      configuration,
    },
  });

  await updateProfileGeneratingCommand(user.id, true);

  revalidatePath("/program", "page");
  redirect("/program");
}
