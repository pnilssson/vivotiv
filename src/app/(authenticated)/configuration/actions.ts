"use server";

import { insertOrUpdateConfigurationCommand } from "@/db/commands";
import {
  getConfigurationQuery,
  getEnvironmentsQuery,
  getWorkoutFocusQuery,
  getWorkoutTypesQuery,
} from "@/db/queries";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { configurationRequestSchema } from "@/lib/zod/schema";
import {
  ConfigurationResponse,
  Environment,
  FormResponse,
  WorkoutFocus,
  WorkoutType,
} from "@/types/types";
import { log } from "next-axiom";
import { revalidatePath } from "next/cache";

export async function getConfiguration(): Promise<ConfigurationResponse | null> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  return await getConfigurationQuery(user.id);
}

export async function getWorkoutFocus(): Promise<WorkoutFocus[]> {
  return await getWorkoutFocusQuery();
}

export async function getWorkoutTypes(): Promise<WorkoutType[]> {
  return await getWorkoutTypesQuery();
}

export async function getEnvironments(): Promise<Environment[]> {
  return await getEnvironmentsQuery();
}

export async function setConfiguration(
  _: any,
  formData: FormData
): Promise<FormResponse> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  const validated = configurationRequestSchema.safeParse(formData);
  if (!validated.success) {
    return {
      success: validated.success,
      errors: validated.error.issues,
      message: null,
    };
  }

  try {
    await insertOrUpdateConfigurationCommand(validated.data, user.id);
  } catch (error) {
    log.error("Error during setConfiguration.", error as any);
    return {
      success: false,
      errors: [],
      message: "An error occurred when saving the configuration.",
    };
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    errors: [],
    message: "Configuration successfully updated.",
  };
}
