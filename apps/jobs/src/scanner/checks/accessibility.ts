import type { Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import type { CheckResult } from "@vivotiv/shared";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const IMPACT_TO_WEIGHT: Record<string, 1 | 2 | 3> = {
  critical: 3,
  serious: 2,
  moderate: 1,
  minor: 1,
};

export interface AccessibilityResults {
  violations: CheckResult[];
  incomplete: CheckResult[];
  passCount: number;
  error?: string;
}

const VIOLATION_PENALTY: Record<string, number> = {
  critical: 15,
  serious: 10,
  moderate: 5,
  minor: 2,
};

type AxeNode = { target: string[] };

type AxeRule = {
  id: string;
  help: string;
  description: string;
  impact: string | null;
  nodes: AxeNode[];
};

type AxeResultSubset = {
  violations: AxeRule[];
  incomplete: AxeRule[];
  passes: unknown[];
};

async function runAxe(page: Page): Promise<AxeResultSubset> {
  return (await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .options({
      resultTypes: ["violations", "incomplete", "passes"],
      iframes: false,
    })
    .analyze()) as AxeResultSubset;
}

function mergeRules(rules: AxeRule[]): AxeRule[] {
  const byId = new Map<string, AxeRule>();

  for (const rule of rules) {
    const existing = byId.get(rule.id);
    if (!existing) {
      byId.set(rule.id, {
        ...rule,
        nodes: [...rule.nodes],
      });
      continue;
    }

    const targetSet = new Set(existing.nodes.map((n) => n.target.join(" > ")));
    for (const node of rule.nodes) {
      const key = node.target.join(" > ");
      if (!targetSet.has(key)) {
        existing.nodes.push(node);
        targetSet.add(key);
      }
    }
  }

  return [...byId.values()];
}

export async function extractAccessibilityChecks(
  page: Page,
): Promise<AccessibilityResults> {
  const desktopResults = await runAxe(page);

  let mobileResults: AxeResultSubset | null = null;
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    mobileResults = await runAxe(page);
  } catch {
    // Keep desktop-only results if viewport resize or rerun fails.
  }

  const violationsInput = mergeRules([
    ...desktopResults.violations,
    ...(mobileResults?.violations ?? []),
  ]);
  const incompleteInput = mergeRules([
    ...desktopResults.incomplete,
    ...(mobileResults?.incomplete ?? []),
  ]);

  const violations: CheckResult[] = [];

  for (const violation of violationsInput) {
    const weight = IMPACT_TO_WEIGHT[violation.impact ?? "moderate"] ?? 1;
    const penalty = VIOLATION_PENALTY[violation.impact ?? "moderate"] ?? 5;
    const nodeCount = violation.nodes.length;
    const targets = violation.nodes
      .slice(0, 10)
      .map((node) => node.target.join(" > "));
    const overflow = nodeCount > 10 ? [`... and ${nodeCount - 10} more`] : [];

    violations.push({
      id: violation.id,
      name: violation.help,
      status: "fail",
      score: 0,
      value: `${nodeCount} element${nodeCount === 1 ? "" : "s"} (-${penalty * nodeCount}pts)`,
      rawValue: nodeCount,
      rawUnit: "element",
      scoreThresholds: null,
      weight,
      description: `Impact: ${violation.impact ?? "moderate"}. ${violation.description}`,
      items: targets.length > 0 ? [...targets, ...overflow] : null,
    });
  }

  const incomplete: CheckResult[] = [];

  for (const item of incompleteInput) {
    const weight = IMPACT_TO_WEIGHT[item.impact ?? "moderate"] ?? 1;
    const nodeCount = item.nodes.length;
    const targets = item.nodes
      .slice(0, 10)
      .map((node) => node.target.join(" > "));
    const overflow = nodeCount > 10 ? [`... and ${nodeCount - 10} more`] : [];

    incomplete.push({
      id: item.id,
      name: item.help,
      status: "warn",
      score: null,
      value: `${nodeCount} element${nodeCount === 1 ? "" : "s"} need review`,
      rawValue: nodeCount,
      rawUnit: "element",
      scoreThresholds: null,
      weight,
      description: item.description,
      items: targets.length > 0 ? [...targets, ...overflow] : null,
    });
  }

  return {
    violations,
    incomplete,
    passCount: desktopResults.passes.length + (mobileResults?.passes.length ?? 0),
  };
}
