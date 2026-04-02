import { useMutation } from "@tanstack/react-query";

import { publicEnv } from "@/config/public";

export function useUnsubscribe() {
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch(`${publicEnv.apiBaseUrl}/v1/unsubscribe`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Unsubscribe failed");
      }
    },
  });
}
