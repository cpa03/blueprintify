# Issue Manager Plan — 2026-10-24

> **Status: ANALYSIS COMPLETE — ISSUE MUTATIONS BLOCKED, REPAIR SHIPPED.** The loop token (`github-actions[bot]` GITHUB_TOKEN) has **zero REST/GraphQL issue permissions** on this repository (403 `Resource not accessible by integration` on both `addLabelsToLabelable` and `addComment`, verified this cycle). Git push and **PR creation DO work** — repair PR #3878 was opened and auto-merge armed. Execute Steps 1–3 mutations with a permission-capable token; Step 4 is complete.

## Context

- **157 open issues, 0 open PRs** → Issue Manager Mode (Phase 0, STEP 0.1/0.2).
- DEFAULT_BRANCH = `main`.
- Baseline tree at `8f8b3626` (hygiene cycle 20, all baselines green per #3874/#3875/#3876: 2,905 tests).
- Label contract: exactly one category (`bug|enhancement|feature|docs|refactor|chore|test|ci|security`) + exactly one priority (`P0|P1|P2|P3`).
- Pre-normalization audit: **14/157 compliant**; 113 missing category; 139 missing priority; 4 multi-label conflicts (#1088, #1084, #1014, #863).

## Step 1 — Label Normalization (READY TO APPLY)

Tooling: `scripts/normalize-issue-labels.mjs` (deterministic, idempotent, dry-run default).

**This cycle the script was extended** (branch `agent/im-labels-20261024`, commit `bdad66ef`):

- OCR full-scan issues (`[OCR Scan] <file> — N findings (M high/critical)`, 53 issues) are no longer mislabeled `enhancement/P3`. Category derives from finding tags: `[security]` → security, else `[bug]` → bug, else chore. Priority: P1 when high/critical findings exist, else P2.
- Engineering-judgment OVERRIDES added for the four unlabeled BroCula findings:
  | Issue | Category | Priority | Rationale |
  |---|---|---|---|
  | #3615 | bug | P2 | og:image dead domain — broken social previews |
  | #3616 | bug | P1 | keyboard shortcuts modal invisible (opacity: 0) |
  | #3617 | bug | P1 | no working "start from scratch" path on landing |
  | #3622 | bug | P2 | 13 infinite idle animations → main-thread jank |

Dry-run result: **143 of 157 issues need changes** (full list in the run log; representative OCR assignments: #3588 bodyLimit bypass → security/P1, #3583 regex-statefulness → security/P1, #3559 missing CSP → security/P1, #3608 debounce flush-args → bug/P1).

**Execute** (requires `issues: write`):

```bash
git checkout main && git pull
node scripts/normalize-issue-labels.mjs --apply
```

Re-run the dry-run afterwards to confirm 0 changes needed (idempotence check).

## Step 2 — Duplicate Closure (14 clusters, all still open)

Cycle-368 clusters were never closed (mutations blocked then too). Canonicals re-verified OPEN this cycle; close the non-canonical members with a comment linking the canonical. Do NOT lose information: copy any unique body content into the canonical before closing.

| Canonical (keep) | Close as duplicates |
|---|---|
| #848 (CORS wildcard) | #890, #930 |
| #847 (auth bypass when API_KEY unset) | #891 |
| #852 (API middleware tests) | #1053 |
| #857 (React hook tests) | #1082 |
| #856 (component test coverage) | #1014 |
| #860 (OpenAI service tests) | #911 |
| #872 (E2E Playwright coverage) | #951, #1019 |
| #874 (functional ErrorBoundary) | #1052 |
| #896 (share route validation/error alignment) | #858, #909, #910, #1051 |
| #851 (dependency vulnerability scanning in CI) | #1084 |
| #849 (tests in PR gatekeeper) | #953 |
| #1117 (local dev experience) | #1142 |
| #1116 (AI blueprint auto-completion) | #1143 |
| #892 (share deletion ownership) | #1046 |

Verified NOT duplicates (do NOT merge): #935 vs #936 (controllers vs stores); #854 vs #1141 (shared package vs API utils/services).

## Step 3 — Consolidation (10 groups → 10 issues)

Create one consolidated issue per group, close members with reference (bodies preserved in the consolidated issue):

| Consolidated issue | Members |
|---|---|
| Frontend performance budget enforcement | #873, #916 |
| CI security scanners (CodeQL + secrets detection) | #915, #1088 |
| Export/import endpoint hardening | #906, #908 |
| Backend input sanitization for blueprint content | #928, #921 |
| CI deployment reliability (Cloudflare deploy, environments, rollback, backup pipeline) | #894, #897, #914, #1049 |
| Accessibility pass (jest-axe tests + keyboard/screen-reader UX) | #918, #1118 |
| Logging hygiene (secureLog + remove console.*) | #881, #958 |
| Split oversized files / constants | #865, #1163 |
| Expand .opencode agent tooling (skills, commands, plugins) | #877, #878, #879 |
| Test-backlog umbrella close-out | #954, #1141 |

## Step 3b — Close Verified Code-Resolved Issues (spot-verified on main this cycle)

These were verified fixed on `main` this cycle (evidence in parentheses); close with a comment citing the verifying commit/file:

- **#847 / #891** — auth fails closed with 503 when `API_KEY` unset (`apps/api/src/middleware/auth.ts:137` "SECURITY FIX: Reject requests when API_KEY is not configured").
- **#848 / #890 / #930** — production CORS wildcard rejected (`apps/api/src/config/env.ts:115` `CORS_WILDCARD_PRODUCTION` throw).
- **#1053** — 8 middleware test files present (`apps/api/src/middleware/*.test.ts`).
- **#1082** — 14 hook test files present (`apps/web/src/hooks/*.test.*`).
- **#1014** — 43 component test files present (`apps/web/src/components/**/*.test.*`).
- **#935** — 4 controller test files (`apps/api/src/controllers/*.test.ts`).
- **#936** — 4 store test files (`apps/web/src/store/*.test.*`).
- **#1166** — `.nvmrc` present at repo root.
- **#1015** — `playwright.config.ts` present at repo root.
- **#892 / #1046** — share deletion ownership check present (`apps/api/src/routes/share.ts:649`).

⚠️ NOTE: #847/#848/#891/#890/#930/#892/#1046 appear BOTH in Step 2 duplicate clusters and here as code-resolved. Resolution order: close the Step 2 duplicates first (they point at the canonical), then close the canonical with the code-resolved evidence comment. Do not double-close.

**Still genuinely open (NOT code-resolved):** #849/#953 — `.github/workflows/pr-gatekeeper.yml` still has no `npm run test:all` in the health-check gate. Fixing this requires `workflows: write` to push workflow-file changes (blocked for this token; same block as cycle 368).

## Step 4 — Repair Mode

**Selection:** Highest-priority genuinely-unfixed issues are the fresh BroCula P1s **#3616** (shortcuts modal invisible) and **#3617** (no start-from-scratch path).

**#3616 verdict — INDETERMINATE (not selected):** `animate={{opacity:1}}` was already present at report time (`83a870e0`) and is unchanged on `main`; no fix commit exists, but `ConfirmDialog` uses the identical AnimatePresence/framer pattern without such reports. Static analysis cannot distinguish a real main-branch defect from a deployed-site/test-harness artifact (e.g., screenshot mid-0.2s-fade). Per fail-safe rules: do NOT guess — re-verify with a real browser (Playwright against a fresh `main` build, waiting ≥ animation duration) before coding a fix.

**Selected: #3617** (bug/P1) — statically confirmed on `main` at `8f8b3626`: the divider was a plain `<div>` (`App.tsx`, `LAYOUT.TEMPLATES_DIVIDER`) and `wizardActivated` only flipped via `activateWizard`, wired solely to `TemplateGrid onSelect`.

**Fix:** PR **#3878** — branch `agent/fix-3617-start-from-scratch`, commit `edee5978`.
- New `StartFromScratchButton` component: real `<button type="button">` with hover/focus-visible affordances, calling the existing `activateWizard()`.
- TDD: 3 component tests written first (RED → GREEN), covering render-as-button, click, and keyboard Enter (via `@testing-library/user-event`).
- Gates: typecheck ✅ lint ✅ 0 warnings ✅ build ✅ web tests **1351/1351** ✅ prettier ✅ secrets scan ✅ (pre-commit hooks also green).
- Linked with `Fixes #3617`; auto-merge enabled (`gh pr merge --auto --squash`) pending Cloudflare/Workers checks.

## Human-Blocked / Needs Permission-Capable Operator

1. `node scripts/normalize-issue-labels.mjs --apply` (needs `issues: write`).
2. Steps 2/3 closures + consolidated-issue creation (needs `issues: write`).
3. #849/#953 gatekeeper test-gate fix (needs `workflows: write` to push workflow changes).
4. #1045/#1165 wrangler placeholder resource IDs — requires real Cloudflare resources (unchanged from cycle 368; fail-closed `validate-wrangler.mjs` + `docs/cloudflare-infrastructure.md` already in place).
5. #894/#897/#914/#1049 deployment reliability — some require human Cloudflare Environments setup.

## Action Log

| Timestamp (UTC) | Action | Target | Result |
|---|---|---|---|
| 2026-10-24 | Phase 0 entry decision | repo state | 0 PRs / 157 issues → Issue Manager Mode |
| 2026-10-24 | Extend normalizer | scripts/normalize-issue-labels.mjs | OCR + BroCula overrides, committed `bdad66ef` |
| 2026-10-24 | Dry-run normalizer | 157 issues | 143 changes planned |
| 2026-10-24 | Apply labels | 143 issues | ❌ 403 `Resource not accessible by integration` (token has 0 issue perms) |
| 2026-10-24 | Verify push | agent/im-labels-20261024 | ✅ pushed |
| 2026-10-24 | Duplicate audit | 14 clusters | all canonicals + dupes still open |
| 2026-10-24 | Code-resolved spot-verify | 10 issues | ✅ confirmed on main (evidence above) |
| 2026-10-24 | Verify #3616 statically | KeyboardShortcutsModal.tsx | ⚠️ indeterminate — animate props unchanged since report; not selected (fail-safe) |
| 2026-10-24 | Verify #3617 statically | App.tsx | ✅ bug confirmed (non-interactive divider div; wizard gated on template select) |
| 2026-10-24 | TDD fix for #3617 | StartFromScratchButton | RED→GREEN, 3/3 tests |
| 2026-10-24 | Full gates | typecheck/lint/build/tests/prettier/secrets | ✅ all green (1351/1351 web tests, 0 lint warnings) |
| 2026-10-24 | Push + PR | agent/fix-3617-start-from-scratch → PR #3878 | ✅ created; auto-merge enabled pending checks |
| 2026-10-24 | Comment on issue | #3617 | ❌ 403 addComment (issue write still blocked) |
