import { db } from "@/db/db";
import { createClient, getUserOrRedirect } from "@/lib/supabase/server";
import { ProgramResponse } from "@/types/types";

export async function getPrograms(): Promise<ProgramResponse[]> {
  const supabase = createClient();
  const user = await getUserOrRedirect(supabase);

  const result = await db.query.programs.findMany({
    where: (programs, { eq }) => eq(programs.userId, user.id)
  });
  console.log(result);

  return result as unknown as ProgramResponse[];
}
