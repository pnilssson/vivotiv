import { inngest } from "@/lib/inngest/client";
import { removePrograms } from "@/lib/inngest/functions/removePrograms";
import { generateProgram } from "@/lib/inngest/functions/generateProgram";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateProgram, removePrograms],
});
