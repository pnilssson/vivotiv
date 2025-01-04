"use server";

import { db } from "@/db/db";
import { waitingList } from "@/db/schema";
import { FormResponse } from "@/types/types";
import { redirect } from "next/navigation";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email({
    message: "Provided email is invalid.",
  }),
});

export async function addToWaitingList(
  _: any,
  formData: FormData
): Promise<FormResponse> {
  const validated = emailSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      success: validated.success,
      errors: validated.error.issues,
    };
  }

  var alreadyInList = await db.query.waitingList.findFirst({
    where: (email, { eq }) => eq(email.email, validated.data.email),
  });

  if (alreadyInList) {
    redirect("/");
  }

  await db.insert(waitingList).values({
    email: validated.data.email,
  });

  redirect("/");
}
