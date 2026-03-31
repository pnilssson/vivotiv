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
  Text,
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
  legal: "EU Legal",
  security: "Security",
  standards: "Modern Standards",
};

function scoreColor(score: number): string {
  if (score >= 90) return "#059669";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function scoreLabel(score: number): string {
  if (score >= 90) return "Good";
  if (score >= 50) return "Needs work";
  return "Critical";
}

export function ScanCompleteEmail({
  url,
  overallScore,
  categoryScores,
  resultsUrl,
}: ScanCompleteEmailProps) {
  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap');
        `}</style>
      </Head>
      <Preview>{`Your website scored ${overallScore}/100 - View your full scan results`}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>Vivotiv</Text>
          </Section>

          {/* Hero */}
          <Section style={hero}>
            <Text style={pretitle}>Scan complete</Text>
            <Heading style={heading}>Your website score</Heading>

            {/* Score circle */}
            <table cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: "0 auto" }}>
              <tr>
                <td align="center">
                  <div style={scoreCircle(overallScore)}>
                    <span style={scoreNumber(overallScore)}>{overallScore}</span>
                    <span style={scoreMax}>/100</span>
                  </div>
                </td>
              </tr>
            </table>

            <Text style={urlLabel}>{url}</Text>
          </Section>

          <Hr style={divider} />

          {/* Category breakdown */}
          <Section style={breakdownSection}>
            <Text style={breakdownTitle}>Category breakdown</Text>

            {categoryScores.map(({ key, score }) =>
              score !== null ? (
                <Row key={key} style={categoryRow}>
                  <Column style={categoryNameCol}>
                    <Text style={categoryName}>{categoryLabels[key]}</Text>
                  </Column>
                  <Column style={categoryScoreCol}>
                    <Text style={categoryScoreText(score)}>
                      {score} - {scoreLabel(score)}
                    </Text>
                  </Column>
                </Row>
              ) : null,
            )}
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              View your full results with detailed findings per category.
            </Text>
            <Link href={resultsUrl} style={ctaButton}>
              View full report
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent by Vivotiv because a scan was requested for {url}.
            </Text>
            <Text style={footerText}>
              <Link href="https://vivotiv.com" style={footerLink}>vivotiv.com</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/*
 * Styles -- inline for email client compatibility.
 * Colors match the Vivotiv landing page design system.
 */

const fontStack =
  "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const headingFontStack =
  "'Space Grotesk', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const body: React.CSSProperties = {
  backgroundColor: "#f7f6f3",
  fontFamily: fontStack,
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px 0",
};

const header: React.CSSProperties = {
  padding: "24px 32px",
  backgroundColor: "#ffffff",
};

const logoText: React.CSSProperties = {
  fontFamily: headingFontStack,
  fontSize: "18px",
  fontWeight: 700,
  color: "#1a1a1a",
  margin: 0,
};

const hero: React.CSSProperties = {
  padding: "32px 32px 24px",
  backgroundColor: "#ffffff",
  textAlign: "center" as const,
};

const pretitle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "#666666",
  margin: "0 0 8px",
};

const heading: React.CSSProperties = {
  fontFamily: headingFontStack,
  fontSize: "28px",
  fontWeight: 700,
  color: "#1a1a1a",
  margin: "0 0 24px",
  lineHeight: 1.2,
};

function scoreCircle(score: number): React.CSSProperties {
  return {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: `4px solid ${scoreColor(score)}`,
    display: "inline-block",
    textAlign: "center" as const,
    lineHeight: "112px",
  };
}

function scoreNumber(score: number): React.CSSProperties {
  return {
    fontFamily: headingFontStack,
    fontSize: "36px",
    fontWeight: 700,
    color: scoreColor(score),
  };
}

const scoreMax: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 400,
  color: "#666666",
};

const urlLabel: React.CSSProperties = {
  fontSize: "13px",
  color: "#666666",
  margin: "16px 0 0",
};

const divider: React.CSSProperties = {
  borderTop: "1px solid #e5e4e0",
  margin: 0,
};

const breakdownSection: React.CSSProperties = {
  padding: "24px 32px",
  backgroundColor: "#ffffff",
};

const breakdownTitle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "#666666",
  margin: "0 0 16px",
};

const categoryRow: React.CSSProperties = {
  marginBottom: "12px",
};

const categoryNameCol: React.CSSProperties = {
  width: "50%",
  verticalAlign: "middle" as const,
};

const categoryName: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#1a1a1a",
  margin: 0,
};

const categoryScoreCol: React.CSSProperties = {
  width: "50%",
  textAlign: "right" as const,
  verticalAlign: "middle" as const,
};

function categoryScoreText(score: number): React.CSSProperties {
  return {
    fontSize: "14px",
    fontWeight: 600,
    color: scoreColor(score),
    margin: 0,
  };
}

const ctaSection: React.CSSProperties = {
  padding: "24px 32px 32px",
  backgroundColor: "#ffffff",
  textAlign: "center" as const,
};

const ctaText: React.CSSProperties = {
  fontSize: "14px",
  color: "#444444",
  margin: "0 0 20px",
  lineHeight: 1.5,
};

const ctaButton: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#1a1a1a",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  padding: "12px 32px",
  textDecoration: "none",
};

const footer: React.CSSProperties = {
  padding: "24px 32px",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#999999",
  margin: "0 0 4px",
  lineHeight: 1.5,
};

const footerLink: React.CSSProperties = {
  color: "#999999",
  textDecoration: "underline",
};
