"use server";

import { createClient } from "@/lib/supabase/server";
import { getURL } from "@/lib/utils";
import { ActionResponse } from "@/types/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { z } from "zod";
import { setPreferredSignInView } from "../server-utils";
import * as Sentry from "@sentry/nextjs";

export async function signOut(_: FormData) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}

const otpSchema = z.object({
  email: z.string().email({
    message: "Provided email is invalid.",
  }),
});

export async function signInWithOtp(
  _: any,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const validated = otpSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return {
      success: validated.success,
      errors: validated.error.issues,
      message: null,
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: validated.data.email,
    options: {
      emailRedirectTo: getURL(),
    },
  });

  if (error) {
    Sentry.captureException(error);
    redirect("/error");
  }

  await setPreferredSignInView("otp");

  revalidatePath("/", "layout");
  redirect("/auth/verify-request");
}

const passwordSchema = z.object({
  email: z.string().email({
    message: "Provided email is invalid.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long.",
  }),
});

export async function signInWithPassword(
  _: any,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const validated = passwordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      success: validated.success,
      errors: validated.error.issues,
      message: null,
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    Sentry.captureException(error);
    redirect("/error");
  }

  await setPreferredSignInView("password");

  revalidatePath("/", "layout");
  redirect("/program");
}

export async function signUpWithPassword(
  _: any,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const validated = passwordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      success: validated.success,
      errors: validated.error.issues,
      message: null,
    };
  }

  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    Sentry.captureException(error);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/auth/verify-request");
}
