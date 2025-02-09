import { getConfigurationExistQuery } from "@/db/queries";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function validateConfigurationExist(): Promise<void> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  const result = await getConfigurationExistQuery(user.id);
  if (result) redirect("/program");
}
