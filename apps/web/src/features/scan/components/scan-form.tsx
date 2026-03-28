"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import {
  ScanSubmissionSchema,
  type Locale,
  type ScanSubmission,
} from "@vivotiv/shared";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { submitScan } from "../api/submit-scan";

const ScanFormValuesSchema = ScanSubmissionSchema.pick({
  url: true,
  email: true,
});

export function ScanForm() {
  const t = useTranslations("landing");
  const locale = useLocale() as Locale;

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

  return (
    <form
      className="mt-8 flex w-full flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name="url">
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>{t("urlLabel")}</Label>
            <Input
              id={field.name}
              type="url"
              name={field.name}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              placeholder={t("urlPlaceholder")}
              required
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {t("urlInvalid")}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>{t("emailLabel")}</Label>
            <Input
              id={field.name}
              type="email"
              name={field.name}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              placeholder={t("emailPlaceholder")}
              required
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {t("emailInvalid")}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="mt-2"
      >
        {mutation.isPending ? t("pending") : t("submit")}
      </Button>

      {mutation.isError && (
        <p className="text-sm text-destructive">{t("error")}</p>
      )}

      {mutation.isSuccess && (
        <p className="text-sm text-emerald-700">{t("success")}</p>
      )}
    </form>
  );
}
