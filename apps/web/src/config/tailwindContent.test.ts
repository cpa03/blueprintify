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
import ts from "typescript";

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

/** The file set every reachability test walks: what the positive patterns reach minus what the negations drop. */
const inScopeFiles = fg.sync(positivePatterns);
const excludedFiles = inScopeFiles
  .map(toRepoPosix)
  .filter((file) => !scannedFiles.includes(file) && !/\.(test|spec)\./.test(file));
const excludedSet = new Set(excludedFiles);
const productionFiles = inScopeFiles.filter(
  (file) => !/\.(test|spec)\./.test(file) && !excludedSet.has(toRepoPosix(file))
);

const RESOLVABLE_SUFFIXES = [
  "",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
];

/**
 * Module specifiers a file actually pulls in, read from the AST rather than a regex: this repo
 * lazily imports local modules via `import("./x")` in ~18 production sites, and its JSDoc
 * convention writes example imports inside comments. A regex over raw source misses the former
 * and matches the latter, either of which makes this guard lie. TypeScript is already a
 * devDependency of this workspace.
 */
const importSpecifiers = (file: string): string[] => {
  if (!/\.[cm]?[jt]sx?$/.test(file)) return [];
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    false
  );
  const specifiers: string[] = [];
  const visit = (node: ts.Node): void => {
    // Only a type-only statement is erased at build time, so only it can neither contribute nor
    // lose a Tailwind class. Everything else — default, named, namespace, and side-effect
    // imports — loads the module at runtime and must count, so no other form is skipped here.
    if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      !isErasedImport(node)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }
    if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      !isErasedExport(node)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const [argument] = node.arguments;
      if (argument && ts.isStringLiteral(argument)) specifiers.push(argument.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return specifiers;
};

/**
 * True when the compiler erases the whole declaration, i.e. every binding it introduces is
 * type-only. Both the statement-level (`import type { A }`) and inline (`import { type A }`)
 * spellings are covered, and any surviving *value* binding disqualifies the statement — that
 * is what would load the module, so it must be counted. Order matters: `isTypeOnly` outranks
 * the default binding, because `import type Def from "./x"` binds a name but erases the module.
 */
function isErasedImport(node: ts.ImportDeclaration): boolean {
  const clause = node.importClause;
  if (!clause) return false; // `import "./x"` loads the module
  if (clause.isTypeOnly) return true;
  if (clause.name) return false; // default binding is a value binding
  const { namedBindings } = clause;
  if (!namedBindings) return false; // `import * as ns from "./x"`
  if (!ts.isNamedImports(namedBindings)) return false;
  return namedBindings.elements.length > 0 && namedBindings.elements.every((e) => e.isTypeOnly);
}

/** Mirror of isErasedImport for `export … from`, so `export { type A } from "./x"` is skipped too. */
function isErasedExport(node: ts.ExportDeclaration): boolean {
  if (node.isTypeOnly) return true;
  const clause = node.exportClause;
  if (!clause || !ts.isNamedExports(clause)) return false; // `export * from "./x"` is runtime
  return clause.elements.length > 0 && clause.elements.every((e) => e.isTypeOnly);
}

/**
 * TypeScript rewrites an ESM `.js` specifier to its `.ts` source, so a specifier ending in a
 * JS extension must also be tried with its TS counterparts — `packages/shared/src/config.ts`
 * imports `./config/core.js`, which is `config/core.ts` on disk.
 */
const TS_REWRITES: Record<string, string[]> = {
  ".js": [".ts", ".tsx"],
  ".jsx": [".tsx"],
  ".mjs": [".mts"],
  ".cjs": [".cts"],
};

/**
 * Path aliases read from the workspace tsconfig rather than hardcoded, so adding a second
 * alias cannot silently become an unchecked blind spot. `extends` is followed, and TypeScript's
 * own rule is applied: a `paths` map declared in a config *replaces* the inherited one outright
 * rather than merging into it. Targets are resolved to absolute paths against the file that
 * declares them, so an inherited entry keeps pointing where its author meant.
 */
interface AliasRule {
  prefix: string;
  targets: string[];
}

