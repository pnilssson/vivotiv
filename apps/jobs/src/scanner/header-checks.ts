export interface HeaderCheckResults {
  url: string;
  isHttps: boolean;
  headers: Record<string, string>;
  statusCode: number;
}

export async function runHeaderChecks(
  url: string,
): Promise<HeaderCheckResults> {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });

  const headers: Record<string, string> = {};
  for (const [key, value] of response.headers) {
    headers[key.toLowerCase()] = value;
  }

  return {
    url: response.url,
    isHttps: response.url.startsWith("https://"),
    headers,
    statusCode: response.status,
  };
}
