/**
 * Tailwind content-glob guard.
 *
 * `npm run build` exits 0 whether or not the `content` globs reach
 * `packages/shared`, so a broken glob ships an unstyled app behind a green build. The
 * only reliable check is to compile the real config and assert the classes whose only
 * production source is @blueprint/shared survive JIT's purge.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import fg from "fast-glob";
import postcss from "postcss";
import tailwindcss, { type Config } from "tailwindcss";

import config from "../../tailwind.config";

/** TOAST_STYLES.WARNING (config/ui.ts) and CHAR_COUNTER_COLORS.WARNING (config/validation.ts) */
const SHARED_ONLY_CLASSES = [
  "bg-yellow-500\\/10",
  "border-yellow-500\\/30",
  "text-yellow-400",
  "text-yellow-500",
];

/** Utilities reachable only from test fixtures or test prose. */
const TEST_ONLY_CLASSES = ["isolate", "text-red-500"];

function readContentPatterns(tailwindConfig: Config): string[] {
  const { content } = tailwindConfig;
  if (typeof content === "string") return [content];
  if (!Array.isArray(content)) {
    throw new Error("tailwind.config content must be a string or string[] for this guard");
  }
  return content.filter((pattern): pattern is string => typeof pattern === "string");
}

const contentPatterns = readContentPatterns(config);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const scannedFiles = fg.sync(contentPatterns).map((file) => path.relative(repoRoot, file));

describe("tailwind content globs", () => {
  let css: string;

  beforeAll(async () => {
    const result = await postcss([tailwindcss(config)]).process("@tailwind utilities;", {
      from: undefined,
    });
    css = result.css;
  }, 60_000);

  it("emits classes whose only production source is @blueprint/shared", () => {
    for (const selector of SHARED_ONLY_CLASSES) {
      expect(css).toContain(`.${selector}`);
    }
  });

  it("does not emit rules sourced from test fixtures or test prose", () => {
    for (const selector of TEST_ONLY_CLASSES) {
      expect(css).not.toContain(`.${selector}`);
    }
  });

  it("scans @blueprint/shared source so shared tokens are not fixture-dependent", () => {
    // CHAR_COUNTER_COLORS.WARNING is also spelled out in CharacterCounter.test.tsx and
    // StepInfo.test.tsx. If those fixtures become the only thing keeping the class
    // alive, the character counter silently loses its warning colour in production.
    expect(scannedFiles).toContain("packages/shared/src/config/validation.ts");
    expect(scannedFiles.filter((file) => /\.(test|spec)\./.test(file))).toEqual([]);
  });

  it("excludes test files from every scanned root", () => {
    expect(contentPatterns).toEqual(
      expect.arrayContaining([expect.stringContaining("packages/shared/src")])
    );

    const negations = contentPatterns.filter((pattern) => pattern.startsWith("!"));
    for (const root of ["apps/web/src", "packages/shared/src"]) {
      const rootNegations = negations.filter((pattern) => pattern.includes(root));
      expect(rootNegations.some((pattern) => pattern.includes(".{test,spec}."))).toBe(true);
      expect(rootNegations.some((pattern) => pattern.includes("__tests__"))).toBe(true);
    }
  });
});
