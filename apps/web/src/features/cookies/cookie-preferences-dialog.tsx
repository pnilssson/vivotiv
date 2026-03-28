"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/i18n/navigation";

import { useCookieConsent } from "./cookie-consent-provider";

function Toggle({
  checked,
  disabled,
  onCheckedChange,
  id,
}: {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-primary" : "bg-input",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

export function CookiePreferencesDialog() {
  const { consent, updateConsent, isPreferencesOpen, setIsPreferencesOpen } =
    useCookieConsent();
  const t = useTranslations("cookies");

  const [analyticsEnabled, setAnalyticsEnabled] = useState(
    consent?.analytics ?? false,
  );

  useEffect(() => {
    if (isPreferencesOpen) {
      setAnalyticsEnabled(consent?.analytics ?? false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPreferencesOpen]);

  function handleSave() {
    updateConsent({ analytics: analyticsEnabled });
    setIsPreferencesOpen(false);
  }

  return (
    <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("preferences.title")}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          {t("preferences.description")}{" "}
          <Link
            href="/cookies"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {t("banner.policyLink")}
          </Link>
        </p>

        <div className="space-y-4 py-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">
                {t("preferences.necessary.title")}
              </label>
              <p className="text-xs text-muted-foreground">
                {t("preferences.necessary.description")}
              </p>
            </div>
            <Toggle
              id="necessary"
              checked={true}
              disabled={true}
              onCheckedChange={() => {}}
            />
          </div>

          <div className="border-t border-border" />

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <label htmlFor="analytics" className="text-sm font-medium">
                {t("preferences.analytics.title")}
              </label>
              <p className="text-xs text-muted-foreground">
                {t("preferences.analytics.description")}
              </p>
            </div>
            <Toggle
              id="analytics"
              checked={analyticsEnabled}
              onCheckedChange={setAnalyticsEnabled}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setIsPreferencesOpen(false)}
          >
            {t("preferences.cancel")}
          </Button>
          <Button onClick={handleSave}>{t("preferences.save")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