const readTsconfigPaths = (tsconfigFile: string): Record<string, string[]> => {
  const raw = fs.readFileSync(tsconfigFile, "utf8").replace(/^\s*\/\/.*$/gm, "");
  let parsed: { extends?: string; compilerOptions?: { paths?: Record<string, string[]> } };
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch (error) {
    throw new Error(`cannot parse ${tsconfigFile}: ${String(error)}`);
  }
  const declaringDir = path.dirname(tsconfigFile);
  const own = parsed.compilerOptions?.paths;
  if (own) {
    return Object.fromEntries(
      Object.entries(own).map(([pattern, targets]) => [
        pattern,
        (targets ?? []).map((target) => path.resolve(declaringDir, target)),
      ])
    );
  }
  if (!parsed.extends) return {};
  const parent = parsed.extends.endsWith(".json") ? parsed.extends : `${parsed.extends}.json`;
  return readTsconfigPaths(path.resolve(declaringDir, parent));
};

const readPathAliases = (): AliasRule[] =>
  Object.entries(readTsconfigPaths(path.join(appDir, "tsconfig.json"))).map(
    ([pattern, targets]) => ({
      prefix: pattern.replace(/\*$/, ""),
      targets: targets.map((target) => target.replace(/\*$/, "")),
    })
  );

const PATH_ALIASES = readPathAliases();

/**
 * Specifiers Vite resolves through its own pipeline: `?url`/`?raw`/`?inline`, `#hash` suffixes,
 * and asset extensions (`.png`, `.svg`, `.css`, fonts). Those files are never TypeScript
 * sources, so the resolver below does not model them — the reachability check filters them out
 * *before* asking, which is what keeps `resolveSpecifier`'s `null` meaning exactly one thing.
 */
