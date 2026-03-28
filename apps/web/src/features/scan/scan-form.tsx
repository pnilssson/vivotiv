"use client";

import { useForm } from "@tanstack/react-form";
import { ScanSubmissionSchema, type Locale } from "@vivotiv/shared";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useSubmitScan } from "./use-submit-scan";
import { useTypewriter } from "@/lib/use-typewriter";

const ScanFormValuesSchema = ScanSubmissionSchema.pick({
  url: true,
  email: true,
});

type ScanFormProps = {
  variant?: "hero" | "compact";
};

export function ScanForm({ variant = "hero" }: ScanFormProps) {
  const t = useTranslations("hero");
  const locale = useLocale() as Locale;
  const [showEmail, setShowEmail] = useState(false);
  const [urlFocused, setUrlFocused] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);

  const urlExamples = useMemo(() => t("urlExamples").split(","), [t]);
  const typewriterText = useTypewriter(urlExamples, {
    enabled: variant === "hero" && !urlFocused && !showEmail,
    prefix: "https://",
  });

  const mutation = useSubmitScan();

  const form = useForm({
    defaultValues: {
      url: "",
      email: "",
    },
    validators: {
      onSubmit: ScanFormValuesSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        ...value,
        locale,
      });
    },
  });

  useEffect(() => {
    if (mutation.isSuccess || mutation.isError) {
      statusRef.current?.focus();
    }
  }, [mutation.isSuccess, mutation.isError]);

  function handleUrlChange(value: string) {
    setShowEmail(value.length > 0);
  }

  const isHero = variant === "hero";

  return (
    <form
      id="scan"
      className="flex w-full flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name="url">
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div className="grid gap-2">
              <Label htmlFor={field.name} className={isHero ? "sr-only" : undefined}>
                {t("urlLabel")}
              </Label>
              <Input
                id={field.name}
                type="url"
                name={field.name}
                value={field.state.value}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                  handleUrlChange(event.target.value);
                }}
                onFocus={() => setUrlFocused(true)}
                onBlur={() => setUrlFocused(false)}
                placeholder={typewriterText || t("urlPlaceholder")}
                aria-describedby={hasError ? `${field.name}-error` : undefined}
                aria-invalid={hasError || undefined}
                className={isHero ? "h-12 text-base" : undefined}
              />
              {hasError && (
                <p id={`${field.name}-error`} className="text-left text-sm text-destructive" role="alert">
                  {t("urlInvalid")}
                </p>
              )}
            </div>
          );
        }}
      </form.Field>

      <AnimatePresence>
        {showEmail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <form.Field name="email">
              {(field) => {
                const hasError = field.state.meta.errors.length > 0;
                return (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name} className={isHero ? "sr-only" : undefined}>
                      {t("emailLabel")}
                    </Label>
                    <Input
                      id={field.name}
                      type="email"
                      name={field.name}
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      placeholder={t("emailPlaceholder")}
                      aria-describedby={hasError ? `${field.name}-error` : undefined}
                      aria-invalid={hasError || undefined}
                      className={isHero ? "h-12 text-base" : undefined}
                    />
                    {hasError && (
                      <p id={`${field.name}-error`} className="text-left text-sm text-destructive" role="alert">
                        {t("emailInvalid")}
                      </p>
                    )}
                  </div>
                );
              }}
            </form.Field>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmail && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          >
            <Button
              type="submit"
              disabled={mutation.isPending}
              className={isHero ? "h-12 w-full text-base" : "w-full"}
            >
              {mutation.isPending ? t("pending") : t("submit")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {mutation.isError && (
        <p ref={statusRef} tabIndex={-1} role="alert" className="text-left text-sm text-destructive outline-none">
          {t("error")}
        </p>
      )}

      {mutation.isSuccess && (
        <p ref={statusRef} tabIndex={-1} role="status" className="text-sm text-emerald-700 outline-none">
          {t("success")}
        </p>
      )}
    </form>
  );
}
