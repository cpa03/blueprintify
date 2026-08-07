# Issue Manager Plan — Cycle 368 (2026-08-07)

> **Status: ANALYSIS COMPLETE — MUTATIONS BLOCKED.** This token lacks `issues: write` and `workflows` permissions (verified 403s this cycle). Execute the steps below with a permission-capable token (`issues: write`, `workflows: write`, `pull-requests: write`).

## Context

- 100 open issues, 0 open PRs → Issue Manager Mode.
- Baseline verified ALL GREEN: typecheck ✅ lint ✅ 0 warnings ✅ build ✅ tests **2,457/2,457** (1,081 web + 525 api + 851 shared) ✅ npm audit 0 vulns ✅.
- Label contract: exactly one category (`bug|enhancement|feature|docs|refactor|chore|test|ci|security`) + exactly one priority (`P0|P1|P2|P3`).
- Audit: 55 issues missing category, 81 missing priority (as of this cycle).

## Step 1 — Label Normalization

Two independent analyses agree:

1. **`scripts/normalize-issue-labels.mjs`** — deterministic script, dry-run by default, `--apply` to mutate. Current dry-run: **86 of 100 issues need changes**. Includes OVERRIDES table for judgment calls (e.g. #847 → security/P1).
2. **Parallel agent analysis** — 100/100 issues assigned category + priority, saved in `/tmp/opencode/labeling_report.md` (not committed). Full table reproduced in the `docs/findings.md` Cycle 368 record summary.

High-value assignments (differ from naive keyword parsing):

| Issue | Category | Priority | Rationale |
|---|---|---|---|
| #847 | bug | P0 | Auth bypass when API_KEY unset — critical security defect |
| #848 | security | P1 | CORS wildcard default |
| #849 | ci | P1 | Tests not running in PR gatekeeper |
| #850 | ci | P2 | Dependabot |
| #1045 | bug | P1 | Placeholder infra IDs break deploy |
| #1014 | test | P1 | Component coverage (also has `enhancement` label — remove it) |
| #1082 | test | P1 | Hook tests |
| #935 / #936 | test | P1 | Controller / store zero coverage |

**Execute**: `node scripts/normalize-issue-labels.mjs --apply` (requires `issues: write`).

## Step 2 — Duplicate Closure (16 clusters)

Close the non-canonical members with a comment referencing the canonical issue. Do NOT lose information (copy bodies into the canonical issue if needed).

| Canonical (keep) | Close (duplicates) |
|---|---|
| #848 | #890, #930 |
| #847 | #891 |
| #852 | #1053 |
| #857 | #1082 |
| #856 | #1014 |
| #860 | #911 |
| #872 | #951, #1019 |
| #874 | #1052 |
| #896 | #858, #909, #910, #1051 |
| #851 | #1084 |
| #1045 | #1165 |
| #849 | #953 |
| #1117 | #1142 |
| #1116 | #1143 |
| #892 | #1046 |
| #935 | (keep) — distinct from #936 (controllers vs stores) |

**Verified NOT duplicates** (do NOT merge): #854 vs #1141 (shared package vs API utils/services); #935 vs #954 vs #936; #1086 vs #934 (different fixes, both resolved).

## Step 3 — Consolidation (10 candidates)

Group related small issues into one meaningful issue, close members with reference:

| Consolidated issue | Members |
|---|---|
| Frontend performance budget enforcement | #873, #916 |
| CI security scanners (CodeQL + secrets) | #915, #1088 |
| Export/import endpoint hardening | #906, #908 |
| Backend input sanitization for blueprint content | #928, #921 |
| CI deployment reliability | #894, #897, #914, #1049 |
| Accessibility pass (tests + keyboard/screen-reader UX) | #918, #1118 |
| Logging hygiene (secureLog + remove console.*) | #881, #958 |
| Split oversized files | #865, #1163 |
| Expand .opencode agent tooling | #877, #878, #879 |
| Close-out test-backlog umbrellas | #954, #1141 |

## Step 4 — Repair Mode (highest-priority still-valid issue)

**Selected: #849/#953 (ci/P1)** — PR gatekeeper (`pr-gatekeeper.yml`) runs typecheck/lint/build but NO tests, then auto-merges (`gh pr merge --auto`). Broken PRs can merge.

**Validated fix (YAML-valid, locally green, push BLOCKED by `workflows` permission):**

```diff
# .github/workflows/pr-gatekeeper.yml — Run Health Checks step
  npm run typecheck > typecheck.log 2>&1 || echo "Typecheck Failed"
  npm run lint > lint.log 2>&1 || echo "Lint Failed"
  npm run build > build.log 2>&1 || echo "Build Failed"
+ npm run test:all > test.log 2>&1 || echo "Tests Failed"
- if grep -q "Failed" typecheck.log || grep -q "Failed" lint.log || grep -q "Failed" build.log; then
+ if grep -q "Failed" typecheck.log || grep -q "Failed" lint.log || grep -q "Failed" build.log || grep -q "Failed" test.log; then
# Engage Debugger step
- cat typecheck.log lint.log build.log > validation_errors.log
+ cat typecheck.log lint.log build.log test.log > validation_errors.log
# Final Integrity Check step
- npm run build && npm run typecheck
+ npm run build && npm run typecheck && npm run test:all
```

Apply with a token that has `workflows: write`, commit as `fix(ci): run test suite in PR gatekeeper before auto-merge (#849)`, push, open PR linked to #849 (closes #953).

## Already code-resolved (verify, then close with comment)

~35 issues verified fixed on `main`: #852/#1053 (8 middleware test files), #854 (4 shared test files), #1141 (6 utils + services test files), #857/#1082 (12 hook test files), #856/#1014 (37+ component test files), #935 (4 controller test files), #936 (4 store test files), #860/#911 (openai.test.ts + prompts.test.ts), #847/#891 (auth fails closed — 503), #848/#890/#930 (prod CORS origins explicit), #864 (upload_source_maps=false), #892/#1046 (share delete ownership verified), #905 (isValidShareId), #906/#908 (rate limit + max length schemas), #858/#896/#909/#910/#1051 (share route patterns), #899 (asyncHandler removed), #900 (z.unknown replaced), #947 (routeFactory), #867 (/health), #868 (requestId), #893 (D1 direct), #862 (prettier), #863 (templates), #850 (dependabot.yml), #885 (checkout@v7), #874/#1052 (functional ErrorBoundary), #875 (SkipLink no framer), #934 (createPersistedStore), #1086 (Editor decoupled), #1166 (.nvmrc), #1015 (playwright.config.ts), #1163 (constants split), #865 (export.ts 120 lines), #876 (ts project refs), #955 (no CSP unsafe-inline remains), #1161 (zustand 5.0.14).

## Human-blocked

- **#1045/#1165** (wrangler placeholder IDs): requires real Cloudflare resources — fail-closed `validate-wrangler.mjs` + `docs/cloudflare-infrastructure.md` already in place. Human action required.
- **#894/#897/#914/#1049** (deployment reliability): some require human Cloudflare/Environments setup.
