import type { Database } from "@vivotiv/db";

export type Env = {
  Bindings: {
    CORS_ORIGINS: string;
    DATABASE_URL: string;
    VIVOTIV_CACHE: KVNamespace;
  };
  Variables: {
    db: Database;
  };
};
