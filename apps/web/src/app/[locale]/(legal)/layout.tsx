import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("legal");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("backHome")}
          </Link>
        </div>
        <div className="space-y-6 text-sm leading-relaxed text-foreground [&_h1]:font-heading [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h2]:font-heading [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/80 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_p]:text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
