"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import {
  ScanSubmissionSchema,
  type Locale,
  type ScanSubmission,
} from "@vivotiv/shared";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { submitScan } from "../api/submit-scan";

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

  const mutation = useMutation({
    mutationFn: (payload: ScanSubmission) => submitScan(payload),
  });

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

  function handleUrlBlur(value: string) {
    if (value.length > 0 && !showEmail) {
      setShowEmail(true);
    }
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
        {(field) => (
          <div className="grid gap-2">
            {!isHero && (
              <Label htmlFor={field.name}>{t("urlLabel")}</Label>
            )}
            <Input
              id={field.name}
              type="url"
              name={field.name}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={() => handleUrlBlur(field.state.value)}
              placeholder={t("urlPlaceholder")}
              className={isHero ? "h-12 text-base" : undefined}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-left text-sm text-destructive">{t("urlInvalid")}</p>
            )}
          </div>
        )}
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
              {(field) => (
                <div className="grid gap-2">
                  {!isHero && (
                    <Label htmlFor={field.name}>{t("emailLabel")}</Label>
                  )}
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
                    className={isHero ? "h-12 text-base" : undefined}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-left text-sm text-destructive">
                      {t("emailInvalid")}
                    </p>
                  )}
                </div>
              )}
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
        <p className="text-left text-sm text-destructive">{t("error")}</p>
      )}

      {mutation.isSuccess && (
        <p className="text-sm text-emerald-700">{t("success")}</p>
      )}
    </form>
  );
}
