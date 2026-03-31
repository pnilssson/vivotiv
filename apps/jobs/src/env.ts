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
    return process.env.INNGEST_EVENT_KEY ?? "";
  },
  get INNGEST_SIGNING_KEY() {
    return process.env.INNGEST_SIGNING_KEY ?? "";
  },
  get SENTRY_DSN() {
    return process.env.SENTRY_DSN ?? "";
  },
  get SMTP_HOST() {
    return requireEnv("SMTP_HOST");
  },
  get SMTP_PORT() {
    return Number(process.env.SMTP_PORT) || 587;
  },
  get SMTP_USER() {
    return requireEnv("SMTP_USER");
  },
  get SMTP_PASS() {
    return requireEnv("SMTP_PASS");
  },
  get SMTP_FROM() {
    return requireEnv("SMTP_FROM");
  },
};
