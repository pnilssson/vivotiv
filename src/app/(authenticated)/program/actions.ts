"use server";

import {
  archiveProgramCommand,
  insertProgramCommand,
  insertProgramMetadataCommand,
} from "@/db/commands";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { programSchema } from "@/lib/zod/schema";
import {
  ActionResponse,
  ConfigurationResponse,
  ProgramResponse,
  ProgramTinyResponse,
} from "@/types/types";
import { revalidatePath } from "next/cache";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import {
  getConfigurationQuery,
  getCurrentProgramQuery,
  getProgramByIdQuery,
} from "@/db/queries";
import { log } from "next-axiom";
import { redirect } from "next/navigation";

export async function getProgramById(
  id: string
): Promise<ProgramResponse | null> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  return await getProgramByIdQuery(id, user.id);
}

export async function getCurrentProgram(): Promise<ProgramResponse | null> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  return await getCurrentProgramQuery(user.id);
}

export async function archiveProgramAction(data: FormData) {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  const programId = data.get("programId") as string;
  await archiveProgramCommand(programId, user.id);

  revalidatePath("/program", "page");
  redirect("/program");
}

export async function generateProgram(): Promise<ActionResponse> {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  const configuration = await getConfigurationQuery(user.id);

  if (!configuration) {
    return {
      success: false,
      errors: [],
      message: "No configuration found.",
    };
  }
  const prompt = getPromt(configuration);

  try {
    const { object: program, usage } = await generateObject({
      model: openai("gpt-4o"),
      mode: "json",
      schemaName: "home-training",
      schemaDescription: "One week of home training.",
      schema: programSchema,
      prompt,
      temperature: 1.1,
    });

    const programId = await insertProgramCommand(program, user.id);
    await insertProgramMetadataCommand(
      user.id,
      prompt,
      programId,
      usage.promptTokens,
      usage.completionTokens
    );
  } catch (error) {
    log.error("Error when generating a program.", { error });
    throw new Error("Error when generating a program.");
  }

  revalidatePath("/program", "page");
  return {
    success: true,
    errors: [],
    message: "A new program is ready for you!",
  };
}

function getPromt(data: ConfigurationResponse): string {
  const {
    sessions,
    time,
    workout_focuses,
    workout_types,
    environments,
    equipment,
  } = data;
  const today = new Date();

  const formattedStartDate = new Date(today).toLocaleDateString();
  const prioritizeText =
    workout_focuses.length > 0
      ? `The program should include strength, conditioning and mobility exercises but prioritize ${workout_focuses.join(
          ", "
        )}`
      : "The program should include strength, conditioning and mobility exercises";
  const typesText =
    workout_types.length > 0
      ? `and the following types of exercises atleast once a week: ${workout_types.join(
          ", "
        )}`
      : "";
  const environmentText =
    environments.length > 0
      ? `The user has the following environmental possibilities that could be used in the workouts: ${environments.join(
          ", "
        )}`
      : "";
  const equipmentText =
    equipment.length > 0
      ? `The available equipment includes ${equipment}`
      : "No additional equipment is available";

  return `Generate home-training program starting on ${formattedStartDate} ending six days later. The program should include ${sessions} sessions. Total time of work and rest should take about ${time} minutes to complete. Each session should contain minimum 4 exercises and maximum 8 excercises, make sure to vary amount of excercises between sessions. ${prioritizeText} ${typesText}. ${equipmentText}. ${environmentText}. Each session should have a warm-up with 2-4 exercises that takes around 5 minutes to complete and is relevant to the session. The execution of the exercises can be of different types like reps and sets, amrap(as many reps as possible within a time domain), EMOM(every minute on the minute) it is important that the types vary. Make sure to include rest periods in the execution. The description of the exercises should explain to the user how to execute the exercise.`;
}
