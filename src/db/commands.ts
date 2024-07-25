import { programSchema } from "@/lib/zod/schemas";
import { db } from "./db"; // Make sure to import your database connection
import { programs, programs_metadata } from "./schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

export async function insertProgram(
  programObject: z.infer<typeof programSchema>,
  userId: string
) {
  const result = await db
    .insert(programs)
    .values({
      userId,
      startDate: programObject.startDate,
      endDate: programObject.endDate,
      workouts: programObject.workouts,
      version: 1,
    })
    .returning({ id: programs.id });

  return result[0].id;
}

export async function archiveProgram(programId: string, userId: string) {
  await db
    .update(programs)
    .set({
      archived: true,
    })
    .where(and(eq(programs.id, programId), eq(programs.userId, userId)));
}

export async function insertProgramMetadata(
  userId: string,
  prompt: string,
  programId: string
) {
  await db.insert(programs_metadata).values({
    userId: userId,
    prompt: prompt,
    programId: programId,
  });
}
