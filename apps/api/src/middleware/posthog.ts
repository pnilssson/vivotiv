import { createMiddleware } from "hono/factory";
import { PostHog } from "posthog-node";

import type { Env } from "../env";

export const posthogMiddleware = createMiddleware<Env>(async (c, next) => {
  const key = c.env.POSTHOG_KEY;
  if (!key) {
    await next();
    return;
  }

  const posthog = new PostHog(key, {
    host: "https://eu.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });

  c.set("posthog", posthog);

  await next();

  await posthog.shutdown();
});
