"use server";

import { archiveProgram } from "@/db/commands";
import { db } from "@/db/db";
import { createClient, getUserOrRedirect } from "@/lib/supabase/server";
import { ProgramResponse } from "@/types/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getProgram(id: string): Promise<ProgramResponse> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  const result = await db.query.program.findMany({
    where: (program, { eq, and }) =>
      and(
        eq(program.user_id, user.id),
        eq(program.id, id),
        eq(program.archived, false)
      ),
  });

  return result[0] as unknown as ProgramResponse;
}

export async function archiveProgramAction(data: FormData) {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  const programId = data.get("programId") as string;
  await archiveProgram(programId, user.id);

  revalidatePath("/programs", "page");
  redirect("/programs");
}
