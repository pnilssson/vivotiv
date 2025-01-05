import { configurationRequestSchema, programSchema } from "@/lib/zod/schema";
import { db } from "./db";
import {
  configuration,
  configurationToEnvironment,
  configurationToWorkoutFocus,
  configurationToWorkoutType,
  profile,
  program,
  programMetadata,
} from "./schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

export async function insertProgramCommand(
  programObject: z.infer<typeof programSchema>,
  userId: string
) {
  const [result] = await db
    .insert(program)
    .values({
      user_id: userId,
      start_date: programObject.startDate,
      end_date: programObject.endDate,
      workouts: programObject.workouts,
      version: 1,
    })
    .returning({ id: program.id });

  return result.id;
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
  configurationObject: z.infer<typeof configurationRequestSchema>,
  userId: string
) {
  await db.transaction(async (trx) => {
    let configurationId = configurationObject.id;
    // If no configurationId, insert a new configuration
    if (!configurationId) {
      const newConfig = await trx
        .insert(configuration)
        .values({
          user_id: userId,
          sessions: configurationObject.sessions,
          time: configurationObject.time,
          equipment: configurationObject.equipment,
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
          sessions: configurationObject.sessions,
          time: configurationObject.time,
          equipment: configurationObject.equipment,
        })
        .where(eq(configuration.id, configurationId))
        .returning({ id: configuration.id });

      configurationId = updatedConfig[0].id;
    }

    // Update many-to-many relationships
    const { workoutFocuses, workoutTypes, environments } = configurationObject;

    // Handle workoutFocuses
    await trx
      .delete(configurationToWorkoutFocus)
      .where(eq(configurationToWorkoutFocus.configuration_id, configurationId));

    if (workoutFocuses && workoutFocuses?.length > 0) {
      await trx.insert(configurationToWorkoutFocus).values(
        workoutFocuses.map((id) => ({
          configuration_id: configurationId,
          workout_focus_id: id,
        }))
      );
    }

    // Handle workoutTypes
    await trx
      .delete(configurationToWorkoutType)
      .where(eq(configurationToWorkoutType.configuration_id, configurationId));

    if (workoutTypes && workoutTypes?.length > 0) {
      await trx.insert(configurationToWorkoutType).values(
        workoutTypes.map((id) => ({
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

export async function insertProgramMetadataCommand(
  userId: string,
  prompt: string,
  programId: string
) {
  await db.insert(programMetadata).values({
    user_id: userId,
    prompt: prompt,
    program_id: programId,
  });
}
