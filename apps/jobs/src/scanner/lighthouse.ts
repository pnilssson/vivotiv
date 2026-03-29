import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import type { Result } from "lighthouse";

const CHROME_FLAGS = [
  "--headless",
  "--no-sandbox",
  "--disable-gpu",
  "--disable-dev-shm-usage",
];

export type LighthouseResult = Result;

export async function runLighthouse(
  url: string,
  categories: string[],
): Promise<LighthouseResult> {
  const chrome = await chromeLauncher.launch({ chromeFlags: CHROME_FLAGS });

  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: categories,
    });

    if (!result) {
      throw new Error(`Lighthouse returned no result for ${url}`);
    }

    if (result.lhr.runtimeError) {
      throw new Error(
        `Lighthouse runtime error: ${result.lhr.runtimeError.message}`,
      );
    }

    return result.lhr;
  } finally {
    chrome.kill();
  }
}
