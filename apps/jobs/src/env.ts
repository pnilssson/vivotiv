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
  get RESEND_API_KEY() {
    return requireEnv("RESEND_API_KEY");
  },
  get EMAIL_FROM() {
    return requireEnv("EMAIL_FROM");
  },
  get GOOGLE_CLOUD_API_KEY() {
    return process.env.GOOGLE_CLOUD_API_KEY ?? "";
  },
  get UNSUBSCRIBE_SECRET() {
    return requireEnv("UNSUBSCRIBE_SECRET");
  },
  get OUTREACH_REPLY_TO() {
    return requireEnv("OUTREACH_REPLY_TO");
  },
};
