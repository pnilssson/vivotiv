import { sentryMiddleware } from "@inngest/middleware-sentry";
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "vivotiv",
  middleware: [sentryMiddleware()],
});
