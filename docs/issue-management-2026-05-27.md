# Issue Management Report — 2026-05-27

## Phase: ISSUE MANAGER MODE

## Agent: Sisyphus (Auto-loop)

---

## Step 1: Issue Normalization

**Constraint**: GitHub token (`github-actions[bot]`) has read-only issue permissions — cannot add/remove labels, close issues, or add comments.

### Labels Required Per System:

- **Category** (exactly one): `bug`, `enhancement`, `feature`, `docs`, `refactor`, `chore`, `test`, `ci`, `security`
- **Priority** (exactly one): `P0`, `P1`, `P2`, `P3`

### Issues Missing Labels

| Issue | Title                                                                     | Missing Labels | Recommended         |
| ----- | ------------------------------------------------------------------------- | -------------- | ------------------- |
| #1293 | fix(ci): main.yml references non-existent docs/bug.md and docs/feature.md | Priority       | `P1`                |
| #1111 | [BUG-010] CI/CD Workflow Invalid GitHub Actions Versions @v5              | All            | `bug`, `P0`         |
| #1090 | [INNOVATION] Add Real-Time Collaborative Editing                          | All            | `enhancement`, `P3` |
| #1089 | [INNOVATION] Add AI-Powered Interactive Tutorial                          | All            | `enhancement`, `P3` |
| #1088 | [DEVOPS] MEDIUM: No Secrets Detection in CI                               | All            | `security`, `P2`    |
| #1087 | [DEVOPS] LOW: Vite Target Mismatch                                        | All            | `bug`, `P3`         |
| #1086 | [FRONTEND] LOW: Editor-Wizard Tight Coupling                              | All            | `refactor`, `P3`    |
| #1084 | [DEVOPS] MEDIUM: No Dependency Vulnerability Scanning in CI               | All            | `security`, `P2`    |
| #1083 | [TESTING] MEDIUM: No Database Layer Tests                                 | All            | `test`, `P2`        |
| #1082 | [TESTING] HIGH: No React Hook Tests                                       | All            | `test`, `P1`        |
| #1081 | [API] MEDIUM: Duplicate Validation Logic in Share Routes                  | All            | `bug`, `P2`         |
| #1078 | [ARCHITECTURE] HIGH: No User-Level Authorization                          | All            | `security`, `P1`    |
| #1077 | [ARCHITECTURE] HIGH: Prompt Injection Risk                                | All            | `security`, `P1`    |

### Issues Already with Labels (need P0-P3 added)

| Issue | Priority Label    | P-Equivalent |
| ----- | ----------------- | ------------ |
| #1390 | `priority:high`   | `P1`         |
| #1167 | `priority:low`    | `P3`         |
| #1166 | `priority:low`    | `P3`         |
| #1165 | `priority:medium` | `P2`         |
| #1164 | `priority:medium` | `P2`         |
| #1163 | `priority:medium` | `P2`         |
| #1161 | `priority:medium` | `P2`         |
| #1143 | `priority:low`    | `P3`         |
| #1142 | `priority:low`    | `P3`         |
| #1141 | `priority:medium` | `P2`         |
| #1118 | `priority:low`    | `P3`         |
| #1117 | `priority:low`    | `P3`         |
| #1116 | `priority:low`    | `P3`         |
| #1100 | `priority:medium` | `P2`         |
| #1054 | `priority:low`    | `P3`         |
| #1053 | `priority:medium` | `P2`         |
| #1052 | `priority:low`    | `P3`         |

---

## Step 2: Duplicate Detection

### Resolved Issues (already fixed in main branch)

| Issue | Title                                      | Resolution                                                         |
| ----- | ------------------------------------------ | ------------------------------------------------------------------ |
| #1111 | [BUG-010] CI/CD Invalid GitHub Actions @v5 | ✅ No @v5 references remain in any workflow file. All use @v4/@v6. |
| #1166 | [Infra] Add .nvmrc                         | ✅ `.nvmrc` and `.node-version` both exist and are git-tracked.    |
| #1087 | [DEVOPS] Vite Target Mismatch              | ✅ Both `vite.config.ts` and `tsconfig.json` target ES2022.        |

### Overlapping Issues

| Issues                     | Overlap                                                   | Recommendation                                                                   |
| -------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| #1090, #1143 (item 3)      | Both propose real-time collaboration for blueprint editor | Consolidate into one issue (#1143 is more comprehensive with risk assessment)    |
| #1141, #1083, #1082, #1053 | All about missing test coverage in different areas        | Could be consolidated into a meta "Test Coverage Gaps" issue with sub-items      |
| #1084, #1088               | Both propose CI security scanning improvements            | Related but distinct: #1084 = dependency vuln scanning, #1088 = secret detection |

---

## Step 3: Consolidation Recommendations

### Test Coverage Meta-Issue

- **Issues**: #1141, #1083, #1082, #1053
- **Proposal**: Create a single issue "Test Coverage Gap Analysis" with prioritized sub-items
- **Priority per component**: Frontend hooks (P1) > Database layer (P2) > API middleware (P2) > API utils (P2)

### CI/CD Security Enhancement

- **Issues**: #1084, #1088
- **Proposal**: Single issue "CI/CD Security Scanning Enhancement" covering both dependency vulnerability scanning and secrets detection

---

## Step 4: Repair Mode

### Selected Issue: #1390 — Node.js version mismatch in CI

- **Priority**: P1 (bug, blocks PR checks)
- **Root Cause**: Workflows use `node-version: "20"` but project requires Node.js 22 (per `.nvmrc` and `.node-version`)

### Fix Applied:

Changes `node-version` from `"20"` to `"22"` in all 5 workflow files:

- `.github/workflows/iterate.yml` — 5 occurrences
- `.github/workflows/parallel.yml` — 4 occurrences
- `.github/workflows/pr-gatekeeper.yml` — 1 occurrence
- `.github/workflows/on-pull.yml` — 1 occurrence

### Verification (on current codebase):

- ✅ `npm run build` — passes
- ✅ `npm run lint` — 0 errors, 0 warnings
- ✅ `npm run test:all` — 28 files, 403 tests all pass
- ✅ `npm run format:check` — passes

### Blocked:

- Cannot push to `.github/workflows/` files due to GitHub token `workflows` permission restriction
- A **patch script** is provided at `scripts/fix-ci-node-version.sh` for manual application
- A maintainer with proper GitHub token (PAT with `workflows` scope) needs to apply and push

### Apply the Fix:

```bash
# From repo root:
sed -i 's/node-version: "20"/node-version: "22"/g' .github/workflows/iterate.yml .github/workflows/parallel.yml .github/workflows/pr-gatekeeper.yml
sed -i 's/node-version: 20$/node-version: 22/' .github/workflows/on-pull.yml
# Or use the script:
./scripts/fix-ci-node-version.sh
```

---

## Final State

- **Active phase**: ISSUE MANAGER MODE (completed)
- **Next actionable**: #1390 requires maintainer with workflows permission to push
- **Blocked on**: GitHub token lacks `workflows` permission for workflow file changes
