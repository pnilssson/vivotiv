import { cors } from "hono/cors";

import { createApp } from "./lib/factory";
import { healthRoutes } from "./features/health/routes";
import { scanRoutes } from "./features/scan/routes";

const app = createApp();

const allowedOrigins = process.env.CORS_ORIGINS?.split(",") ?? [];

app.use(
  "/v1/*",
  cors({
    origin: allowedOrigins,
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
