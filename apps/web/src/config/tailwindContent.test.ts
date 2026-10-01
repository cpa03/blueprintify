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

/** Markers the config's negation patterns are expected to carry, per scanned root. */
const TEST_FILE_PATTERN_MARKER = "{test,spec}";
const TEST_DIR_MARKER = "__tests__";

/** Roots a positive content pattern is expected to scan. */
const EXPECTED_ROOTS = ["apps/web/src", "packages/shared/src"];

function readContentPatterns(tailwindConfig: Config): string[] {
  const { content } = tailwindConfig;
  if (typeof content === "string") return [content];
  if (!Array.isArray(content)) {
    throw new Error("tailwind.config content must be a string or string[] for this guard");
  }
  return content.filter((pattern): pattern is string => typeof pattern === "string");
}

const contentPatterns = readContentPatterns(config);
// Patterns are matched as POSIX regardless of the platform that produced them.
const normalizedPatterns = contentPatterns.map((pattern) => pattern.replace(/\\/g, "/"));
const positivePatterns = normalizedPatterns.filter((pattern) => !pattern.startsWith("!"));
const negationPatterns = normalizedPatterns
  .filter((pattern) => pattern.startsWith("!"))
  .map((pattern) => pattern.slice(1));

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

  // Neither tsconfig (allowJs/checkJs are off, include is src/**/*) nor ESLint
  // (ignores **/*.config.js) type-checks the .js that tailwind.config.d.ts describes, so
  // this is the only cheap check that the declaration has not drifted from the real export.
  it("loads the config with the shape the declaration promises", () => {
    expect(config.darkMode).toBe("class");
    expect(Array.isArray(config.plugins)).toBe(true);
    expect(readContentPatterns(config)).toEqual(contentPatterns);
  });

  it("emits classes whose only production source is @blueprint/shared", () => {
    for (const selector of SHARED_ONLY_CLASSES) {
      expect(css).toContain(`.${selector}`);
    }
  });

  it("supplies shared tokens from source, not from web test fixtures", () => {
    // CHAR_COUNTER_COLORS.WARNING is also spelled out in CharacterCounter.test.tsx and
    // StepInfo.test.tsx. While those fixtures are in the scan the class is still emitted,
    // so only the scanned file set distinguishes the two states.
    expect(scannedFiles).toContain("packages/shared/src/config/validation.ts");
    expect(scannedFiles).toContain("packages/shared/src/config/ui.ts");
  });

  it("scans no test files", () => {
    expect(scannedFiles.filter((file) => /\.(test|spec)\./.test(file))).toEqual([]);
  });

  it("declares test-file and __tests__ exclusions for every scanned root", () => {
    for (const root of EXPECTED_ROOTS) {
      const forRoot = negationPatterns.filter((pattern) => pattern.includes(`/${root}/`));
      expect(forRoot.some((pattern) => pattern.includes(TEST_FILE_PATTERN_MARKER))).toBe(true);
      expect(forRoot.some((pattern) => pattern.includes(TEST_DIR_MARKER))).toBe(true);
    }
  });

  it("scans no __tests__ directory", () => {
    // Vacuous while no __tests__ directory exists in either tree, which is why the
    // declaration above is asserted structurally and not only through this check.
    expect(scannedFiles.filter((file) => file.includes(TEST_DIR_MARKER))).toEqual([]);
  });

  it("has exclusions that actually shrink the scanned set", () => {
    // Refutes a negation that reads correctly but is a no-op at glob time.
    expect(scannedFiles.length).toBeLessThan(fg.sync(positivePatterns).length);
  });
});
