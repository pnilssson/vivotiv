import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import type { Result } from "lighthouse";
import {
  throttling,
  screenEmulationMetrics,
} from "lighthouse/core/config/constants.js";

const CHROME_FLAGS = [
  "--headless=new",
  "--disable-gpu",
  "--disable-dev-shm-usage",
];

// Temporary hardcoded override for Railway compatibility testing.
const DISABLE_CHROME_SANDBOX = true;
const LIGHTHOUSE_TIMEOUT_MS = 120_000;

const DESKTOP_CONFIG = {
  extends: "lighthouse:default" as const,
  settings: {
    formFactor: "desktop" as const,
    throttling: throttling.desktopDense4G,
    screenEmulation: screenEmulationMetrics.desktop,
  },
};

export type LighthouseResult = Result;

export async function runLighthouse(
  url: string,
  categories: string[],
): Promise<LighthouseResult> {
  const chromeFlags = DISABLE_CHROME_SANDBOX
    ? [...CHROME_FLAGS, "--no-sandbox"]
    : CHROME_FLAGS;

  const chrome = await chromeLauncher.launch({ chromeFlags });
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  try {
    const result = (await Promise.race([
      lighthouse(
        url,
        {
          port: chrome.port,
          output: "json",
          logLevel: "error",
          onlyCategories: categories,
        },
        DESKTOP_CONFIG,
      ),
      new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(
            new Error(
              `Lighthouse timed out after ${LIGHTHOUSE_TIMEOUT_MS / 1000}s for ${url}`,
            ),
          );
        }, LIGHTHOUSE_TIMEOUT_MS);
      }),
    ])) as Awaited<ReturnType<typeof lighthouse>>;

    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }

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
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
    chrome.kill();
  }
}
