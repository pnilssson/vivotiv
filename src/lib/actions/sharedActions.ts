"use server";

import * as Sentry from "@sentry/nextjs";
import { getAnyFeedbackWithinLastMinuteByUserIdQuery } from "@/db/queries";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { ActionResponse } from "@/lib/types";
import { feedbackRequestSchema } from "../zod/schema";
import { insertFeedbackCommand } from "@/db/commands";
import { revalidatePath } from "next/cache";

export async function addFeedback(
  _: any,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  const validated = feedbackRequestSchema.safeParse(formData);
  if (!validated.success) {
    return {
      success: validated.success,
      errors: validated.error.issues,
      message: null,
    };
  }

  try {
    const anyFeedbackWithinLastMinute =
      await getAnyFeedbackWithinLastMinuteByUserIdQuery(user.id);
    if (anyFeedbackWithinLastMinute) {
      return {
        success: false,
        errors: [],
        message:
          "You have just submitted feedback. Please wait a minute before submitting another.",
      };
    }
    await insertFeedbackCommand(user.id, validated.data.feedback);
  } catch (error) {
    Sentry.captureException(error);
    return {
      success: false,
      errors: [],
      message: "An error occurred when saving the feedback.",
    };
  }

  revalidatePath("/", "page");
  return {
    success: true,
    errors: [],
    message: "Thank you for your feedback!",
  };
}
