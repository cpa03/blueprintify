# Issue Audit Report — 2026-06-19

## Summary

**Cycle**: ULW Loop — Issue Manager Mode
**Evaluated**: 20 open issues
**New issues created**: 0
**Issues confirmed fixed (not closed)**: 8
**Code fixes applied**: 1 (#1084 — npm audit in CI)
**Blockers**: GITHUB_TOKEN lacks `issues: write` — cannot close issues or apply labels

---

## STEP 1 — Issue Normalization (Label Recommendations)

The GITHUB_TOKEN cannot modify issue labels (requires `issues: write`). Below are the recommended labels for each issue. A maintainer with write access should apply these.

### Unlabeled Issues (Need Category + Priority)

| Issue | Title | Recommended Category | Recommended Priority | Additional Labels |
|-------|-------|---------------------|---------------------|-------------------|
| #1111 | [BUG-010] CI/CD Workflow Invalid GitHub Actions Versions @v5 | `bug` | `P0` | `ci`, `devops-engineer` |
| #1090 | [INNOVATION] Add Real-Time Collaborative Editing | `feature` | `P3` | `enhancement` |
| #1089 | [INNOVATION] AI-Powered Interactive Tutorial | `feature` | `P3` | `enhancement` |
| #1088 | [DEVOPS] MEDIUM: No Secrets Detection in CI | `security` | `P2` | `devops-engineer`, `ci` |
| #1087 | [DEVOPS] LOW: Vite Target Mismatch | `bug` | `P3` | `devops-engineer` |
| #1086 | [FRONTEND] LOW: Editor-Wizard Tight Coupling | `refactor` | `P3` | `frontend-engineer` |
| #1084 | [DEVOPS] MEDIUM: No Dependency Vulnerability Scanning | `security` | `P2` | `devops-engineer`, `ci` |
| #1083 | [TESTING] MEDIUM: No Database Layer Tests | `test` | `P2` | `quality-assurance` |

### Already-Labeled Issues (Need Priority Normalization)

Replace `priority:low` → `P3`, `priority:medium` → `P2`.

| Issue | Current Labels | Needed Change |
|-------|---------------|---------------|
| #1167 | area:frontend-engineer, priority:low, security | Replace `priority:low` → `P3` |
| #1166 | area:devops-engineer, type:infrastructure, priority:low, chore | Replace `priority:low` → `P3` |
| #1165 | area:devops-engineer, type:infrastructure, priority:medium, chore | Replace `priority:medium` → `P2` |
| #1163 | type:refactor, area:frontend-engineer, priority:medium, refactor | Replace `priority:medium` → `P2` |
| #1161 | enhancement, area:frontend-engineer, priority:medium | Replace `priority:medium` → `P2` |
| #1143 | enhancement, priority:low | Replace `priority:low` → `P3` |
| #1142 | enhancement, priority:low | Replace `priority:low` → `P3` |
| #1141 | priority:medium, area:quality-assurance, test | Replace `priority:medium` → `P2` |
| #1118 | enhancement, area:frontend-engineer, priority:low | Replace `priority:low` → `P3` |
| #1117 | enhancement, area:devops-engineer, priority:low | Replace `priority:low` → `P3` |
| #1116 | enhancement, area:api-specialist, priority:low | Replace `priority:low` → `P3` |
| #1100 | area:api-specialist, priority:medium | Add `bug`, replace `priority:medium` → `P2` |

---

## STEP 2 — Duplicate Detection

### Group 1: Innovation/Enhancement Overlaps

| Issues | Similarity | Recommendation |
|--------|-----------|---------------|
| #1143 (INNOVATION-001) + #1116 ([INNOVATION-001] AI-Powered Blueprint Auto-Completion) | Same INNOVATION-001 identifier | #1116 is a concrete sub-item of #1143. Keep #1143 as parent, mark #1116 as related. |
| #1142 (DX-001) + #1117 ([DX-001] Improve Local Dev Experience) | Same DX-001 identifier | #1117 is a concrete sub-item of #1142. Keep #1142 as parent, mark #1117 as related. |
| #1090 (Real-Time Collaborative Editing) + #1089 (AI Tutorial) + #1116 (Auto-Completion) | All innovation/feature requests | Separate features, no true duplicates. Keep all open. |

### Group 2: Testing Overlaps

| Issues | Similarity | Recommendation |
|--------|-----------|---------------|
| #1083 (No DB Layer Tests) + #1141 (TEST-001 Missing Coverage) | Both about missing test coverage | #1083 is specific to db/index.ts (824 lines untested). #1141 covers API utils + frontend hooks. Different scope — keep both. |

### Group 3: DevOps/CI Overlaps

| Issues | Similarity | Recommendation |
|--------|-----------|---------------|
| #1084 (Dependency Scanning) + #1088 (Secrets Detection) | Both CI security gaps | Different concerns (deps vs secrets). Keep both but consider creating a parent "CI Security Hardening" epic. |

---

## STEP 3 — Consolidation Recommendations

### Issues Confirmed Already Fixed (Should Be Closed)

These issues have been resolved by prior agent cycles but were never closed due to token permission limitations:

| Issue | Title | Fixed By | Evidence |
|-------|-------|----------|----------|
| #1111 | CI @v5 versions | PR #1151 (merged 2026-02-27) | `.github/workflows/` files use `@v4`/`@v6` |
| #1100 | VALIDATION_LIMITS not applied | BroCula cycle | `schema.ts` applies limits to all schemas |
| #1086 | Editor-Wizard Tight Coupling | Prior refactor | ExportContext decouples Editor from Wizard store |
| #1087 | Vite Target Mismatch | Prior fix | `vite.config.ts` target = `ES2022` matches `tsconfig.json` |
| #1166 | Add .nvmrc | Prior cycle | `.nvmrc` exists with `22` |
| #1050 | Source maps in production | Prior fix | Source maps disabled in `wrangler.toml` |
| #1077 | Prompt injection | Prior cycle | `prompt-security.ts` implemented |
| #1082 | Hook tests missing | Prior cycle | All hook tests exist and pass |

**Status**: 8 of 20 open issues (40%) are already fixed but still open. Cannot close due to `issues: write` permission gap.

---

## STEP 4 — Repair Mode: Fix Applied

**Issue**: #1084 — [DEVOPS] MEDIUM: No Dependency Vulnerability Scanning in CI
**Fix**: Added `npm audit` step to `.github/workflows/pr-gatekeeper.yml`

### Changes Made

**File**: `.github/workflows/pr-gatekeeper.yml`
- Added new step "Dependency Vulnerability Audit" after health checks, before Security Engineer
- Runs `npm audit --audit-level=high` to detect high/critical vulns
- Outputs status: `critical`, `high`, or `clean` for downstream use
- Set to `continue-on-error: true` (non-blocking) since current vulns are all transitive through sentry/lighthouse
- dependabot.yml already configured ✅

### Current Vulnerability Status

```
23 vulnerabilities (1 low, 18 moderate, 4 high)
```

All high/critical vulnerabilities are transitive through: `@sentry/node` → `@opentelemetry/*` and `lighthouse` → `@sentry/node`. Direct dependencies are clean.

### Verification

- ✅ YAML syntax valid
- ✅ Typecheck passes (0 errors)
- ✅ Lint passes (0 errors)
- ✅ Build passes
- ✅ All 1,425 tests pass (75 test files)
- ✅ Branch up to date with `main`

---

## Final State

| Metric | Status |
|--------|--------|
| Phase | Issue Manager Mode (completed) |
| Decision | 0 open PRs → 20 open issues → entered Issue Manager |
| Issues normalized | 20 (documented — blocked from applying labels) |
| Duplicates identified | 3 groups (no hard duplicates, only thematic overlaps) |
| Confirmed fixed but open | 8 issues (cannot close) |
| Code fixes applied | 1 (npm audit in CI) |
| Final state | Waiting for human review (token lacks `issues: write`) |
