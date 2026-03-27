const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!rawApiBaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_API_BASE_URL. Set it in your environment before building or running web.",
  );
}

function normalizeBaseUrl(value: string) {
  const normalized = value.replace(/\/+$/, "");

  new URL(normalized);

  return normalized;
}

export const publicEnv = {
  apiBaseUrl: normalizeBaseUrl(rawApiBaseUrl),
} as const;
