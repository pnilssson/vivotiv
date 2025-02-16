"use server";

import { createClient } from "@/lib/supabase/server";
import { getURL } from "@/lib/utils";
import { ActionResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { z } from "zod";
import { setPreferredSignInView } from "../server-utils";
import * as Sentry from "@sentry/nextjs";
import { log } from "next-axiom";

export async function signOut(_: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    Sentry.captureException(error);
    redirect("/error");
  }

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

  revalidatePath("/");
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

  if (error?.code == "invalid_credentials") {
    redirect("/auth/signup");
  }

  if (error?.code == "email_not_confirmed") {
    redirect("/auth/email-not-confirmed");
  }

  if (error) {
    Sentry.captureException(error);
    redirect("/error");
  }

  await setPreferredSignInView("password");

  revalidatePath("/");
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

  log.info("New user signed up using password.", {
    email: validated.data.email,
  });
  log.flush();
  revalidatePath("/");
  redirect("/auth/verify-request");
}

const resetPasswordSchema = z.object({
  email: z.string().email({
    message: "Provided email is invalid.",
  }),
});

export async function resetPassword(
  _: any,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const validated = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return {
      success: validated.success,
      errors: validated.error.issues,
      message: null,
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(
    validated.data.email,
    { redirectTo: getURL() }
  );

  if (error) {
    Sentry.captureException(error);
    redirect("/error");
  }

  log.info("User requested reset of their password.", {
    email: validated.data.email,
  });
  log.flush();
  revalidatePath("/");
  redirect("/auth/verify-request");
}

const updatePasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long.",
  }),
});

export async function updatePassword(
  _: any,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const validated = updatePasswordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      success: validated.success,
      errors: validated.error.issues,
      message: null,
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  });

  if (error) {
    Sentry.captureException(error);
    redirect("/error");
  }

  log.info("User updated their password.");
  log.flush();
  revalidatePath("/");
  redirect("/program");
}

const resendOtpSchema = z.object({
  email: z.string().email({
    message: "Provided email is invalid.",
  }),
});

export async function resendOtp(
  _: any,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const validated = resendOtpSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return {
      success: validated.success,
      errors: validated.error.issues,
      message: null,
    };
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: validated.data.email,
  });

  if (error) {
    Sentry.captureException(error);
    redirect("/error");
  }

  await setPreferredSignInView("password");

  revalidatePath("/");
  redirect("/auth/verify-request");
}
