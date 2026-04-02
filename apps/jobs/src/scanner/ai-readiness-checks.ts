import type { CheckResult } from "@vivotiv/shared";

import { buildCheck } from "./checks/build-check";

export interface AiReadinessHttpResults {
  checks: CheckResult[];
  /** Raw HTML text content for SSR comparison (used by aggregate) */
  rawTextContent: string | null;
}

const AI_SEARCH_BOTS = ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"];
const AI_TRAINING_BOTS = ["GPTBot", "ClaudeBot", "Google-Extended", "Bytespider", "CCBot", "Applebot-Extended", "meta-externalagent", "Amazonbot"];
const HTTP_TIMEOUT = 5_000;

export async function runAiReadinessHttpChecks(url: string): Promise<AiReadinessHttpResults> {
  const origin = new URL(url).origin;

  const entries: Array<{ id: string; promise: Promise<CheckResult> }> = [
    { id: "ai-crawler-access", promise: checkAiCrawlerAccess(origin) },
    { id: "ai-llms-txt", promise: checkLlmsTxt(origin) },
  ];

  const results = await Promise.allSettled(entries.map((e) => e.promise));

  const checks: CheckResult[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return errorCheck(entries[i].id, String(r.reason));
  });

  // SSR check: fetch raw HTML for content comparison (check built in aggregate)
  let rawTextContent: string | null = null;
  try {
    rawTextContent = await fetchRawTextContent(url);
  } catch {
    // Raw HTML fetch failed; aggregate will handle the missing data
  }

  return { checks, rawTextContent };
}

function errorCheck(id: string, reason: string): CheckResult {
  return {
    id,
    name: id,
    status: "error",
    score: null,
    value: reason,
    rawValue: null,
    rawUnit: null,
    scoreThresholds: null,
    weight: 1,
    description: "Check failed due to an error",
    items: null,
  };
}

// Check 1: AI Crawler Access (robots.txt)
async function checkAiCrawlerAccess(origin: string): Promise<CheckResult> {
  let robotsTxt: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT);
    const response = await fetch(`${origin}/robots.txt`, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.status !== 200) {
      // No robots.txt means everything is allowed by default
      return buildCheck(
        "ai-crawler-access",
        "AI Crawler Access",
        "warn",
        "No robots.txt found. AI crawlers are allowed by default, but the site has no explicit AI bot policy.",
        2,
        "Without a robots.txt, all AI crawlers can access your site. This is fine, but having explicit rules shows you have considered how AI interacts with your content.",
      );
    }

    robotsTxt = await response.text();
  } catch {
    return buildCheck(
      "ai-crawler-access",
      "AI Crawler Access",
      "warn",
      "Could not fetch robots.txt",
      2,
      "We could not reach your robots.txt file to check AI crawler access rules.",
    );
  }

  const rules = parseRobotsTxt(robotsTxt);

  const searchBlocked: string[] = [];
  const searchAllowed: string[] = [];
  const trainingBlocked: string[] = [];

  for (const bot of AI_SEARCH_BOTS) {
    if (isBotBlocked(rules, bot)) {
      searchBlocked.push(bot);
    } else {
      searchAllowed.push(bot);
    }
  }

  for (const bot of AI_TRAINING_BOTS) {
    if (isBotBlocked(rules, bot)) {
      trainingBlocked.push(bot);
    }
  }

  // Scoring: search crawlers are what matters
  if (searchBlocked.length === AI_SEARCH_BOTS.length) {
    return buildCheck(
      "ai-crawler-access",
      "AI Crawler Access",
      "fail",
      "All AI search crawlers are blocked",
      2,
      "Your site blocks every major AI search crawler. This means you will not appear in AI-powered search results from ChatGPT, Claude, or Perplexity.",
      [...searchBlocked.map((b) => `Blocked: ${b}`)],
    );
  }

  if (searchBlocked.length > 0) {
    return buildCheck(
      "ai-crawler-access",
      "AI Crawler Access",
      "warn",
      `${searchBlocked.length} of ${AI_SEARCH_BOTS.length} AI search crawlers blocked`,
      2,
      "Some AI search crawlers are blocked. You may be invisible in certain AI-powered search engines.",
      [
        ...searchBlocked.map((b) => `Blocked: ${b}`),
        ...searchAllowed.map((b) => `Allowed: ${b}`),
        ...(trainingBlocked.length > 0 ? [`${trainingBlocked.length} training crawler${trainingBlocked.length === 1 ? "" : "s"} blocked (no score impact)`] : []),
      ],
    );
  }

  const hasExplicitRules = AI_SEARCH_BOTS.some((bot) => rules.has(bot.toLowerCase())) ||
    AI_TRAINING_BOTS.some((bot) => rules.has(bot.toLowerCase()));

  if (!hasExplicitRules) {
    return buildCheck(
      "ai-crawler-access",
      "AI Crawler Access",
      "warn",
      "No explicit AI bot rules in robots.txt",
      2,
      "Your robots.txt has no rules for AI crawlers. All are allowed by default via wildcard, but your site has not made a deliberate choice about AI access.",
    );
  }

  const items: string[] = [
    ...searchAllowed.map((b) => `Allowed: ${b}`),
    ...(trainingBlocked.length > 0 ? [`${trainingBlocked.length} training crawler${trainingBlocked.length === 1 ? "" : "s"} blocked (no score impact)`] : []),
  ];

  return buildCheck(
    "ai-crawler-access",
    "AI Crawler Access",
    "pass",
    "AI search crawlers are allowed",
    2,
    "Your site allows AI search crawlers to access your content, making you visible in AI-powered search results.",
    items.length > 0 ? items : null,
  );
}

