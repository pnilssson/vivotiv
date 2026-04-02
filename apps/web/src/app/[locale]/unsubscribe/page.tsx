import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

import { SiteFooter } from "@/features/landing/site-footer";
import { SiteHeader } from "@/features/landing/site-header";
import { loadUnsubscribeSearchParams } from "@/features/unsubscribe/unsubscribe-search-params";
import { UnsubscribeForm } from "@/features/unsubscribe/unsubscribe-form";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type UnsubscribePageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { token } = await loadUnsubscribeSearchParams(searchParams);

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[70dvh] flex-col items-center justify-center px-6">
        {token ? (
          <UnsubscribeForm token={token} />
        ) : (
          <p className="text-lg text-muted-foreground">Ogiltig länk.</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
