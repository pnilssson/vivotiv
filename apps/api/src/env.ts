import type { Database } from "@vivotiv/db";

export type Env = {
  Bindings: {
    CORS_ORIGINS: string;
    DATABASE_URL: string;
    VIVOTIV_CACHE: KVNamespace;
    SENTRY_DSN: string;
    CF_VERSION_METADATA: { id: string; tag: string };
  };
  Variables: {
    db: Database;
  };
};
