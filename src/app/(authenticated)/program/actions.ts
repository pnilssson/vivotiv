"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ProgramActionResponse } from "@/types/types";

const amountSchema = z.object({
  sets: z.nullable(z.number()),
  reps: z.nullable(z.number()),
  type: z.string(),
});

const warmUpExerciseSchema = z.object({
  title: z.string(),
  description: z.string(),
  amount: amountSchema,
});

const warmUpSchema = z.object({
  description: z.string(),
  duration: z.number(),
  exercises: z.array(warmUpExerciseSchema),
});

const exerciseSchema = z.object({
  title: z.string(),
  description: z.string(),
  amount: amountSchema,
  restPeriod: z.number(),
});

const workoutSchema = z.object({
  date: z.string().date(),
  completed: z.boolean(),
  description: z.string(),
  warmup: warmUpSchema,
  exercises: z.array(exerciseSchema),
});

const programSchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
  workouts: z.array(workoutSchema),
});

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
): Promise<ProgramActionResponse> {
  const supabase = createClient();

  const validated = requestSchema.safeParse({
    startDate: startDate,
    sessions: formData.get("sessions"),
    time: formData.get("time"),
    prioritize: prioritize,
    types: types,
    equipment: equipment,
  });

  if (!validated.success) {
    console.log({
      success: validated.success,
      errors: validated.error.issues,
      program: null,
    });

    return {
      success: validated.success,
      errors: validated.error.issues,
      program: null,
    };
  }

  console.log(validated.data);

  const prompt = getPromt(validated.data);
  console.log(prompt);
  //   const { object } = await generateObject({
  //     model: openai("gpt-4o"),
  //     schema: programSchema,
  //     prompt,
  //   });

  const object = null;

  console.log(
    JSON.stringify(
      {
        success: validated.success,
        errors: [],
        program: object,
      },
      null,
      2
    )
  );

  revalidatePath("/program", "page");

  return {
    success: validated.success,
    errors: [],
    program: object,
  };
}

function getPromt(data: any): string {
  const { startDate, sessions, time, prioritize, types, equipment } = data;

  const formattedStartDate = new Date(startDate).toLocaleDateString();
  const prioritizeText =
    prioritize.length > 0
      ? `The training should prioritize ${prioritize.join(", ")}`
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

  return `Generate a one-week home-training program starting from ${formattedStartDate}. The program should include ${sessions} sessions per week, each lasting around ${time} minutes. Each session should contain 3-6 exercises if ${time} is less then 31, 4-8 if the ${time} is between 31 and 60 minutes. ${prioritizeText} ${typesText}. ${equipmentText}. Each session should have a warm-up with 2-4 exercises related to the session. The reps property of the amount object can either be number of repetitions or number of working minutes per set set the type property to either "minutes" or "reps" accordingly. Ensure the workouts is suitable for home training.`;
}
