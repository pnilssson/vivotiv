import type { CheckResult } from "@vivotiv/shared";

import { buildCheck } from "./build-check";

export async function checkBrokenLinks(
  url: string,
): Promise<CheckResult | null> {
  const { LinkChecker } = await import("linkinator");

  const checker = new LinkChecker();
  const brokenLinks: Array<{ url: string; status: number | undefined }> = [];
  let totalLinksChecked = 0;

  // Collect results as they're found (for partial results on timeout)
  checker.on("link", (result) => {
    totalLinksChecked++;
    if (result.state === "BROKEN") {
      brokenLinks.push({ url: result.url, status: result.status });
    }
  });

  const timeoutMs = 30_000;
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout>;

  try {
    const resultPromise = checker.check({
      path: url,
      recurse: false,
      concurrency: 10,
      timeout: 10_000,
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      timer = setTimeout(() => {
        timedOut = true;
        resolve(null);
      }, timeoutMs);
    });

    const result = await Promise.race([resultPromise, timeoutPromise]);
    clearTimeout(timer!);

    // Full timeout with no results at all
    if (result === null && totalLinksChecked === 0) {
      return null;
    }

    const allBroken =
      result !== null
        ? result.links.filter((l) => l.state === "BROKEN")
        : brokenLinks;

    const totalChecked =
      result !== null ? result.links.length : totalLinksChecked;

    if (allBroken.length === 0) {
      return buildCheck(
        "broken-links",
        "Broken Links",
        "pass",
        timedOut
          ? "No broken links found (partial scan)"
          : `All ${totalChecked} links working`,
        2,
        "Broken links frustrate visitors and signal to search engines that your site is not maintained.",
      );
    }

    const items = allBroken
      .slice(0, 10)
      .map((l) => `${l.status || "timeout"}: ${l.url}`);

    if (allBroken.length > 10) {
      items.push(`... and ${allBroken.length - 10} more`);
    }

    return buildCheck(
      "broken-links",
      "Broken Links",
      "fail",
      `${allBroken.length} broken link${allBroken.length === 1 ? "" : "s"} found${timedOut ? " (partial scan)" : ""}`,
      2,
      "Broken links frustrate visitors and signal to search engines that your site is not maintained.",
      items,
    );
  } catch {
    // Linkinator crashed entirely - skip this check
    clearTimeout(timer!);
    return null;
  }
}
