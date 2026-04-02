import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components";
import type { ScanCategoryKey } from "@vivotiv/shared";

type CategoryScore = {
  key: ScanCategoryKey;
  score: number | null;
};

type ScanCompleteEmailProps = {
  url: string;
  overallScore: number;
  categoryScores: CategoryScore[];
  resultsUrl: string;
};

const categoryLabels: Record<ScanCategoryKey, string> = {
  performance: "Performance",
  seo: "SEO",
  accessibility: "Accessibility",
  trustSecurity: "Trust & Security",
  standards: "Website Quality",
  aiReadiness: "AI Readiness",
};

function scoreColor(score: number): string {
  if (score >= 90) return "#059669";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function scoreBgClass(score: number): string {
  if (score >= 90) return "bg-[#059669]";
  if (score >= 50) return "bg-[#f59e0b]";
  return "bg-[#ef4444]";
}

function scoreColorClass(score: number): string {
  if (score >= 90) return "text-[#059669]";
  if (score >= 50) return "text-[#f59e0b]";
  return "text-[#ef4444]";
}

function stripUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

const tailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      fontFamily: {
        heading:
          "'Space Grotesk', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        sans: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      },
      colors: {
        bg: "#f8f7f4",
        card: "#f2f0eb",
        border: "#e2dfda",
        muted: "#f5f5f5",
        "muted-fg": "#666666",
        fg: "#1a1a1a",
      },
    },
  },
};

export function ScanCompleteEmail({
  url,
  overallScore,
  categoryScores,
  resultsUrl,
}: ScanCompleteEmailProps) {
  const domain = stripUrl(url);

  return (
    <Html>
      <Tailwind config={tailwindConfig}>
        <Head>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap');
          `}</style>
        </Head>
        <Preview>{`${domain} scored ${overallScore} across 6 categories`}</Preview>
        <Body className="m-0 bg-bg p-0 font-sans">
          <Container className="mx-auto max-w-[560px] py-[40px]">
            {/* Main card */}
            <Section className="border border-border bg-card px-[32px] pb-[32px] pt-[24px]">
              {/* Hero */}
              <Text className="m-0 mb-[8px] text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-fg">
                Scan complete
              </Text>
              <Heading className="m-0 mb-[24px] text-center font-heading text-[24px] font-bold leading-tight text-fg">
                Results for {domain}
              </Heading>

              {/* Score circle */}
              <table cellPadding="0" cellSpacing="0" role="presentation" className="mx-auto">
                <tr>
                  <td align="center">
                    <div
                      className="inline-block h-[120px] w-[120px] rounded-full bg-bg text-center leading-[112px]"
                      style={{ border: `4px solid ${scoreColor(overallScore)}` }}
                    >
                      <span
                        className="font-heading text-[36px] font-bold"
                        style={{ color: scoreColor(overallScore) }}
                      >
                        {overallScore}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <Hr className="mx-0 mb-[24px] mt-[28px] border-t border-border" />

              {/* Category breakdown */}
              <Text className="m-0 mb-[16px] text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-fg">
                Category breakdown
              </Text>

              {categoryScores.map(({ key, score }) =>
                score !== null ? (
                  <Section key={key} className="mb-[12px]">
                    <Row>
                      <Column className="w-1/2 align-middle">
                        <Text className="m-0 text-[14px] font-medium text-fg">
                          {categoryLabels[key]}
                        </Text>
                      </Column>
                      <Column className="w-1/2 text-right align-middle">
                        <Text className={`m-0 text-[14px] font-semibold ${scoreColorClass(score)}`}>
                          {score}
                        </Text>
                      </Column>
                    </Row>
                    {/* Progress bar */}
                    <div className="mt-[6px] h-[6px] w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${scoreBgClass(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </Section>
                ) : null,
              )}

              <Hr className="mx-0 mb-[24px] mt-[20px] border-t border-border" />

              {/* CTA */}
              <div className="text-center">
                <Text className="m-0 mb-[20px] text-[14px] leading-normal text-muted-fg">
                  View your full results with detailed findings per category.
                </Text>
                <Link
                  href={resultsUrl}
                  className="inline-block bg-fg px-[32px] py-[12px] text-[14px] font-semibold text-bg no-underline"
                >
                  View full report
                </Link>
              </div>
            </Section>

            {/* Footer */}
            <Section className="px-[32px] py-[24px] text-center">
              <Text className="m-0 text-[12px] leading-normal text-[#999999]">
                This email was sent by{" "}
                <Link href={resultsUrl} className="text-[#999999] underline">
                  Vivotiv
                </Link>{" "}
                because a scan was requested for {domain}.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
