import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SiteFooter } from "@/features/landing/site-footer";
import { SiteHeader } from "@/features/landing/site-header";
import { ScanResultsPage } from "@/features/scan-results/scan-results-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("scanResults");

  return {
    title: `${t("title")} | Vivotiv`,
    robots: { index: false },
  };
}

type ScanPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScanPage({ params }: ScanPageProps) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="min-h-screen bg-background">
        <ScanResultsPage scanId={id} />
      </main>
      <SiteFooter />
    </>
  );
}
