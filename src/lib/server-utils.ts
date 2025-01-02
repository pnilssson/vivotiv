"use server";

import { cookies } from "next/headers";

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
