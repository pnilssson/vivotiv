import { getGeneratingQuery } from "@/db/queries";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function validateGenerating(): Promise<void> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  const isGenerating = await getGeneratingQuery(user.id);
  if (!isGenerating) redirect("/program");
}
