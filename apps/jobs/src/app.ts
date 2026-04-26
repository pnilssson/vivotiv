import { serve as serveHttp } from "@hono/node-server";
import * as Sentry from "@sentry/node";
import { Hono } from "hono";
import { serve as serveInngest } from "inngest/hono";

import { env } from "./env";
import { healthRoutes } from "./features/health/routes";
import { inngest } from "./inngest/client";
import { functions } from "./inngest/functions/index";

Sentry.init({
  dsn: env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  enableLogs: true,
});

const app = new Hono();

app.route("/", healthRoutes);

const inngestHandler = serveInngest({
  client: inngest,
  functions,
});

app.on(
  ["GET", "PUT", "POST"],
  "/api/inngest",
  inngestHandler,
);

app.all("/api/inngest", (c) => {
  return c.json(
    { error: { message: `Method ${c.req.method} Not Allowed` } },
    405,
  );
});

app.notFound((c) => {
  return c.json({ error: { message: "Not found" } }, 404);
});

app.onError((err, c) => {
  Sentry.captureException(err);
  console.error(err);
  return c.json({ error: { message: "Internal server error" } }, 500);
});

const server = serveHttp({
  fetch: app.fetch,
  port: env.PORT,
});

function shutdown() {
  console.log("Shutting down gracefully...");
  server.close(() => process.exit(0));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log(`Jobs server running on port ${env.PORT}`);
