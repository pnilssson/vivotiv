import { configurationRequestSchema, programSchema } from "@/lib/zod/schema";
import { db } from "./db";
import {
  configuration,
  configurationToEnvironment,
  configurationToPreferredDay,
  configurationToWorkoutFocus,
  configurationToWorkoutType,
  profile,
  program,
  programMetadata,
} from "./schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getProfileByIdQuery } from "./queries";
import { Workout } from "@/types/types";

export async function handleProgramInserts(
  newProgram: z.infer<typeof programSchema>,
  userId: string,
  prompt: string,
  promptTokens: number,
  completionTokens: number
) {
  await db.transaction(async (trx) => {
    // Insert program
    const [result] = await trx
      .insert(program)
      .values({
        user_id: userId,
        start_date: newProgram.start_date,
        end_date: newProgram.end_date,
        workouts: newProgram.workouts,
        version: 1,
      })
      .returning({ id: program.id });

    // Insert program metadata
    await trx.insert(programMetadata).values({
      user_id: userId,
      prompt: prompt,
      program_id: result.id,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
    });

    // Remove used token
    const currentProfile = await getProfileByIdQuery(userId);
    await trx
      .update(profile)
      .set({
        program_tokens: currentProfile.program_tokens - 1,
      })
      .where(eq(profile.id, userId));
  });
}

export async function updateProfileProgramTokensCommand(
  userId: string,
  currentTokens: number,
  newTokens: number
) {
  const [result] = await db
    .update(profile)
    .set({
      program_tokens: currentTokens + newTokens,
    })
    .where(eq(profile.id, userId))
    .returning({ id: profile.id });

  return result.id;
}

export async function updateProfileNameCommand(userId: string, name: string) {
  const [result] = await db
    .update(profile)
    .set({
      name,
    })
    .where(eq(profile.id, userId))
    .returning({ id: profile.id });

  return result.id;
}

export async function updateProfileStripeCustomerIdCommand(
  userId: string,
  customerId: string
) {
  const [result] = await db
    .update(profile)
    .set({
      stripe_customer_id: customerId,
    })
    .where(eq(profile.id, userId))
    .returning({ id: profile.id });

  return result.id;
}

export async function insertOrUpdateConfigurationCommand(
  newConfiguration: z.infer<typeof configurationRequestSchema>,
  userId: string
) {
  await db.transaction(async (trx) => {
    let configurationId = newConfiguration.id;
    // If no configurationId, insert a new configuration
    if (!configurationId) {
      const newConfig = await trx
        .insert(configuration)
        .values({
          user_id: userId,
          sessions: newConfiguration.sessions,
          time: newConfiguration.time,
          equipment: newConfiguration.equipment,
          generate_automatically: newConfiguration.generate_automatically,
        })
        .returning({ id: configuration.id });

      configurationId = newConfig[0].id;
    }

    // If configurationId exists, update the configuration
    if (configurationId) {
      const updatedConfig = await trx
        .update(configuration)
        .set({
          user_id: userId,
          sessions: newConfiguration.sessions,
          time: newConfiguration.time,
          equipment: newConfiguration.equipment,
          generate_automatically: newConfiguration.generate_automatically,
        })
        .where(eq(configuration.id, configurationId))
        .returning({ id: configuration.id });

      configurationId = updatedConfig[0].id;
    }

    // Update many-to-many relationships
    const { workout_focuses, workout_types, environments, preferred_days } =
      newConfiguration;

    // Handle workoutFocuses
    await trx
      .delete(configurationToWorkoutFocus)
      .where(eq(configurationToWorkoutFocus.configuration_id, configurationId));

    if (workout_focuses && workout_focuses?.length > 0) {
      await trx.insert(configurationToWorkoutFocus).values(
        workout_focuses.map((id) => ({
          configuration_id: configurationId,
          workout_focus_id: id,
        }))
      );
    }

    // Handle workoutTypes
    await trx
      .delete(configurationToWorkoutType)
      .where(eq(configurationToWorkoutType.configuration_id, configurationId));

    if (workout_types && workout_types?.length > 0) {
      await trx.insert(configurationToWorkoutType).values(
        workout_types.map((id) => ({
          configuration_id: configurationId,
          workout_type_id: id,
        }))
      );
    }

    // Handle environments
    await trx
      .delete(configurationToEnvironment)
      .where(eq(configurationToEnvironment.configuration_id, configurationId));

    if (environments && environments?.length > 0) {
      await trx.insert(configurationToEnvironment).values(
        environments.map((id) => ({
          configuration_id: configurationId,
          environment_id: id,
        }))
      );
    }

    // Handle preferredDays
    await trx
      .delete(configurationToPreferredDay)
      .where(eq(configurationToPreferredDay.configuration_id, configurationId));

    if (preferred_days && preferred_days?.length > 0) {
      await trx.insert(configurationToPreferredDay).values(
        preferred_days.map((id) => ({
          configuration_id: configurationId,
          preferred_day_id: id,
        }))
      );
    }
  });
}

export async function archiveProgramCommand(programId: string, userId: string) {
  await db
    .update(program)
    .set({
      archived: true,
    })
    .where(and(eq(program.id, programId), eq(program.user_id, userId)));
}

export async function updateProgramWorkoutsCommand(
  programId: string,
  userId: string,
  workouts: Workout[]
) {
  await db
    .update(program)
    .set({
      workouts: workouts,
    })
    .where(and(eq(program.id, programId), eq(program.user_id, userId)));
}
