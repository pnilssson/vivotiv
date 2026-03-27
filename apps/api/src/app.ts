import { Hono } from "hono";
import { env } from "hono/adapter";
import { cors } from "hono/cors";

import { healthRoutes } from "./features/health/routes";
import { scanRoutes } from "./features/scan/routes";

type Env = {
  CORS_ORIGINS: string;
};

const app = new Hono();

app.use(
  "/v1/*",
  cors({
    origin: (origin, c) => {
      const { CORS_ORIGINS } = env<Env>(c);
      const allowed = CORS_ORIGINS?.split(",") ?? [];
      return allowed.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["content-type", "authorization"],
  }),
);

app.get("/", (c) => {
  return c.text("Vivotiv API");
});

app.route("/", healthRoutes);
app.route("/v1", scanRoutes);

export default app;
