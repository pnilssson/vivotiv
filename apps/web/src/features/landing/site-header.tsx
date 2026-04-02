"use client";

import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";

const compliancePages = [
  { slug: "accessibility", titleKey: "accessibility", descriptionKey: "accessibilityDescription" },
  { slug: "privacy-compliance", titleKey: "privacyCompliance", descriptionKey: "privacyComplianceDescription" },
  { slug: "cookie-consent-requirements", titleKey: "cookieConsent", descriptionKey: "cookieConsentDescription" },
  { slug: "website-security-basics", titleKey: "websiteSecurity", descriptionKey: "websiteSecurityDescription" },
  { slug: "website-compliance-checklist", titleKey: "complianceChecklist", descriptionKey: "complianceChecklistDescription" },
] as const;

const websiteProblemPages = [
  { slug: "free-website-test", titleKey: "freeWebsiteTest", descriptionKey: "freeWebsiteTestDescription" },
  { slug: "website-health-check", titleKey: "websiteHealthCheck", descriptionKey: "websiteHealthCheckDescription" },
  { slug: "slow-website", titleKey: "slowWebsite", descriptionKey: "slowWebsiteDescription" },
  { slug: "website-not-secure", titleKey: "websiteNotSecure", descriptionKey: "websiteNotSecureDescription" },
  { slug: "website-not-ranking", titleKey: "websiteNotRanking", descriptionKey: "websiteNotRankingDescription" },
] as const;

function DropdownLinks({
  pages,
  t,
}: {
  pages: ReadonlyArray<{ slug: string; titleKey: string; descriptionKey: string }>;
  t: (key: string) => string;
}) {
  return (
    <div className="grid w-[320px] gap-1 p-1">
      {pages.map((page) => (
        <NavigationMenuLink
          key={page.slug}
          render={<Link href={`/${page.slug}`} />}
          className="flex flex-col items-start gap-0.5 hover:bg-depth-1 focus:bg-depth-1"
        >
          <span className="text-sm font-medium leading-none">
            {t(page.titleKey)}
          </span>
          <span className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {t(page.descriptionKey)}
          </span>
        </NavigationMenuLink>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  const mobileLink = (href: string, label: string, key: string) => (
    <Link
      key={key}
      href={href}
      onClick={() => setMobileOpen(false)}
      className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-depth-1"
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex w-full max-w-6xl items-center px-6 py-4">
        <Link
          href="/"
          className="font-heading text-lg font-bold tracking-tight"
        >
          Vivotiv
        </Link>

        {/* Desktop navigation */}
        <nav aria-label={t("primaryNav")} className="ml-4 hidden items-center gap-1 md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm">
                  {t("compliance")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <DropdownLinks pages={compliancePages} t={t} />
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm">
                  {t("websiteProblems")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <DropdownLinks pages={websiteProblemPages} t={t} />
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  render={<Link href="/how-scan-works" />}
                  className="text-sm"
                >
                  {t("howScanWorks")}
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <a
          href="#scan"
          className="ml-auto hidden h-7 items-center rounded-[min(var(--radius-md),12px)] bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground transition-all hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:inline-flex"
        >
          {t("scanCta")}
        </a>

        {/* Mobile navigation */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <a
            href="#scan"
            className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground transition-all hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("scanCta")}
          </a>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label={t("mobileMenu")}
              className="inline-flex h-7 w-7 items-center justify-center rounded-[min(var(--radius-md),12px)] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <MenuIcon className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Vivotiv</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                <span className="px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("compliance")}
                </span>
                {compliancePages.map((page) => mobileLink(`/${page.slug}`, t(page.titleKey), page.slug))}

                <hr className="my-3 border-border" />

                <span className="px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("websiteProblems")}
                </span>
                {websiteProblemPages.map((page) => mobileLink(`/${page.slug}`, t(page.titleKey), page.slug))}

                <hr className="my-3 border-border" />

                <span className="px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("resources")}
                </span>
                {mobileLink("/how-scan-works", t("howScanWorks"))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
