import { programSchema } from "@/lib/zod/schemas";
import { db } from "./db"; // Make sure to import your database connection
import {
  programs,
} from "./schema";
import { z } from "zod";

export async function insertProgram(
  programObject: z.infer<typeof programSchema>,
  prompt: string,
  userId: string
) {
  await db.insert(programs).values({
    userId,
    startDate: programObject.startDate,
    endDate: programObject.endDate,
    prompt,
    program: JSON.stringify(programObject, null),
    version: 1,
  });
}
