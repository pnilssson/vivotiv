"use client";

import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";

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
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";

const contentPages = [
  {
    slug: "accessibility",
    titleKey: "accessibility",
    descriptionKey: "accessibilityDescription",
  },
  {
    slug: "privacy-compliance",
    titleKey: "privacyCompliance",
    descriptionKey: "privacyComplianceDescription",
  },
  {
    slug: "how-scan-works",
    titleKey: "howScanWorks",
    descriptionKey: "howScanWorksDescription",
  },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");

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
                  {t("resources")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[320px] gap-1 p-1">
                    {contentPages.map((page) => (
                      <li key={page.slug}>
                        <NavigationMenuLink
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
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
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
          <Sheet>
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
                {contentPages.map((page) => (
                  <SheetClose
                    key={page.slug}
                    render={<Link href={`/${page.slug}`} />}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-depth-1"
                  >
                    {t(page.titleKey)}
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
