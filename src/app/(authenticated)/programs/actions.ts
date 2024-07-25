import { db } from "@/db/db";
import { programs } from "@/db/schema";
import { createClient, getUserOrRedirect } from "@/lib/supabase/server";
import { ProgramMetadataResponse } from "@/types/types";
import { and, eq } from "drizzle-orm";

export async function getPrograms(): Promise<ProgramMetadataResponse[]> {
  const supabase = createClient();
  const user = await getUserOrRedirect(supabase);

  const result = await db
    .select({
      id: programs.id,
      startDate: programs.startDate,
      endDate: programs.endDate,
    })
    .from(programs)
    .where(and(eq(programs.userId, user.id), eq(programs.archived, false)));

  return result as ProgramMetadataResponse[];
}
