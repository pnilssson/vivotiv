"use server";

import { getConfigurationQuery } from "@/db/queries";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { ConfigurationResponse } from "@/types/types";

export async function getConfiguration(): Promise<ConfigurationResponse | null> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  return await getConfigurationQuery(user.id);
}
