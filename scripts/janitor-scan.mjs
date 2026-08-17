/**
 * Janitor analysis script: finds orphaned source files and unused exports.
 * Usage: node scripts/janitor-scan.mjs [dir...]
 * Defaults to scanning apps/, packages/, scripts/.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import path from "node:path";

const roots = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["apps", "packages", "scripts"];

// --- collect all TS/TSX files ---
const files = [];
for (const root of roots) {
  const found = globSync(`${root}/**/*.{ts,tsx}`, {
    ignore: ["**/node_modules/**", "**/dist/**", "**/coverage/**", "**/e2e/**"],
  }).filter((f) => !f.includes("/node_modules/") && !f.includes("/dist/") && !f.includes("/coverage/"));
  files.push(...found);
}

// --- extract import specifiers from a file ---
function extractImports(src, filePath) {
  const imports = new Set();
  // static imports
  const staticRe = /import\s+(?:type\s+)?(?:[\w\s{},*]+?\s+from\s+)?['"]([^'"]+)['"]/g;
  // dynamic imports
  const dynamicRe = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  // require
  const requireRe = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  // export ... from
  const exportFromRe = /export\s+(?:type\s+)?[\w\s{},*]+?\s+from\s+['"]([^'"]+)['"]/g;
  // side-effect imports (import 'x')
  const sideEffectRe = /^\s*import\s+['"]([^'"]+)['"]/gm;

  for (const re of [staticRe, dynamicRe, requireRe, exportFromRe, sideEffectRe]) {
    let m;
    while ((m = re.exec(src)) !== null) {
      imports.add(m[1]);
    }
  }
  return imports;
}

function resolveSpecifier(spec, fromFile) {
  if (spec.startsWith(".")) {
    const base = path.resolve(path.dirname(fromFile), spec);
    const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}/index.ts`, `${base}/index.tsx`];
    for (const c of candidates) {
      const norm = path.relative(process.cwd(), c).replace(/\\/g, "/");
      if (files.includes(norm)) {
        return norm;
      }
    }
    // ESM style: "./config.js" -> "./config.ts"
    if (spec.endsWith(".js")) {
      const tsBase = path.resolve(path.dirname(fromFile), spec.replace(/\.js$/, ""));
      for (const c of [`${tsBase}.ts`, `${tsBase}.tsx`]) {
        const norm = path.relative(process.cwd(), c).replace(/\\/g, "/");
        if (files.includes(norm)) return norm;
      }
    }
    return null;
  }
  // bare specifier — resolve workspace package via package.json exports
  if (spec === "@blueprint/shared") {
    const shared = "packages/shared/src/index.ts";
    if (files.includes(shared)) return shared;
  }
  return null; // external package
}

// --- build import graph ---
const importedBy = new Map(); // file -> Set(importer)
const importsOf = new Map(); // file -> Set(resolved local files)

// First pass: collect direct imports
for (const file of files) {
  const src = readFileSync(file, "utf8");
  const specs = extractImports(src, file);
  const resolved = new Set();
  for (const spec of specs) {
    const r = resolveSpecifier(spec, file);
    if (r) resolved.add(r);
  }
  importsOf.set(file, resolved);
  for (const r of resolved) {
    if (!importedBy.has(r)) importedBy.set(r, new Set());
    importedBy.get(r).add(file);
  }
}

// Second pass: follow `export * from` and `export { x } from` chains
// so barrel files count as importers of the modules they re-export.
function extractReExports(src) {
  const reExports = new Set();
  const starRe = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = starRe.exec(src)) !== null) reExports.add(m[1]);
  const namedRe = /export\s+(?:type\s+)?\{[^}]*\}\s+from\s+['"]([^'"]+)['"]/g;
  while ((m = namedRe.exec(src)) !== null) reExports.add(m[1]);
  return reExports;
}

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const reExports = extractReExports(src, file);
  for (const spec of reExports) {
    const r = resolveSpecifier(spec, file);
    if (r) {
      if (!importedBy.has(r)) importedBy.set(r, new Set());
      importedBy.get(r).add(file);
    }
  }
}

