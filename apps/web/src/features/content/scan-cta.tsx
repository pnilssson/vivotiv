import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function ScanCta() {
  const t = useTranslations("scanCta");

  return (
    <div className="!my-10 rounded-lg border border-border bg-muted/40 p-6">
      <p className="!m-0 !text-foreground font-medium">{t("heading")}</p>
      <p className="!mt-2 !text-muted-foreground text-sm">{t("description")}</p>
      <Link
        href="/#scan"
        className="mt-4 inline-flex h-9 items-center rounded-[min(var(--radius-md),12px)] bg-primary px-4 text-sm font-medium !text-primary-foreground !no-underline transition-all hover:bg-primary/80"
      >
        {t("button")}
      </Link>
    </div>
  );
}
