/**
 * Tailwind content-glob guard.
 *
 * `npm run build` exits 0 whether or not the `content` globs reach
 * `packages/shared`, so a broken glob ships an unstyled app behind a green build. The
 * only reliable check is to compile the real config and assert the classes whose only
 * production source is @blueprint/shared survive JIT's purge.
 */

import fs from "node:fs";
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
const TEST_DIR_MARKER = "{test,tests,__tests__,integration}";

/** Matches the test-only directories that marker negates, in a repo-relative scanned path. */
const TEST_DIR_SEGMENTS = /(^|\/)(test|tests|__tests__|integration)\//;

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

/**
 * Characters fast-glob treats as escapable, so a `\` before one of them is an escape rather
 * than a separator. Mirrors the escape sets in fast-glob's escapePath/convertPathToPattern.
 */
const ESCAPABLE = "()[]{}!*+?@|\\/<>";

// The lookahead captures the next character without consuming it, so a separator backslash
// becomes "/" and the character after it survives (`\P` -> `/P`, not `/`).
const toPosixGlob = (pattern: string): string =>
  pattern.replace(/\\(?=(.))/g, (_match, next: string) => (ESCAPABLE.includes(next) ? "\\" : "/"));

// Do not simplify this to replace(/\\/g, "/"): that also rewrites the escape backslashes
// escapePath adds for glob metacharacters, so on a checkout under "Program Files (x86)" the
// prefix `…/\(x\)/apps/web/src` becomes `…/(x/)/apps/web/src` and fg.sync below would count
// a file set the config does not actually scan.

const contentPatterns = readContentPatterns(config);
const normalizedPatterns = contentPatterns.map(toPosixGlob);
const positivePatterns = normalizedPatterns.filter((pattern) => !pattern.startsWith("!"));
const negationPatterns = normalizedPatterns
  .filter((pattern) => pattern.startsWith("!"))
  .map((pattern) => pattern.slice(1));

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const repoRoot = path.resolve(appDir, "../..");
const toRepoPosix = (file: string): string =>
  path.relative(repoRoot, file).split(path.sep).join("/");
const scannedFiles = fg.sync(contentPatterns).map(toRepoPosix);

const RESOLVABLE_EXTENSIONS = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx"];

const resolveRelative = (fromFile: string, specifier: string): string =>
  RESOLVABLE_EXTENSIONS.map((extension) =>
    path.resolve(path.dirname(fromFile), specifier + extension)
  ).find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? "";

const importSpecifiers = (file: string): string[] => {
  if (!/\.[jt]sx?$/.test(file)) return [];
  const source = fs.readFileSync(file, "utf8");
  return [...source.matchAll(/(?:from|import)\s+["'](\.[^"']*)["']/g)].map(
    (match) => match[1] ?? ""
  );
};

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
  // nothing else would notice the declaration losing its Config type. This checks the
  // declaration's own shape; it cannot type-check it against the export.
  it("matches the hand-written declaration shipped beside it", () => {
    expect(config.darkMode).toBe("class");
    expect(Array.isArray(config.plugins)).toBe(true);
    const declaration = fs.readFileSync(path.join(appDir, "tailwind.config.d.ts"), "utf8");
    expect(declaration).toContain('import type { Config } from "tailwindcss"');
    expect(declaration).toContain("declare const config: Config");
    expect(declaration).toContain("export default config");
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

  it("scans no test files or test-only directories", () => {
    expect(scannedFiles.filter((file) => /\.(test|spec)\./.test(file))).toEqual([]);
    expect(scannedFiles.filter((file) => TEST_DIR_SEGMENTS.test(file))).toEqual([]);
  });

  it("declares test-file and test-directory exclusions for every scanned root", () => {
    for (const root of EXPECTED_ROOTS) {
      const forRoot = negationPatterns.filter((pattern) => pattern.includes(`/${root}/`));
      expect(forRoot.some((pattern) => pattern.includes(TEST_FILE_PATTERN_MARKER))).toBe(true);
      expect(forRoot.some((pattern) => pattern.includes(TEST_DIR_MARKER))).toBe(true);
    }
  });

  it("has exclusions that actually shrink the scanned set", () => {
    // Refutes a negation that reads correctly but is a no-op at glob time.
    expect(scannedFiles.length).toBeLessThan(fg.sync(positivePatterns).length);
  });

  it("normalises separators without destroying escape sequences", () => {
    const native = "C:\\Program Files (x86)\\repo\\apps\\web\\src";
    expect(toPosixGlob(native)).toBe("C:/Program Files (x86)/repo/apps/web/src");
    // Escape pairs escapePath emits must survive normalisation intact.
    const escaped = "/repo/Program Files \\(x86\\)/apps/web/src/**/*.{js,ts}";
    expect(toPosixGlob(escaped)).toBe(escaped);
    expect(toPosixGlob("/repo/\\[id\\]/**")).toBe("/repo/\\[id\\]/**");
  });

  it("excludes no module that a production file imports", () => {
    // The directory negation is the one that can silently drop a *production* module, because
    // it keys off a directory name rather than a test filename. Close that hole here: every
    // file it drops is reachable only from test files, so a helper that production code starts
    // importing becomes a red test instead of a silently purged class.
    const inScope = fg.sync(positivePatterns);
    const excluded = inScope
      .map(toRepoPosix)
      .filter((file) => !scannedFiles.includes(file) && !/\.(test|spec)\./.test(file));
    expect(excluded.length).toBeGreaterThan(0);

    const production = inScope.filter((file) => !/\.(test|spec)\./.test(file));
    for (const module of excluded) {
      const importers = production.filter((file) =>
        importSpecifiers(file).some(
          (specifier) => toRepoPosix(resolveRelative(file, specifier)) === module
        )
      );
      expect(importers, `${module} is imported by production code`).toEqual([]);
    }
  });

  it("scans no test-only module that lacks a test filename suffix", () => {
    // Would be vacuous without the directory negations: setup.ts and factories.ts are the
    // only such files today, so dropping the glob puts exactly these two back in the scan.
    expect(scannedFiles).not.toContain("apps/web/src/test/setup.ts");
    expect(scannedFiles).not.toContain("apps/web/src/integration/factories.ts");
  });
});
