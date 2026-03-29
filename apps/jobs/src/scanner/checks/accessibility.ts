import type { Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import type { CheckResult } from "@vivotiv/shared";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const IMPACT_TO_WEIGHT: Record<string, 1 | 2 | 3> = {
  critical: 3,
  serious: 2,
  moderate: 1,
  minor: 1,
};

export interface AccessibilityResults {
  metrics: CheckResult[];
}

export async function extractAccessibilityChecks(
  page: Page,
): Promise<AccessibilityResults> {
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();

  const metrics: CheckResult[] = [];

  for (const violation of results.violations) {
    const weight = IMPACT_TO_WEIGHT[violation.impact ?? "moderate"] ?? 1;
    const targets = violation.nodes
      .slice(0, 10)
      .map((node) => node.target.join(" > "));

    metrics.push({
      id: violation.id,
      name: violation.help,
      status: "fail",
      score: 0,
      value: `${violation.nodes.length} element${violation.nodes.length === 1 ? "" : "s"}`,
      rawValue: violation.nodes.length,
      rawUnit: "element",
      scoreThresholds: null,
      weight,
      description: violation.description,
      items: targets.length > 0 ? targets : null,
    });
  }

  for (const incomplete of results.incomplete) {
    const weight = IMPACT_TO_WEIGHT[incomplete.impact ?? "moderate"] ?? 1;
    const targets = incomplete.nodes
      .slice(0, 10)
      .map((node) => node.target.join(" > "));

    metrics.push({
      id: incomplete.id,
      name: incomplete.help,
      status: "warn",
      score: 50,
      value: `${incomplete.nodes.length} element${incomplete.nodes.length === 1 ? "" : "s"} need review`,
      rawValue: incomplete.nodes.length,
      rawUnit: "element",
      scoreThresholds: null,
      weight,
      description: incomplete.description,
      items: targets.length > 0 ? targets : null,
    });
  }

  for (const pass of results.passes) {
    metrics.push({
      id: pass.id,
      name: pass.help,
      status: "pass",
      score: 100,
      value: null,
      rawValue: null,
      rawUnit: null,
      scoreThresholds: null,
      weight: 1,
      description: pass.description,
      items: null,
    });
  }

  return { metrics };
}
