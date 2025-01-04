import { db } from "@/db/db";
import { program } from "@/db/schema";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { ProgramMetadataResponse } from "@/types/types";
import { and, eq } from "drizzle-orm";

export async function getPrograms(): Promise<ProgramMetadataResponse[]> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  const result = await db
    .select({
      id: program.id,
      startDate: program.start_date,
      endDate: program.end_date,
    })
    .from(program)
    .where(and(eq(program.user_id, user.id), eq(program.archived, false)));

  return result as ProgramMetadataResponse[];
}
