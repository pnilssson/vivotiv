"use client";

import { usePostHog } from "@posthog/next";
import { useEffect } from "react";

import { useCookieConsent } from "@/features/cookies/cookie-consent-provider";

export function PostHogConsentBridge() {
  const posthog = usePostHog();
  const { consent, loaded } = useCookieConsent();

  useEffect(() => {
    if (!loaded || !posthog) return;

    if (consent?.analytics) {
      posthog.opt_in_capturing();
    } else if (consent?.analytics === false) {
      posthog.opt_out_capturing();
    }
  }, [consent, loaded, posthog]);

  return null;
}