const VITE_SPECIFIER =
  /[?#]|\.(png|jpe?g|gif|svg|webp|avif|ico|css|scss|woff2?|ttf|eot|mp4|webm)$/i;

/**
 * The on-disk file a relative or alias specifier names, or `null` when nothing does. Exactly
 * one question is answered here — "does this resolve?" — so `null` unambiguously means a
 * broken import. Vite-handled specifiers never reach this function; the caller filters them
 * on `VITE_SPECIFIER` first, so a miss here cannot be mistaken for an asset or vice versa.
 */
const resolveSpecifier = (fromFile: string, specifier: string): string | null => {
  // Longest prefix wins, as in TypeScript's own `paths` matching, so `@/foo/x` is never
  // claimed by a shorter `@/`-style rule that happens to be declared first.
  const matches = PATH_ALIASES.filter((rule) => specifier.startsWith(rule.prefix));
  const longest = matches.reduce((max, rule) => Math.max(max, rule.prefix.length), 0);
  // Every target of the winning pattern is probed in declaration order, so a multi-target
  // `paths` entry keeps its fallbacks instead of silently dropping all but the first.
  const aliasBases = matches
    .filter((rule) => rule.prefix.length === longest)
    .flatMap((rule) =>
      rule.targets.map((target) => path.resolve(target, specifier.slice(rule.prefix.length)))
    );
  const bases = matches.length
    ? aliasBases
    : specifier.startsWith(".")
      ? [path.resolve(path.dirname(fromFile), specifier)]
      : [];
  const isFile = (candidate: string): boolean =>
    fs.existsSync(candidate) && fs.statSync(candidate).isFile();
  for (const base of bases) {
    const extension = path.extname(base);
    // Stems are probed before the literal path because that is what TypeScript and Node ESM
    // do: when both `core.js` and `core.ts` exist, `./core.js` resolves to `core.ts`. A stem
    // already carries its own extension, so it is probed as-is rather than with suffixes.
    const stems = (TS_REWRITES[extension] ?? []).map(
      (rewrite) => base.slice(0, -extension.length) + rewrite
    );
    for (const stem of stems) {
      if (isFile(stem)) return stem;
    }
    for (const suffix of RESOLVABLE_SUFFIXES) {
      if (isFile(base + suffix)) return base + suffix;
    }
    for (const suffix of RESOLVABLE_SUFFIXES.filter(Boolean)) {
      const candidate = path.join(base, `index${suffix}`);
      if (isFile(candidate)) return candidate;
    }
  }
  return null;
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
    // Canary: an empty exclusion set means the directory negation was dropped or went inert and
    // this check would pass forever without testing anything.
    expect(
      excludedFiles,
      "no test-only module is being excluded, so this guard is vacuous"
    ).not.toEqual([]);

    for (const file of productionFiles) {
      for (const specifier of importSpecifiers(file)) {
        // A path alias from tsconfig `paths`, or a relative specifier, names a file on disk.
        // A bare specifier goes through package exports instead, which this resolver does not
        // model — see the wildcard-export test for why skipping those is safe.
        const isAlias = PATH_ALIASES.some((rule) => specifier.startsWith(rule.prefix));
        if (!isAlias && !specifier.startsWith(".")) continue;
        // Vite-handled specifiers are filtered *here*, before the call, so `null` below
        // can only mean "should resolve to a file on disk and does not".
        if (VITE_SPECIFIER.test(specifier)) continue;
        const resolvedPath = resolveSpecifier(file, specifier);
        if (resolvedPath === null) {
          throw new Error(
            `${specifier} in ${toRepoPosix(file)} does not resolve to a file on disk`
          );
        }
        expect(
          excludedFiles,
          `${specifier} in ${toRepoPosix(file)} is excluded from the scan`
        ).not.toContain(toRepoPosix(resolvedPath));
      }
    }
  });

  it("reads path aliases from the workspace tsconfig", () => {
    // An empty PATH_ALIASES would silently disable the alias leg of the reachability check
    // above — every `@/…` import would take the bare-specifier `continue` and never be tested.
    expect(
      PATH_ALIASES.length,
      "no path aliases were read from tsconfig, so the alias leg of the reachability check is inert"
    ).toBeGreaterThan(0);
  });

  it("exposes no wildcard subpath that a bare specifier could use to skip this guard", () => {
    // The reachability check skips bare specifiers, so a wildcard export would let a bare
    // specifier name an excluded module and bypass it entirely. Assert that rather than
    // assume it, walking the manifests the root `workspaces` globs actually declare rather
    // than a hardcoded path — a wildcard anywhere means the check above needs a real
    // bare-specifier resolver. Nested conditional targets are included by walking the whole
    // value, not just the top-level keys.
    const rootManifest = JSON.parse(
      fs.readFileSync(path.join(repoRoot, "package.json"), "utf8")
    ) as {
      workspaces?: string[] | { packages?: string[] };
    };
    const workspaces = Array.isArray(rootManifest.workspaces)
      ? rootManifest.workspaces
      : (rootManifest.workspaces?.packages ?? []);
    expect(workspaces.length, "root package.json declares no workspace globs").toBeGreaterThan(0);
    const manifests = fg.sync(
      workspaces.map((glob) => `${glob.replace(/\/+$/, "")}/package.json`),
      { cwd: repoRoot }
    );
    expect(manifests.length, "no workspace manifests were found").toBeGreaterThan(0);

    const wildcards: string[] = [];
    const exportslessPackages: string[] = [];
    for (const manifest of manifests) {
      const parsed = JSON.parse(fs.readFileSync(path.join(repoRoot, manifest), "utf8")) as {
        name?: string;
        exports?: unknown;
      };
      const label = parsed.name ?? manifest;
      if (parsed.exports === undefined || parsed.exports === null) {
        exportslessPackages.push(label);
        continue;
      }
      const entries = JSON.stringify(parsed.exports).match(/"[^"]*\*[^"]*"/g) ?? [];
      for (const entry of entries) wildcards.push(`${label} ${entry}`);
    }
    expect(
      wildcards,
      "a wildcard export makes the bare-specifier skip in this file unsafe"
    ).toEqual([]);

    // A manifest without an `exports` map is a wildcard by another name — it exposes *every*
    // subpath — so it must never be named by a bare specifier in production code at all.
    // Workspace packages are the only manifests that can reach an excluded module this way,
    // because they symlink straight into the repo's source tree.
    const bareSpecifierPackages = new Set<string>();
    for (const file of productionFiles) {
      for (const specifier of importSpecifiers(file)) {
        if (
          specifier.startsWith(".") ||
          PATH_ALIASES.some((rule) => specifier.startsWith(rule.prefix))
        ) {
          continue;
        }
        const segments = specifier.split("/");
        bareSpecifierPackages.add(
          specifier.startsWith("@") ? segments.slice(0, 2).join("/") : (segments[0] ?? specifier)
        );
      }
    }
    expect(
      exportslessPackages.filter((name) => bareSpecifierPackages.has(name)),
      "an exports-less workspace package is bare-imported, so the bare-specifier skip is unsafe for it"
    ).toEqual([]);
  });

  it("scans no test-only module that lacks a test filename suffix", () => {
    // Would be vacuous without the directory negations: setup.ts and factories.ts are the
    // only such files today, so dropping the glob puts exactly these two back in the scan.
    expect(scannedFiles).not.toContain("apps/web/src/test/setup.ts");
    expect(scannedFiles).not.toContain("apps/web/src/integration/factories.ts");
  });
});
