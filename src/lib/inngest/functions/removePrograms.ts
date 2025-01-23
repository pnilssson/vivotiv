import { deleteOldProgramsCommand } from "@/db/commands";
import { inngest } from "../client";

export const removePrograms = inngest.createFunction(
  { id: "remove-programs" },
  { cron: "TZ=Europe/Stockholm 0 22 * * *" },
  async ({ step, logger }) => {
    const result = await step.run("remove-programs", async () => {
      return await deleteOldProgramsCommand();
    });

    logger.info(
      `Removed programs from ${result.usersWithDeletedPrograms} users. A total of ${result.totalDeletedPrograms} programs was removed.`
    );
  }
);
