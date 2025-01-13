"use server";

import { db } from "@/db/db";
import { waitingList } from "@/db/schema";
import { ActionResponse } from "@/lib/types";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email({
    message: "Provided email is invalid.",
  }),
});

export async function addToWaitingList(
  _: any,
  formData: FormData
): Promise<ActionResponse> {
  const validated = emailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return {
      success: validated.success,
      errors: validated.error.issues,
      message: null,
    };
  }

  var alreadyInList = await db.query.waitingList.findFirst({
    where: (email, { eq }) => eq(email.email, validated.data.email),
  });

  if (alreadyInList) {
    return {
      success: false,
      errors: [],
      message: "This email has already been added to the waiting list!",
    };
  }

  await db.insert(waitingList).values({
    email: validated.data.email,
  });

  return {
    success: true,
    errors: [],
    message: "Happy to hear that you're interested. We'll be in touch soon!",
  };
}
