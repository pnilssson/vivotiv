import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export default function NotFoundPage() {
  const t = useTranslations("notFound");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="font-heading text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">{t("message")}</p>
      <Link
        href="/"
        className="mt-8 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
