import { useTranslations } from "next-intl";

import { ScanForm } from "@/features/scan/components/scan-form";

export default function LocaleLandingPage() {
  const t = useTranslations("landing");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-4 text-zinc-600">{t("subtitle")}</p>
      <ScanForm />
    </main>
  );
}
