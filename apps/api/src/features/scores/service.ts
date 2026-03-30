import { getAverageScores } from "@vivotiv/db";
import type { Database } from "@vivotiv/db";
import type { AverageScoresResponse } from "@vivotiv/shared";

const CACHE_KEY = "scores:averages";
const CACHE_TTL = 1800;

export async function fetchAverageScores(
  db: Database,
  cache: KVNamespace,
): Promise<AverageScoresResponse> {
  const cached =
    await cache.get<AverageScoresResponse>(CACHE_KEY, "json");

  if (cached) {
    return cached;
  }

  const scores = await getAverageScores(db);

  await cache.put(CACHE_KEY, JSON.stringify(scores), {
    expirationTtl: CACHE_TTL,
  });

  return scores;
}
