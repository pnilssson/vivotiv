"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AverageScoresResponseSchema,
  type AverageScoresResponse,
} from "@vivotiv/shared";

import { publicEnv } from "@/config/public";

const FALLBACK_SCORES: AverageScoresResponse = {
  performance: 38,
  seo: 45,
  accessibility: 42,
  trustSecurity: 29,
  standards: 34,
  aiReadiness: 44,
  scanCount: 0,
};

const MIN_SCANS_FOR_LIVE_SCORES = 50;

export function useAverageScores() {
  const query = useQuery({
    queryKey: ["scores", "averages"],
    queryFn: async () => {
      const response = await fetch(
        `${publicEnv.apiBaseUrl}/v1/scores/averages`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch average scores");
      }

      const json = await response.json();
      const parsed = AverageScoresResponseSchema.safeParse(json);

      if (!parsed.success) {
        throw new Error("Invalid scores response");
      }

      return parsed.data;
    },
    staleTime: Infinity,
  });

  const useFallback =
    !query.data || query.data.scanCount <= MIN_SCANS_FOR_LIVE_SCORES;

  return {
    scores: useFallback ? FALLBACK_SCORES : query.data,
    isUsingFallback: useFallback,
    scanCount: query.data?.scanCount ?? 0,
  };
}
