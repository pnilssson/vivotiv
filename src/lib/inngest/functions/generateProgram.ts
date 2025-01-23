import { generateObject } from "ai";
import { getPrompt } from "../../prompt";
import { inngest } from "../client";
import { openai } from "@ai-sdk/openai";
import { programSchema } from "../../zod/schema";
import {
  handleProgramInserts,
  updateProfileGeneratingCommand,
} from "@/db/commands";
import * as Sentry from "@sentry/nextjs";

export const generateProgram = inngest.createFunction(
  { id: "generate-program" },
  { event: "app/program.requested" },
  async ({ event, step, logger }) => {
    const startTime = Date.now();
    const prompt = await step.run("get-prompt", async () => {
      return await getPrompt(event.data?.configuration);
    });

    const programId = await step.run("generate-program", async () => {
      try {
        const { object: program, usage } = await generateObject({
          model: openai("gpt-4o"),
          mode: "json",
          schemaName: "home-training",
          schemaDescription: "One week of home training.",
          schema: programSchema,
          prompt,
          temperature: 0.3,
        });

        return await handleProgramInserts(
          program,
          event.data?.configuration.user_id,
          prompt,
          usage.promptTokens,
          usage.completionTokens
        );
      } catch (error) {
        Sentry.captureException(error, {
          user: { id: event.data?.configuration.user_id },
          extra: { prompt },
        });
        throw new Error("Error when generating a program.");
      }
    });

    await step.run("set-generating", async () => {
      await updateProfileGeneratingCommand(
        event.data?.configuration.user_id,
        false
      );
    });

    logger.info("User generated a new program.", {
      userId: event.data?.configuration.user_id,
      programId: programId,
      elapsedTime: `${Date.now() - startTime}ms`,
    });
  }
);
