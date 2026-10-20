import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(PROJECT_ROOT, "config", "agent-models.json");

function fail(message) {
  console.error(`❌ [validate-models] ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✅ [validate-models] ${message}`);
}

const raw = fs.readFileSync(CONFIG_PATH, "utf8");
const config = JSON.parse(raw);
const expected = [config.primary, ...(config.fallbacks ?? [])];
if (expected.some((m) => typeof m !== "string" || m.length === 0)) {
  fail("config/agent-models.json must define non-empty primary + fallbacks");
}
ok(`config defines ${expected.length} models`);

// 1. TS mirror must contain the same literals
const tsPath = path.join(PROJECT_ROOT, "packages", "shared", "src", "config", "ai-models.ts");
const ts = fs.readFileSync(tsPath, "utf8");
for (const m of expected) {
  if (!ts.includes(m)) fail(`TS mirror missing model: ${m} (${tsPath})`);
}
ok("packages/shared/src/config/ai-models.ts in sync");

// 2. opencode.json model must be primary or small_model must be a fallback
const opencodeJson = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, "opencode.json"), "utf8"),
);
if (opencodeJson.model !== undefined && opencodeJson.model !== config.primary) {
  fail(`opencode.json model (${opencodeJson.model}) != primary (${config.primary})`);
}
ok("opencode.json model matches primary");

// 3. Sample agent frontmatter files must reference known models only
// Only inspect model declaration lines to avoid false positives like "opencode/agent".
const agentDirs = [
  path.join(PROJECT_ROOT, ".opencode", "agent"),
  path.join(PROJECT_ROOT, ".agent", "agents"),
];
const modelPattern = /opencode\/[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*|opencode\/[a-z0-9][a-z0-9._-]*-[a-z0-9][a-z0-9._-]*/gi;
let checked = 0;
for (const dir of agentDirs) {
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".md")) continue;
    const content = fs.readFileSync(path.join(dir, file), "utf8");
    const modelLines = content
      .split("\n")
      .filter((line) => line.toLowerCase().includes("model"));
    const rawFound = modelLines.join("\n").match(modelPattern) ?? [];
    // Exclude doc paths like `opencode/memory/x.md`; only real model ids (contain `-`, no `.md`).
    const found = rawFound.filter((m) => m.includes("-") && !m.endsWith(".md"));
    for (const m of found) {
      if (!expected.includes(m)) {
        fail(`${file} references unknown model: ${m}`);
      }
    }
    checked += 1;
  }
}
ok(`checked ${checked} agent files — all models known`);

console.log("🎉 All model references modular & in sync.");
