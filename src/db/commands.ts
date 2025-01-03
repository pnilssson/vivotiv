import { programSchema } from "@/lib/zod/schemas";
import { db } from "./db"; // Make sure to import your database connection
import { program, programMetadata } from "./schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

export async function insertProgramCommand(
  programObject: z.infer<typeof programSchema>,
  userId: string
) {
  const result = await db
    .insert(program)
    .values({
      user_id: userId,
      start_date: programObject.startDate,
      end_date: programObject.endDate,
      workouts: programObject.workouts,
      version: 1,
    })
    .returning({ id: program.id });

  return result[0].id;
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
