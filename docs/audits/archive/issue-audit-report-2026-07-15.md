# ULW Loop — Issue Manager Analysis Report
**Date**: 2026-07-15
**Mode**: Issue Manager (Phase 0)
**Token Constraints**: GITHUB_TOKEN has read-only issue access - cannot modify labels, close issues, or create comments/issues.

---

## Phase 0 — Entry Decision
- **Open PRs**: 0
- **Open Issues**: 60+
- **Decision**: Enter ISSUE MANAGER MODE

---

## STEP 1: Issue Normalization

### Label Requirements (per contract)
- **Category** (exactly one): bug | enhancement | feature | docs | refactor | chore | test | ci | security
- **Priority** (exactly one): P0 | P1 | P2 | P3

### Issues Needing Priority Label Renormalization
Many issues use legacy `priority:low` / `priority:medium` labels instead of P0-P3:
- `priority:low` → P3: #1167, #1166, #1143, #1142, #1118, #1117, #1116, #1054, #1052, #1051, #1016, #958, #955, #924, #1052
- `priority:medium` → P2: #1165, #1163, #1161, #1141, #1053, #1049, #1046, #1019, #1015, #974, #973, #954, #953, #934, #930, #927, #921, #920, #919, #918, #917

### Issues Missing Category Labels
- #1054: Missing category (has area:devops-engineer, priority:low)
- #1053: Missing category (has area:quality-assurance, priority:medium)
- #1052: Missing category (has area:frontend-engineer, priority:low)
- #1051: Missing category (has area:api-specialist, priority:low)
- #1049: Missing category (has area:devops-engineer, priority:medium)
- #954: Missing category (has area:quality-assurance, priority:medium)
- #953: Missing category (has area:devops-engineer, priority:medium)
- #951: Missing category (has area:quality-assurance)
- #947: Missing category (has type:refactor, area:api-specialist)
- #936: Missing category (has area:frontend-engineer, area:quality-assurance)
- #935: Missing category (has area:api-specialist, area:quality-assurance)
- #928: Missing category (has area:security-engineer)
- #927: Missing category (has area:frontend, priority:medium)
- #924: Missing category (has area:technical-writer, priority:low)
- #921: Missing category (has area:integration-engineer, priority:medium)
- #920: Missing category (has area:integration-engineer, priority:medium)
- #919: Missing category (has area:integration-engineer, priority:medium)
- #918: Missing category (has area:quality-assurance, priority:medium)
- #917: Missing category (has area:quality-assurance, priority:medium)
- #916: Missing category (has area:devops-engineer, priority:medium)
- #915: Missing category (has area:security-engineer, priority:medium)
- #914: Missing category (has area:devops-engineer, priority:medium)
- #913: Missing category (has area:frontend, priority:medium)
- #912: Missing category (has area:frontend, priority:medium)
- #911: Missing category (has area:quality-assurance, priority:medium)
- #910: Missing category (has area:api-specialist, priority:medium)
- #909: Missing category (has area:api-specialist)
- #908: Missing category (has area:api-specialist)
- #906: Missing category (has security, area:security-engineer)

### Issues With Duplicate Category Labels
- #1167: security ✓ + area:frontend-engineer (area label, not category)
- #1088: enhancement + security (two categories) → should be security
- #1084: enhancement + security (two categories) → should be security
- #1014: enhancement + test (two categories) → should be test

---

## STEP 2: Duplicate Detection

### CONFIRMED DUPLICATES

| Canonical | Duplicate | Reason |
|-----------|-----------|--------|
| #1045 (P1, bug) | #1165 (chore) | Both about Cloudflare placeholder IDs in wrangler.toml |
| #1082 (P1, test) | Partially duplicated by #954, #1141 | All are about missing test coverage |

### NEAR-DUPLICATES (Related but distinct)

| Issues | Topic |
|--------|-------|
| #935, #936, #1082, #1014, #954, #1141, #1053, #911, #917 | Test coverage gaps (different scopes: API, hooks, components, E2E) |
| #919, #920, #921, #947 | Shared package extraction |
| #1084, #915 | CI security scanning (npm audit vs CodeQL) |
| #1088, #906 | Secrets detection and rate limiting |
| #1143, #1116, #1089, #1090, #974, #1054 | Innovation/enhancement suggestions |

---

## STEP 3: Small Issue Consolidation

### Recommended Consolidations

1. **Test Coverage Epic**: Merge #935, #936, #954, #1053, #911, #917, #918, #1019 into one comprehensive test coverage issue. Keep #1082 (hook tests) and #1014 (component coverage) as separate sub-tasks since they're more specific.

2. **Shared Package Refactor**: Merge #919, #920, #921, #947 into "Extract shared utilities and types to packages/shared".

3. **DevOps Infrastructure**: Merge #1166, #1015, #1016, #914, #916, #953, #1049 into "Infrastructure & CI Pipeline Improvements".

4. **Innovation Backlog**: Mark #1143, #1116, #1089, #1090, #974, #1054 as "innovation" and consolidate into a single roadmap issue (already partially done with #1143).

---

## STEP 4: Repair Mode — P1 Issue Verification

### STATUS: All P1 Issues Are Addressed in Code

| Issue | Title | Status | Fix Evidence |
|-------|-------|--------|-------------|
| #1077 (P1) | Prompt Injection Risk | **FIXED** ✅ | `sanitizePromptInput()` in prompts.ts; commits: 63131465, ddc555cf |
| #1078 (P1) | No User-Level Authorization | **FIXED** ✅ | Auth middleware with userId derivation, role-based access; commits: 9a9f6a6e, b76c4860, 5a90cc19 |
| #1045 (P1) | Placeholder Infrastructure IDs | **PARTIALLY FIXED** ⚠️ | Validation script enhanced with actionable CLI commands; actual IDs remain placeholders (blocked on Cloudflare account) |
| #1082 (P1) | No React Hook Tests | **FIXED** ✅ | All hooks now have test files; commit b47cfb4d, 864ebd1e |
| #1014 (P1) | Insufficient Component Tests | **IMPROVED** ⚠️ | 4→21 tests (48% coverage), still room for more |

### Recommended Actions (blocked by token)

1. Close #1077, #1078, #1082 as completed (fixes merged to main)
2. Close #1165 as duplicate of #1045
3. Update labels on ~50 issues to use P0-P3 format
4. Create consolidated epic issues for test coverage, shared packages, and DevOps improvements

---

## Build/Test Health Summary

| Check | Status | Details |
|-------|--------|---------|
| Build | ✅ PASS | Shared package + web app build successful |
| Lint | ✅ PASS | 0 errors, 0 warnings |
| Test | ✅ PASS | 54 files, 790 tests, all passing |
| Dependencies | ✅ | 0 vulnerabilities (npm audit clean) |
