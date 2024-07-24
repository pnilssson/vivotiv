import { db } from "@/db/db";
import { programs } from "@/db/schema";
import { createClient, getUserOrRedirect } from "@/lib/supabase/server";
import { ProgramResponse, ProgramMetadataResponse } from "@/types/types";
import { eq } from "drizzle-orm";

export async function getPrograms(): Promise<ProgramMetadataResponse[]> {
  const supabase = createClient();
  const user = await getUserOrRedirect(supabase);

  const result = await db.select({
    id: programs.id,
    startDate: programs.startDate,
    endDate: programs.endDate,
  }).from(programs).where(eq(programs.userId, user.id));

  console.log(result);

  return result as ProgramMetadataResponse[];
}

export async function getProgram(id: string): Promise<ProgramResponse> {
  const supabase = createClient();
  const user = await getUserOrRedirect(supabase);

  const result = await db.query.programs.findMany({
    where: (program, { eq, and }) =>
      and(eq(program.userId, user.id), eq(program.id, id)),
  });
  console.log(result);

  return result[0] as unknown as ProgramResponse;
}
