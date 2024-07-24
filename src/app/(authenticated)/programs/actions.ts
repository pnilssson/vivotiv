import { db } from "@/db/db";
import { createClient, getUserOrRedirect } from "@/lib/supabase/server";
import { Program } from "@/types/types";

export async function getPrograms(): Promise<Program[]> {
  const supabase = createClient();
  const user = await getUserOrRedirect(supabase);

  const result = await db.query.program.findMany({
    where: (program, { eq }) => eq(program.userId, user.id),
  });
  console.log(result);

  return result as unknown as Program[];
}

export async function getProgram(id: string): Promise<Program> {
  const supabase = createClient();
  const user = await getUserOrRedirect(supabase);

  const result = await db.query.program.findMany({
    where: (program, { eq, and }) =>
      and(eq(program.userId, user.id), eq(program.id, id)),
    with: {
      workouts: {
        with: {
          warmup: {
            with: {
              exercises: true,
            },
          },
          exercises: true,
        },
      },
    },
  });
  console.log(result);

  return result[0] as unknown as Program;
}
