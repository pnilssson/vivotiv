import { programSchema } from "@/lib/zod/schemas";
import { db } from "./db"; // Make sure to import your database connection
import {
  program,
  workout,
  warmUp,
  warmUpExercise,
  workoutExercise,
  generated,
} from "./schema";
import { z } from "zod";

// Function to insert the program object into the database
export async function insertProgram(
  programObject: z.infer<typeof programSchema>,
  userId: string
) {
  await db.transaction(async (trx) => {
    // Insert the Program
    const [programRecord] = await trx
      .insert(program)
      .values({
        startDate: programObject.startDate,
        endDate: programObject.endDate,
        userId: userId,
      })
      .returning({ id: program.id });

    const programId = programRecord.id;

    // Insert the Workouts
    for (const workoutObject of programObject.workouts) {
      const [workoutRecord] = await trx
        .insert(workout)
        .values({
          date: workoutObject.date,
          completed: workoutObject.completed,
          description: workoutObject.description,
          programId: programId,
        })
        .returning({ id: workout.id });

      const workoutId = workoutRecord.id;

      // Insert the WarmUp for each Workout
      const warmUpObject = workoutObject.warmup;
      const [warmUpRecord] = await trx
        .insert(warmUp)
        .values({
          description: warmUpObject.description,
          workoutId: workoutId,
        })
        .returning({ id: warmUp.id });

      const warmUpId = warmUpRecord.id;

      // Insert WarmUp Exercises
      for (const exerciseObject of warmUpObject.exercises) {
        await trx.insert(warmUpExercise).values({
          title: exerciseObject.title,
          description: exerciseObject.description,
          execution: exerciseObject.execution,
          warmUpId: warmUpId,
        });
      }

      // Insert Workout Exercises
      for (const exerciseObject of workoutObject.exercises) {
        await trx.insert(workoutExercise).values({
          title: exerciseObject.title,
          description: exerciseObject.description,
          execution: exerciseObject.execution,
          workoutId: workoutId,
        });
      }
    }
  });
}

// Define the function to insert the generated_program
export async function insertGenerated(
  prompt: string,
  chatgpt: any,
  gemini: any,
  userId: string
) {
  await db.insert(generated).values({
    prompt,
    chatgpt,
    gemini,
    userId,
  });
}
