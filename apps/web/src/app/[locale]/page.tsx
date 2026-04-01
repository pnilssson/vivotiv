import { getLocale, getTranslations } from "next-intl/server";

import { AudienceSection } from "@/features/landing/audience-section";
import { BottomCtaSection } from "@/features/landing/bottom-cta-section";
import { CategoriesSection } from "@/features/landing/categories-section";
import { ComplianceSection } from "@/features/landing/compliance-section";
import { FaqSection } from "@/features/landing/faq-section";
import { GdprSection } from "@/features/landing/gdpr-section";
import { HeroSection } from "@/features/landing/hero-section";
import { HowItWorksSection } from "@/features/landing/how-it-works-section";
import { ReportPreviewSection } from "@/features/landing/report-preview-section";
import { SectionDivider } from "@/features/landing/section-divider";
import { SiteFooter } from "@/features/landing/site-footer";
import { SiteHeader } from "@/features/landing/site-header";
import { domainsByLocale } from "@/lib/site-domains";

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
      <div hidden>
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
      </div>

      <SiteHeader />

      <main id="main-content">
        <HeroSection />
        <SectionDivider wide />

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
