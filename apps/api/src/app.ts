import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

import type { Env } from "./env";
import { healthRoutes } from "./features/health/routes";
import { scanRoutes } from "./features/scan/routes";
import { dbMiddleware } from "./middleware/db";

const app = new Hono<Env>();

app.use(
  "/v1/*",
  cors({
    origin: (origin, c) => {
      const allowed = c.env.CORS_ORIGINS?.split(",") ?? [];
      return allowed.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["content-type", "authorization"],
  }),
);

app.use("/v1/*", dbMiddleware);

app.get("/", (c) => c.text("Vivotiv API"));
app.route("/", healthRoutes);
app.route("/v1", scanRoutes);

app.notFound((c) => {
  return c.json({ error: { message: "Not found" } }, 404);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: { message: err.message } }, err.status);
  }

  console.error(err);
  return c.json({ error: { message: "Internal server error" } }, 500);
});

export default app;
