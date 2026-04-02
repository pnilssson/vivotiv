import type { CategoryResult, CheckResult, ScanCategoryKey } from "@vivotiv/shared";

type Finding = {
  category: string;
  finding: string;
  detail: string;
  businessImpact: string;
};

const categoryPriority: ScanCategoryKey[] = [
  "legal",
  "accessibility",
  "performance",
  "seo",
  "security",
  "standards",
];

const categoryLabels: Record<ScanCategoryKey, string> = {
  legal: "Trust & Compliance",
  accessibility: "Accessibility",
  performance: "Performance",
  seo: "SEO",
  security: "Security",
  standards: "Website Quality",
};

const businessImpacts: Record<ScanCategoryKey, string> = {
  legal:
    "IMY har möjlighet att utfärda sanktionsavgifter vid GDPR-brister. EU:s tillgänglighetsdirektiv (EAA) trädde i kraft 28 juni 2025.",
  accessibility:
    "EU:s tillgänglighetsdirektiv (EAA) ställer krav på digital tillgänglighet sedan 28 juni 2025. Bristande tillgänglighet utesluter även besökare med funktionsnedsättningar.",
  performance:
    "Google rekommenderar en laddtid under 2.5 sekunder. Långsamma sajter tappar besökare.",
  seo:
    "Utan synlighet i Google hittar potentiella kunder andra alternativ.",
  security:
    "Webbläsare visar varningar för sajter med säkerhetsbrister, vilket påverkar besökarnas förtroende.",
  standards:
    "Brutna länkar och valideringsfel påverkar både intrycket och sökmotorrankning.",
};

function summarizeFailedChecks(category: CategoryResult): string {
  const failed = [
    ...category.metrics,
    ...category.opportunities,
    ...category.diagnostics,
  ].filter((c): c is CheckResult => c.status === "fail" || c.status === "warn");

  if (failed.length === 0) return "";

  return failed
    .slice(0, 3)
    .map((c) => {
      if (c.value) return `${c.name}: ${c.value}`;
      return c.name;
    })
    .join(", ");
}

type CategoryScores = Partial<Record<ScanCategoryKey, CategoryResult | null>>;

export function selectFindings(
  categories: CategoryScores,
  maxFindings = 3,
): Finding[] {
  const findings: Finding[] = [];

  for (const key of categoryPriority) {
    if (findings.length >= maxFindings) break;

    const category = categories[key];
    if (!category || category.score >= 70) continue;

    const detail = summarizeFailedChecks(category);
    if (!detail) continue;

    const scoreLabel = `${category.score}/100`;

    findings.push({
      category: categoryLabels[key],
      finding: `${categoryLabels[key]}: ${scoreLabel}`,
      detail,
      businessImpact: businessImpacts[key],
    });
  }

  return findings;
}
