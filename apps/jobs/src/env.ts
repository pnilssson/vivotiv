function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get PORT() {
    return Number(process.env.PORT) || 3001;
  },
  get DATABASE_URL() {
    return requireEnv("DATABASE_URL");
  },
  get INNGEST_EVENT_KEY() {
    return requireEnv("INNGEST_EVENT_KEY");
  },
  get INNGEST_SIGNING_KEY() {
    return requireEnv("INNGEST_SIGNING_KEY");
  },
  get SENTRY_DSN() {
    return process.env.SENTRY_DSN ?? "";
  },
};
