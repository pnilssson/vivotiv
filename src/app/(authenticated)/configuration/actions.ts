"use server";

import { insertOrUpdateConfigurationCommand } from "@/db/commands";
import {
  getExperiencesQuery,
  getPreferredDaysQuery,
  getWorkoutTypesQuery,
} from "@/db/queries";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { configurationRequestSchema } from "@/lib/zod/schema";
import {
  ActionResponse,
  WorkoutTypeResponse,
  PreferredDayResponse,
  ExperienceResponse,
} from "@/lib/types";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";

export async function getWorkoutTypes(): Promise<WorkoutTypeResponse[]> {
  return await getWorkoutTypesQuery();
}

export async function getPreferredDays(): Promise<PreferredDayResponse[]> {
  return await getPreferredDaysQuery();
}

export async function getExperiences(): Promise<ExperienceResponse[]> {
  return await getExperiencesQuery();
}

export async function setConfiguration(
  _: any,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  const validated = configurationRequestSchema.safeParse(formData);
  if (!validated.success) {
    const equipmentString = formData.get("equipment")?.toString();
    if (equipmentString && equipmentString.length > 1000) {
      Sentry.captureMessage(
        "User tried to add equipment list with over 1000 characters.",
        {
          user: { id: user.id, email: user.email },
          extra: { equipment: equipmentString },
          level: "warning",
        }
      );
    }
    return {
      success: validated.success,
      errors: validated.error.issues,
      message: null,
    };
  }

  try {
    await insertOrUpdateConfigurationCommand(validated.data, user.id);
  } catch (error) {
    Sentry.captureException(error);
    return {
      success: false,
      errors: [],
      message: "An error occurred when saving the configuration.",
    };
  }

  revalidatePath("/");
  return {
    success: true,
    errors: [],
    message: "Configuration successfully updated.",
  };
}
