export async function sendInngestEvent(
  eventKey: string,
  event: { name: string; data: Record<string, unknown> },
  baseUrl?: string,
) {
  const url = baseUrl
    ? `${baseUrl}/e/${eventKey}`
    : `https://inn.gs/e/${eventKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to send Inngest event (status ${response.status}): ${body}`,
    );
  }
}
