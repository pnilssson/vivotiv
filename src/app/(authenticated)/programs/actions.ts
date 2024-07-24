import { db } from "@/db/db";
import { createClient, getUserOrRedirect } from "@/lib/supabase/server";
import { ProgramResponse } from "@/types/types";

export async function getPrograms(): Promise<ProgramResponse[]> {
  const supabase = createClient();
  const user = await getUserOrRedirect(supabase);

  const result = await db.query.programs.findMany({
    where: (programs, { eq }) => eq(programs.userId, user.id),
  });
  console.log(result);

  return result as unknown as ProgramResponse[];
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
