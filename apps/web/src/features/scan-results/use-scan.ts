"use client";

import { useQuery } from "@tanstack/react-query";
import { ScanResponseSchema } from "@vivotiv/shared";

import { publicEnv } from "@/config/public";

export function useScan(id: string) {
  return useQuery({
    queryKey: ["scans", id],
    queryFn: async () => {
      const response = await fetch(
        `${publicEnv.apiBaseUrl}/v1/scans/${id}`,
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch scan");
      }

      const json = await response.json();
      const parsed = ScanResponseSchema.safeParse(json);

      if (!parsed.success) {
        throw new Error("Invalid scan response");
      }

      return parsed.data;
    },
    staleTime: Infinity,
  });
}
