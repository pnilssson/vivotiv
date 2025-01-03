import { ConfigurationResponse } from "@/types/types";
import { db } from "./db";

export async function getConfigurationQuery(userId: string) {
  const result = await db.query.configuration.findFirst({
    with: {
      workoutFocuses: true,
      workoutTypes: true,
      availableSpaces: true,
    },
    where: (configuration, { eq, and }) =>
      and(eq(configuration.user_id, userId)),
  });

  return result as unknown as ConfigurationResponse;
}