// --- entry points / config-referenced files that must be ignored ---
const entryPoints = new Set([
  "apps/web/src/main.tsx",
  "apps/api/src/index.ts",
  "packages/shared/src/index.ts",
  "apps/web/src/vite-env.d.ts",
  "apps/api/src/global.d.ts",
  "apps/web/src/react-jsx-global.d.ts",
  "apps/web/src/test/setup.ts",
  "apps/api/src/test-setup.ts",
]);
// test setup files referenced by vitest config
for (const f of files) {
  if (/vitest\.config|vite\.config|tailwind\.config|postcss\.config/.test(f)) {
    const src = readFileSync(f, "utf8");
    const m = src.match(/setupFiles:\s*\[([^\]]+)\]/);
    if (m) {
      for (const s of m[1].matchAll(/['"]([^'"]+)['"]/g)) {
        const r = resolveSpecifier(s[1], f);
        if (r) entryPoints.add(r);
      }
    }
  }
}

console.log("=== ORPHANED FILES (never imported) ===");
let orphanCount = 0;
for (const file of files.sort()) {
  const isEntry = entryPoints.has(file);
  const isConfig = /\.config\.|vite-env|global\.d|react-jsx-global/.test(file);
  const importers = importedBy.get(file) || new Set();
  // files imported only by their own test file are effectively dead
  const nonSelfImporters = [...importers].filter((i) => i !== file.replace(/\.test\./, ".") && i !== file);
  const ownTest = files.find((f) => f === file.replace(/(\.[jt]sx?)$/, ".test$1"));
  const realImporters = nonSelfImporters.filter((i) => i !== ownTest);
  if (!isEntry && !isConfig && realImporters.length === 0) {
    const testOnly = ownTest && importers.has(ownTest);
    console.log(`  ${file}${isEntry ? " [ENTRY]" : ""}${testOnly ? " [imported only by its own test]" : ""}`);
    orphanCount++;
  }
}
console.log(`\nTotal orphans: ${orphanCount}`);

console.log("\n=== UNUSED EXPORTS (exported but never imported elsewhere) ===");
function extractExports(src, filePath) {
  const exports = new Set();
  // export function name
  let re = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g;
  let m;
  while ((m = re.exec(src)) !== null) exports.add(m[1]);
  // export const name
  re = /export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g;
  while ((m = re.exec(src)) !== null) exports.add(m[1]);
  // export class
  re = /export\s+(?:default\s+)?class\s+([A-Za-z_$][\w$]*)/g;
  while ((m = re.exec(src)) !== null) exports.add(m[1]);
  // export { a, b as c } (names only; ignore renames)
  re = /export\s*\{([^}]+)\}/g;
  while ((m = re.exec(src)) !== null) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(name)) exports.add(name);
    }
  }
  // export type Name / export interface Name
  re = /export\s+(?:type|interface)\s+([A-Za-z_$][\w$]*)/g;
  while ((m = re.exec(src)) !== null) exports.add(m[1]);
  // export * from -> unknown, skip
  // default exports
  if (/export\s+default/.test(src)) exports.add("default");
  return exports;
}

// Collect all import names across the codebase
const importedNames = new Set();
const importedNameMap = new Map(); // name -> importer file
for (const file of files) {
  const src = readFileSync(file, "utf8");
  const re = /import\s+(?:type\s+)?(?:\{([^}]+)\}|(\w+))\s*,?\s*(?:\{([^}]+)\})?\s*from\s+['"][^'"]+['"]/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const named = (m[1] || "") + "," + (m[3] || "");
    for (const part of named.split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(name)) {
        importedNames.add(name);
        if (!importedNameMap.has(name)) importedNameMap.set(name, file);
      }
    }
    if (m[2]) {
      importedNames.add(m[2]);
      if (!importedNameMap.has(m[2])) importedNameMap.set(m[2], file);
    }
  }
  // import * as ns
  const nsRe = /import\s+\*\s+as\s+(\w+)/g;
  while ((m = nsRe.exec(src)) !== null) {
    importedNames.add(m[1]);
    if (!importedNameMap.has(m[1])) importedNameMap.set(m[1], file);
  }
}

let unusedCount = 0;
for (const file of files.sort()) {
  // Skip barrel files and entry points for export scanning (re-export hubs)
  if (/\/index\.ts$/.test(file)) continue;
  if (entryPoints.has(file)) continue;
  if (/\.config\.|vite-env|global\.d|react-jsx-global/.test(file)) continue;
  const src = readFileSync(file, "utf8");
  const exports = extractExports(src, file);
  for (const name of exports) {
    if (name === "default") continue;
    // skip React component files that might be dynamically referenced or barrel re-exported
    const isUsed = importedNames.has(name);
    if (!isUsed) {
      console.log(`  ${file}: ${name}`);
      unusedCount++;
    }
  }
}
console.log(`\nTotal unused exports: ${unusedCount}`);
console.log("\nNOTE: manual verification required before deleting. Names may be used via barrel re-exports or dynamic references.");
