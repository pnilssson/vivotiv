import { SiteHeader } from "@/features/landing/site-header";
import { SiteFooter } from "@/features/landing/site-footer";

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <article className="space-y-6 text-sm leading-relaxed text-foreground [&_h1]:font-heading [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h2]:font-heading [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/80 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-xs [&_th]:font-medium [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-xs [&_td]:text-muted-foreground">
            {children}
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
