"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

import { CookiePreferencesDialog } from "./cookie-preferences-dialog";
import { useCookieConsent } from "./cookie-consent-provider";

export function CookieBanner() {
  const { consent, acceptAll, rejectAll, openPreferences } = useCookieConsent();
  const t = useTranslations("cookies");

  // consent is null both before hydration and when no choice has been made.
  // The banner animation handles the transition, so showing on null is correct.
  const showBanner = consent === null;

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-4 bottom-4 z-50 w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-background p-4 shadow-xl sm:right-6 sm:bottom-6"
            role="dialog"
            aria-label={t("banner.ariaLabel")}
            aria-modal="false"
          >
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                {t("banner.message")}{" "}
                <Link
                  href="/cookies"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  {t("banner.policyLink")}
                </Link>
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={rejectAll}>
                  {t("banner.reject")}
                </Button>
                <Button variant="outline" size="sm" onClick={openPreferences}>
                  {t("banner.manage")}
                </Button>
                <Button size="sm" onClick={acceptAll}>
                  {t("banner.accept")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CookiePreferencesDialog />
    </>
  );
}
