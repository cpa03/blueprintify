/**
 * Post-build script to fix ESM imports for Node.js compatibility.
 * TypeScript's tsc outputs extensionless relative imports which fail
 * under Node.js ESM resolution on versions < 22.
 * This script adds .js extensions to all relative imports in the dist output.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "dist");

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith(".js")) {
      fixFile(fullPath);
    }
  }
}

function fixFile(filePath) {
  let content = readFileSync(filePath, "utf8");
  const original = content;

  // Fix relative imports: from "./foo" -> from "./foo.js"
  content = content.replace(
    /(from\s+["'])(\.\.?\/[^"']+?)(["'])/g,
    (match, prefix, path, suffix) => {
      if (path.endsWith(".js") || path.endsWith(".mjs") || path.endsWith(".cjs")) {
        return match;
      }
      // Check for directory imports (e.g., "./utils" -> "./utils/index.js")
      const resolvedPath = join(distDir, path);
      try {
        if (statSync(resolvedPath).isDirectory()) {
          return `${prefix}${path}/index.js${suffix}`;
        }
      } catch {
        // Not a directory, treat as file
      }
      return `${prefix}${path}.js${suffix}`;
    }
  );

  // Also fix: export * from "./foo"
  content = content.replace(
    /(export\s+\*\s+from\s+["'])(\.\.?\/[^"']+?)(["'])/g,
    (match, prefix, path, suffix) => {
      if (path.endsWith(".js") || path.endsWith(".mjs") || path.endsWith(".cjs")) {
        return match;
      }
      const resolvedPath = join(distDir, path);
      try {
        if (statSync(resolvedPath).isDirectory()) {
          return `${prefix}${path}/index.js${suffix}`;
        }
      } catch {
        // Not a directory
      }
      return `${prefix}${path}.js${suffix}`;
    }
  );

  if (content !== original) {
    writeFileSync(filePath, content, "utf8");
    console.log(`  Fixed: ${filePath.replace(distDir, ".")}`);
  }
}

console.log("Fixing ESM imports in dist/...");
try {
  statSync(distDir);
} catch {
  console.log("  dist/ not found, skipping (tsc produced no output)");
  process.exit(0);
}
walk(distDir);
console.log("Done.");
