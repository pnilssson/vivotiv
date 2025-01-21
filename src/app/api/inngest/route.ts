import { inngest } from "@/lib/inngest/client";
import { generateProgram } from "@/lib/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateProgram
  ],
});
