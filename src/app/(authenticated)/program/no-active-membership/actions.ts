import { getProfileByIdQuery } from "@/db/queries";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";

export async function getMemberShipEndDate(): Promise<Date> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  var result = await getProfileByIdQuery(user.id);
  return new Date(result.membership_end_date);
}
