/**
 * index.html accessibility guard for the pre-hydration skeleton loader.
 *
 * `#skeleton-loader` is a decorative placeholder whose <header> brand bar
 * would otherwise sit in the accessibility tree as a phantom banner: it
 * disappears visually on mount (or at opacity:0 when JS never runs) while
 * screen readers would still announce it. aria-hidden="true" is the fix;
 * this guard fails if the attribute is ever dropped.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexHtml = fs.readFileSync(path.join(appDir, "index.html"), "utf8");

function getSkeletonLoaderTag(): string {
  const match = indexHtml.match(/<div\s[^>]*id="skeleton-loader"[^>]*>/);
  if (!match) {
    throw new Error('index.html must contain a <div id="skeleton-loader"> element');
  }
  return match[0];
}

describe("index.html skeleton loader accessibility", () => {
  it("marks #skeleton-loader aria-hidden so its banner stays out of the a11y tree", () => {
    expect(getSkeletonLoaderTag()).toContain('aria-hidden="true"');
  });
});
