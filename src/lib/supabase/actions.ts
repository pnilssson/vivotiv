"use server";

import { createClient } from "./server";
import { redirect } from "next/navigation";

export async function signOut(_: FormData) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}
