"use server";

import { insertOrUpdateConfigurationCommand } from "@/db/commands";
import {
  getConfigurationIdByUserIdQuery,
  getConfigurationQuery,
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
  ConfigurationResponse,
} from "@/lib/types";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { log } from "next-axiom";

export async function getConfiguration(): Promise<ConfigurationResponse | null> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  return await getConfigurationQuery(user.id);
}

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
  let validated;
  try {
    validated = configurationRequestSchema.safeParse(formData);
    if (!validated.success) {
      const equipmentError = validated.error.errors.filter((e) =>
        e.path.includes("equipment")
      );
      if (equipmentError.length > 0) {
        Sentry.captureMessage("Equipment error during configuration update.", {
          user: { id: user.id, email: user.email },
          extra: { errors: validated.error.issues },
          level: "warning",
        });
      }
      return {
        success: validated.success,
        errors: validated.error.issues,
        message: null,
      };
    }
  } catch (error) {
    Sentry.captureException(error);
    return {
      success: false,
      errors: [],
      message: "An error occurred when validating the configuration.",
    };
  }

  try {
    const configurationId = await getConfigurationIdByUserIdQuery(user.id);
    if (configurationId) {
      log.info("Updating user configuration.", {
        userId: user.id,
        email: user.email,
        configurationId,
      });
    }
    if (!configurationId) {
      log.info("Adding new user configuration.", {
        userId: user.id,
        email: user.email,
      });
    }
    await insertOrUpdateConfigurationCommand(
      validated.data,
      configurationId,
      user.id
    );
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