type RobotRules = Map<string, Array<{ type: "allow" | "disallow"; path: string }>>;

function parseRobotsTxt(content: string): RobotRules {
  const rules: RobotRules = new Map();
  let currentAgents: string[] = [];

  for (const rawLine of content.split("\n")) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) {
      currentAgents = [];
      continue;
    }

    const [directive, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const key = directive.toLowerCase().trim();

    if (key === "user-agent") {
      currentAgents.push(value.toLowerCase());
    } else if (key === "disallow" || key === "allow") {
      for (const agent of currentAgents) {
        if (!rules.has(agent)) rules.set(agent, []);
        rules.get(agent)!.push({ type: key as "allow" | "disallow", path: value });
      }
    }
  }

  return rules;
}

function isBotBlocked(rules: RobotRules, botName: string): boolean {
  // Check bot-specific rules first, then wildcard
  const botRules = rules.get(botName.toLowerCase()) ?? rules.get("*");
  if (!botRules) return false;

  // We only care about full-site blocks (Disallow: /).
  // An explicit Allow: / after a Disallow: / means the bot is allowed.
  let blocked = false;
  for (const rule of botRules) {
    if (rule.path === "/") {
      blocked = rule.type === "disallow";
    }
  }

  return blocked;
}

// Check 2: llms.txt
async function checkLlmsTxt(origin: string): Promise<CheckResult> {
  let status: number;
  let body: string;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT);
    const response = await fetch(`${origin}/llms.txt`, { signal: controller.signal });
    clearTimeout(timeout);
    status = response.status;
    body = await response.text();
  } catch {
    return buildCheck(
      "ai-llms-txt",
      "llms.txt",
      "warn",
      "Not found",
      1,
      "llms.txt is an emerging standard (844,000+ sites) that provides a structured summary of your site for AI consumption. Adding one is low-effort and signals AI-readiness.",
    );
  }

  if (status !== 200 || !body.trim()) {
    // Also check llms-full.txt for a bonus note
    return buildCheck(
      "ai-llms-txt",
      "llms.txt",
      "warn",
      "Not found",
      1,
      "llms.txt is an emerging standard (844,000+ sites) that provides a structured summary of your site for AI consumption. Adding one is low-effort and signals AI-readiness.",
    );
  }

  // Validate basic structure: should have an H1
  const hasH1 = /^#\s+.+/m.test(body);
  const lines = body.split("\n").filter((l) => l.trim()).length;

  if (!hasH1) {
    return buildCheck(
      "ai-llms-txt",
      "llms.txt",
      "warn",
      "Present but missing required H1 heading",
      1,
      "Your llms.txt exists but does not follow the specification. It should start with a Markdown H1 heading with your site or project name.",
    );
  }

  // Check for llms-full.txt
  let hasFullVariant = false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT);
    const fullResponse = await fetch(`${origin}/llms-full.txt`, { signal: controller.signal });
    clearTimeout(timeout);
    hasFullVariant = fullResponse.status === 200;
  } catch {
    // ignore
  }

  const value = hasFullVariant
    ? `Present (${lines} lines) + llms-full.txt`
    : `Present (${lines} lines)`;

  return buildCheck(
    "ai-llms-txt",
    "llms.txt",
    "pass",
    value,
    1,
    "Your site has a valid llms.txt file that helps AI systems understand your content structure.",
  );
}

async function fetchRawTextContent(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)",
    },
  });
  clearTimeout(timeout);

  const html = await response.text();

  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
