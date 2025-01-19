"use server";

import { configurationRequestSchema, programSchema } from "@/lib/zod/schema";
import { db } from "./db";
import {
  configuration,
  configurationToPreferredDay,
  configurationToWorkoutType,
  feedback,
  profile,
  program,
  programMetadata,
  warmup,
  warmupExercise,
  workout,
  workoutExercise,
} from "./schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { ProfileResponse } from "@/lib/types";
import { shortDate } from "@/lib/utils";
import { addDays, isBefore } from "date-fns";
import * as Sentry from "@sentry/nextjs";

export async function handleProgramInserts(
  newProgram: z.infer<typeof programSchema>,
  userId: string,
  prompt: string,
  promptTokens: number,
  completionTokens: number
) {
  let programId = "";
  await db.transaction(async (trx) => {
    // Insert program
    const [programResult] = await trx
      .insert(program)
      .values({
        user_id: userId,
        start_date: newProgram.start_date,
        end_date: newProgram.end_date,
      })
      .returning({ id: program.id });

    programId = programResult.id;

    // Insert program metadata
    await trx.insert(programMetadata).values({
      prompt: prompt,
      program_id: programId,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
    });

    // Insert workouts
    for (const workoutData of newProgram.workouts) {
      const [workoutResult] = await trx
        .insert(workout)
        .values({
          date: workoutData.date,
          completed: workoutData.completed,
          description: workoutData.description,
          program_id: programId,
        })
        .returning({ id: workout.id });

      const workoutId = workoutResult.id;

      // Insert warmup
      if (workoutData.warmup) {
        const [warmupResult] = await trx
          .insert(warmup)
          .values({
            description: workoutData.warmup.description,
            workout_id: workoutId,
          })
          .returning({ id: warmup.id });

        const warmupId = warmupResult.id;

        // Insert warmup exercises
        if (workoutData.warmup.exercises) {
          for (const exerciseData of workoutData.warmup.exercises) {
            await trx.insert(warmupExercise).values({
              title: exerciseData.title,
              description: exerciseData.description,
              execution: exerciseData.execution,
              warmup_id: warmupId,
            });
          }
        }
      }

      // Insert workout exercises
      if (workoutData.exercises) {
        for (const exerciseData of workoutData.exercises) {
          await trx.insert(workoutExercise).values({
            title: exerciseData.title,
            description: exerciseData.description,
            execution: exerciseData.execution,
            workout_id: workoutId,
          });
        }
      }
    }
  });
  return programId;
}

export async function updateProfileMembershipCommand(
  userProfile: ProfileResponse,
  days: number
) {
  const today = new Date();
  const membershipEndDate = new Date(userProfile.membership_end_date);

  const dateToAddNewDaysTo = isBefore(membershipEndDate, today)
    ? today
    : membershipEndDate;

  // Add one extra day to prevent time zone issues.
  const updatedMembershipEndDate = addDays(dateToAddNewDaysTo, days + 1);

  const [result] = await db
    .update(profile)
    .set({
      membership_end_date: shortDate(updatedMembershipEndDate),
    })
    .where(eq(profile.id, userProfile.id))
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
  configurationId: string | null,
  userId: string
) {
  await db.transaction(async (trx) => {
    const isNewConfiguration = configurationId == null;
    // If no configurationId, insert a new configuration
    if (isNewConfiguration) {
      const newConfig = await trx
        .insert(configuration)
        .values({
          user_id: userId,
          sessions: newConfiguration.sessions,
          time: newConfiguration.time,
          equipment: newConfiguration.equipment,
          experience_id: newConfiguration.experience_id,
          generate_automatically: newConfiguration.generate_automatically,
        })
        .returning({ id: configuration.id });

      configurationId = newConfig[0].id;
    }

    // If configurationId exists, update the configuration
    if (!isNewConfiguration && configurationId) {
      const updatedConfig = await trx
        .update(configuration)
        .set({
          user_id: userId,
          sessions: newConfiguration.sessions,
          time: newConfiguration.time,
          equipment: newConfiguration.equipment,
          experience_id: newConfiguration.experience_id,
          generate_automatically: newConfiguration.generate_automatically,
        })
        .where(eq(configuration.id, configurationId))
        .returning({ id: configuration.id });

      configurationId = updatedConfig[0].id;
    }

    if (configurationId) {
      // Update many-to-many relationships
      const { workout_types, preferred_days } = newConfiguration;

      // Handle workoutTypes
      await trx
        .delete(configurationToWorkoutType)
        .where(
          eq(configurationToWorkoutType.configuration_id, configurationId)
        );

      if (workout_types && workout_types?.length > 0) {
        await trx.insert(configurationToWorkoutType).values(
          workout_types.map((id) => ({
            configuration_id: configurationId!,
            workout_type_id: id,
          }))
        );
      }

      // Handle preferredDays
      await trx
        .delete(configurationToPreferredDay)
        .where(
          eq(configurationToPreferredDay.configuration_id, configurationId)
        );

      if (preferred_days && preferred_days?.length > 0) {
        await trx.insert(configurationToPreferredDay).values(
          preferred_days.map((id) => ({
            configuration_id: configurationId!,
            preferred_day_id: id,
          }))
        );
      }
    }
    if (!configurationId) {
      Sentry.captureMessage(
        "Configuration id was missing when trying to insert or update configuration. This should not be possible.",
        {
          extra: { newConfiguration, userId },
          level: "warning",
        }
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

export async function completeWorkoutCommand(workoutId: string) {
  await db
    .update(workout)
    .set({
      completed: true,
    })
    .where(and(eq(workout.id, workoutId)));
}

export async function uncompleteWorkoutCommand(workoutId: string) {
  await db
    .update(workout)
    .set({
      completed: false,
    })
    .where(and(eq(workout.id, workoutId)));
}

export async function insertFeedbackCommand(
  userId: string,
  feedbackText: string
) {
  await db.insert(feedback).values({
    user_id: userId,
    feedback: feedbackText,
  });
}
