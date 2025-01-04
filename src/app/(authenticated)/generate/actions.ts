"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { FormResponse } from "@/types/types";
import {
  insertProgramCommand,
  insertProgramMetadataCommand,
} from "@/db/commands";
import { programRequestSchema, programSchema } from "@/lib/zod/schema";
import { redirect } from "next/navigation";
import { getUserOrRedirect } from "@/lib/server-utils";

export async function generateProgramAction(
  _: any,
  data: FormData
): Promise<FormResponse> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  const parsed = programRequestSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: parsed.success,
      errors: parsed.error.issues,
    };
  }

  const prompt = getPromt(parsed.data);
  const { object: program } = await generateObject({
    model: openai("gpt-4o"),
    mode: "json",
    schema: programSchema,
    prompt,
    temperature: 1.1,
  });

  const programId = await insertProgramCommand(program, user.id);
  await insertProgramMetadataCommand(user.id, prompt, programId);

  revalidatePath("/programs", "page");
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

  return `Generate a one-week long home-training program starting from ${formattedStartDate}. The program should include ${sessions} sessions per wee. Make sure to calculate that the total time of work and rest takes about ${time} minutes to complete. Each session should contain minimum 4 exercises and maximum 8 excercises, make sure to vary amount of excercises between sessions. ${prioritizeText} ${typesText}. ${equipmentText}. Each session should have a warm-up with 2-4 exercises that takes around 5 minutes to complete and is relevant to the session. The execution of the exercises can be of different types like reps and sets, amrap(as many reps as possible within a time domain), EMOM(every minute on the minute) it is important that the types vary. Make sure to include rest periods in the execution. The description of the exercises should explain to the user how to execute the exercise.`;
}
