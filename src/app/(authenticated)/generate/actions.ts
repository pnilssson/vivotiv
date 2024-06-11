"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient, getUserOrRedirect } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ProgramFormResponse } from "@/types/types";
import { insertGenerated, insertProgram } from "@/db/commands";
import { programSchema } from "@/lib/zod/schemas";
import { redirect } from "next/navigation";

const requestSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required.",
    invalid_type_error: "Invalid start date.",
  }),
  sessions: z.coerce
    .number({
      required_error: "Sessions is required.",
    })
    .positive()
    .lte(7),
  time: z.coerce
    .number({
      required_error: "Session length is required.",
    })
    .positive()
    .gte(15, "Session length cannot be less than 15 minutes.")
    .lte(60, "Session length cannot be more than 60 minutes."),
  prioritize: z.nullable(z.array(z.string())),
  types: z.nullable(z.array(z.string())),
  equipment: z.nullable(z.array(z.string())),
});

export async function generateProgram(
  _: any,
  formData: FormData,
  startDate: Date | undefined,
  prioritize: string[],
  types: string[],
  equipment: string[]
): Promise<ProgramFormResponse> {
  const supabase = createClient();
  const user = await getUserOrRedirect(supabase);

  const validated = requestSchema.safeParse({
    startDate: startDate,
    sessions: formData.get("sessions"),
    time: formData.get("time"),
    prioritize: prioritize,
    types: types,
    equipment: equipment,
  });

  if (!validated.success) {
    return {
      success: validated.success,
      errors: validated.error.issues,
      program: null,
    };
  }

  const prompt = getPromt(validated.data);
  const { object: chatgpt } = await generateObject({
    model: openai("gpt-4o"),
    mode: "json",
    schema: programSchema,
    prompt,
  });

  await insertProgram(chatgpt, user?.id!);
  await insertGenerated(prompt, JSON.stringify(chatgpt, null, 2), user?.id!);

  revalidatePath("/program", "page");
  redirect("/programs");
}

function getPromt(data: any): string {
  const { startDate, sessions, time, prioritize, types, equipment } = data;

  const formattedStartDate = new Date(startDate).toLocaleDateString();
  const prioritizeText =
    prioritize.length > 0
      ? `The program should include strength, conditioning and mobility exercises but prioritize ${prioritize.join(
          ", "
        )}`
      : "The training should be allround";
  const typesText =
    types.length > 0
      ? `and include the following types of exercises atleast once a week: ${types.join(
          ", "
        )}`
      : "";
  const equipmentText =
    equipment.length > 0
      ? `The available equipment includes ${equipment.join(", ")}`
      : "No additional equipment is available";

  return `Generate a one-week home-training program starting from ${formattedStartDate}. The program should include ${sessions} sessions per week, each lasting around ${time} minutes. Each session should contain 3-8 exercises which takes around ${time} minutes to complete. ${prioritizeText} ${typesText}. ${equipmentText}. Each session should have a warm-up with 2-4 exercises that takes around 5 minutes to complete and is relevant to the session. The execution of the exercises can be of different types like reps and sets, amrap(as many reps as possible within a time domain), EMOM(every minute on the minute). Make sure to include rest periods in the execution. Be creative and make sure the workouts vary! The description of the exercises should explain to the user how to execute the exercise.`;
}
