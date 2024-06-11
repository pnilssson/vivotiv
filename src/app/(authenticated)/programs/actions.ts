import { db } from "@/db/db";
import { createClient, getUserOrRedirect } from "@/lib/supabase/server";
import { Program } from "@/types/types";

export async function getPrograms(): Promise<Program[]> {
  const supabase = createClient();
  const user = await getUserOrRedirect(supabase);

  const result = await db.query.program.findMany({
    where: (program, { eq }) => eq(program.userId, user.id),
    with: {
      workouts: true,
    },
  });
  console.log(result);

  return result as unknown as Program[];
}
