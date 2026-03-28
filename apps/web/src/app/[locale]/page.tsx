import { getLocale, getTranslations } from "next-intl/server";

import { AudienceSection } from "@/features/landing/components/audience-section";
import { BottomCtaSection } from "@/features/landing/components/bottom-cta-section";
import { CategoriesSection } from "@/features/landing/components/categories-section";
import { ComplianceSection } from "@/features/landing/components/compliance-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { GdprSection } from "@/features/landing/components/gdpr-section";
import { HeroSection } from "@/features/landing/components/hero-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { ReportPreviewSection } from "@/features/landing/components/report-preview-section";
import { SectionDivider } from "@/features/landing/components/section-divider";
import { SiteFooter } from "@/features/landing/components/site-footer";
import { SiteHeader } from "@/features/landing/components/site-header";

const domainsByLocale = {
  en: "https://vivotiv.com",
  sv: "https://vivotiv.se",
} as const;

export default async function LocaleLandingPage() {
  const locale = await getLocale();
  const t = await getTranslations("metadata");
  const tFaq = await getTranslations("faq");

  const domain = domainsByLocale[locale as keyof typeof domainsByLocale];
  const faqItems = tFaq.raw("items") as { question: string; answer: string }[];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vivotiv",
    url: domain,
    description: t("description"),
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vivotiv",
    url: domain,
    inLanguage: locale === "sv" ? "sv-SE" : "en-US",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <SiteHeader />

      <main id="main-content">
        <HeroSection />

        <CategoriesSection />
        <SectionDivider wide />

        <ReportPreviewSection />
        <SectionDivider wide />

        <HowItWorksSection />
        <SectionDivider wide />

        <AudienceSection />
        <SectionDivider wide />

        <ComplianceSection />
        <SectionDivider wide />

        <GdprSection />
        <SectionDivider wide />

        <FaqSection />
        <SectionDivider wide />

        <div className="bg-foreground text-background">
          <BottomCtaSection />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
