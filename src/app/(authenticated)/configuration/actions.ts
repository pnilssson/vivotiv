"use server";

import { getConfigurationQuery } from "@/db/queries";
import { createClient, getUserOrRedirect } from "@/lib/supabase/server";
import { ConfigurationResponse } from "@/types/types";

export async function getConfiguration(): Promise<ConfigurationResponse> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  const result = await getConfigurationQuery(user.id);
  return result;
}
