import { getProfileByIdQuery } from "@/db/queries";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { shortDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export async function getMemberShipEndDate(): Promise<Date> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  var result = await getProfileByIdQuery(user.id);
  return new Date(result.membership_end_date);
}

export async function validateMembership(): Promise<void> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  const result = await getProfileByIdQuery(user.id);
  if (shortDate(new Date(result.membership_end_date)) <= shortDate()) return;
  redirect("/program");
}
