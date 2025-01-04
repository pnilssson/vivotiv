"use server";

import { SupabaseClient, User } from "@supabase/supabase-js";
import { log } from "next-axiom";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function setPreferredSignInView(preferredSignInView: string) {
  const cookieStore = await cookies();
  cookieStore.set("preferredSignInView", preferredSignInView);
}

export async function getPreferredSignInView(): Promise<string> {
  const cookieStore = await cookies();
  const preferredSignInView =
    cookieStore.get("preferredSignInView")?.value || null;
  const defaultView = preferredSignInView ?? "otp";
  return defaultView;
}

export async function getUserOrRedirect(
  supabase: SupabaseClient
): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    log.error("Error during getUserOrRedirect", { error });
    redirect("/auth/signin");
  }

  return user;
}
