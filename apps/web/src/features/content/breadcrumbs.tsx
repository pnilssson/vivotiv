import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { ContentFamily } from "@/lib/content";

type BreadcrumbsProps = {
  family?: ContentFamily;
  title: string;
};

export function Breadcrumbs({ family, title }: BreadcrumbsProps) {
  const t = useTranslations("breadcrumbs");
  const locale = useLocale();
  const isStandalone = !family || family === "standalone";

  return (
    <nav
      aria-label={locale === "sv" ? "Brödsmulor" : "Breadcrumb"}
      className="mb-6 text-sm text-muted-foreground"
    >
      <ol className="!m-0 flex !list-none items-center gap-1.5 !space-y-0 !p-0">
        <li className="!text-muted-foreground">
          <Link
            href="/"
            className="!text-muted-foreground !no-underline transition-colors hover:!text-foreground"
          >
            {t("home")}
          </Link>
        </li>
        {!isStandalone && (
          <>
            <li aria-hidden="true" className="!text-muted-foreground/60">
              /
            </li>
            <li className="!text-muted-foreground">
              <Link
                href="/guides"
                className="!text-muted-foreground !no-underline transition-colors hover:!text-foreground"
              >
                {t("guides")}
              </Link>
            </li>
          </>
        )}
        <li aria-hidden="true" className="!text-muted-foreground/60">
          /
        </li>
        <li aria-current="page" className="truncate !text-foreground">
          {title}
        </li>
      </ol>
    </nav>
  );
}
