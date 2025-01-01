"use server";

import { createClient } from "@/lib/supabase/server";
import { getURL } from "@/lib/utils";
import { FormResponse } from "@/types/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { z } from "zod";

const schema = z.object({
  email: z.string().email({
    message: "Provided email is invalid.",
  }),
});

export async function login(_: any, formData: FormData): Promise<FormResponse> {
  const supabase = await createClient();
  const validated = schema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return {
      success: validated.success,
      errors: validated.error.issues,
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: validated.data.email,
    options: {
      emailRedirectTo: getURL(),
    },
  });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/auth/verify-request");
}
