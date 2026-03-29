import type { Database } from "@vivotiv/db";
import type { PostHog } from "posthog-node";

export type Env = {
  Bindings: {
    CORS_ORIGINS: string;
    DATABASE_URL: string;
    VIVOTIV_CACHE: KVNamespace;
    INNGEST_EVENT_KEY: string;
    SENTRY_DSN: string;
    CF_VERSION_METADATA: { id: string; tag: string };
    POSTHOG_KEY: string;
    SCAN_RATE_LIMITER: RateLimit;
  };
  Variables: {
    db: Database;
    posthog: PostHog;
  };
};
