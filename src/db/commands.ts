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
  warmupToWarmupExercise,
  workout,
  workoutExercise,
  workoutToWorkoutExercise,
} from "./schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getProfileByIdQuery } from "./queries";
import { WorkoutResponse } from "@/types/types";

export async function handleProgramInserts(
  newProgram: z.infer<typeof programSchema>,
  userId: string,
  prompt: string,
  promptTokens: number,
  completionTokens: number
) {
  await db.transaction(async (trx) => {
    // Insert program
    const [programResult] = await trx
      .insert(program)
      .values({
        user_id: userId,
        start_date: newProgram.start_date,
        end_date: newProgram.end_date,
        workouts: newProgram.workouts,
      })
      .returning({ id: program.id });

    const programId = programResult.id;

    // Insert program metadata
    await trx.insert(programMetadata).values({
      user_id: userId,
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

        // Insert warmup exercises and relations
        if (workoutData.warmup.exercises) {
          for (const exerciseData of workoutData.warmup.exercises) {
            const [exerciseResult] = await trx
              .insert(warmupExercise)
              .values({
                title: exerciseData.title,
                description: exerciseData.description,
                execution: exerciseData.execution,
              })
              .returning({ id: warmupExercise.id });

            await trx.insert(warmupToWarmupExercise).values({
              warmup_id: warmupId,
              exercise_id: exerciseResult.id,
            });
          }
        }
      }

      // Insert workout exercises and relations
      if (workoutData.exercises) {
        for (const exerciseData of workoutData.exercises) {
          const [exerciseResult] = await trx
            .insert(workoutExercise)
            .values({
              title: exerciseData.title,
              description: exerciseData.description,
              execution: exerciseData.execution,
            })
            .returning({ id: workoutExercise.id });

          await trx.insert(workoutToWorkoutExercise).values({
            workout_id: workoutId,
            exercise_id: exerciseResult.id,
          });
        }
      }
    }

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
    const { workout_types, preferred_days } = newConfiguration;

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
  workouts: WorkoutResponse[]
) {
  await db
    .update(program)
    .set({
      workouts: workouts,
    })
    .where(and(eq(program.id, programId), eq(program.user_id, userId)));
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
