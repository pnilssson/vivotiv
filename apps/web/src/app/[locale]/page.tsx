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

export default function LocaleLandingPage() {
  return (
    <>
      <SiteHeader />

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

      <SiteFooter />
    </>
  );
}
