import { getActiveProgramExistQuery } from "@/db/queries";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function validateActiveProgramExist(): Promise<void> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  const activeProgramExists = await getActiveProgramExistQuery(user.id);
  if (activeProgramExists) redirect("/program");
}
