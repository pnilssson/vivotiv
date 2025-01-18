"use server";

import { SupabaseClient, User } from "@supabase/supabase-js";
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
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth/signin");
  }

  return data.user;
}
