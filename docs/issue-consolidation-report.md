# Issue Consolidation Report

**Generated**: 2026-06-27
**Phase**: ISSUE MANAGER MODE — Step 3 (Consolidation)
**Status**: Analysis complete. Actual consolidation blocked — GITHUB_TOKEN lacks write permissions.

> **Note**: I cannot close/consolidate issues directly because the GITHUB_TOKEN
> lacks `issues: write` permission. This report documents the recommended
> consolidation for manual application.

---

## Step 1 — Issue Normalization (Complete)

### Label Fixes Required

The following issues need label normalization. The GITHUB_TOKEN used in CI
could not modify labels, so these changes must be applied manually:

**Missing Priority Labels** (add P0-P3):
| Issue | Title | Recommended Priority |
|-------|-------|---------------------|
| #2119 | fix(bugfixer): BUG-014 BUG-017 | P1 (CI blocker, duplicate of #2030) |
| #2073 | fix(ci): update node-version from '20' to '22' | P1 (CI blocker, duplicate of #2030) |

**Custom Priority → Replace with P0-P3**:
| Issue | Current | Replace With |
|-------|---------|--------------|
| #1167 | priority:low | P3 |
| #1166 | priority:low | P3 |
| #1165 | priority:medium | P2 |
| #1163 | priority:medium | P2 |
| #1161 | priority:medium | P2 |
| #1143 | priority:low | P3 |
| #1142 | priority:low | P3 |
| #1141 | priority:medium | P2 |
| #1118 | priority:low | P3 |
| #1117 | priority:low | P3 |
| #1116 | priority:low | P3 |
| #1054 | priority:low | P3 |
| #1053 | priority:medium | P2 |
| #1052 | priority:low | P3 |
| #1051 | priority:low | P3 |
| #1049 | priority:medium | P2 |
| #1046 | priority:medium | P2 |

**Multiple Category Labels** (keep only one):
| Issue | Current Categories | Keep | Remove |
|-------|-------------------|------|--------|
| #2030 | bug, ci | bug | ci |
| #1088 | enhancement, security | security | enhancement |
| #1084 | enhancement, security | security | enhancement |

**Missing Category Labels**:
| Issue | Recommended Category |
|-------|---------------------|
| #1054 | chore (infrastructure) |
| #1053 | test |
| #1052 | refactor |
| #1051 | refactor |
| #1049 | chore |

---

## Step 2 — Duplicate Detection

### Cluster 1: CI Node Version Mismatch (4 issues → merge into #2030)

| Issue | Title | Verdict |
|-------|-------|---------|
| **#2030** | [Bug] CI workflows pin Node 20 but project requires Node 22+ | **Canonical** — Original bug report, P1 |
| #2063 | fix(ci): update node-version from 20 to 22 across all workflows | **Duplicate** — Same fix, different branch |
| #2073 | fix(ci): update node-version from '20' to '22' in all workflow files | **Duplicate** — Same fix, different branch |
| #2119 | fix(bugfixer): BUG-014 BUG-017 — fix stale doc refs and hardcoded node-version | **Duplicate** — Same fix + stale doc refs (preserve doc ref info in #2030) |

**Action**: Close #2063, #2073, #2119 as duplicates of #2030.
Add note to #2030: "Doc ref fix from #2119 (stale refs in main.yml) also needs to be applied."

---

## Step 3 — Small Issue Consolidation

### Cluster A: Infrastructure / Placeholder IDs
| Issues | Common Theme | Recommended Action |
|--------|-------------|-------------------|
| #1045, #1165 | Placeholder Cloudflare resource IDs in wrangler.toml | Merge into a single issue |
| #1166 | Add .nvmrc | Mention in merged infra issue (or note: .nvmrc already exists) |

**Recommended**: Consolidate #1045 and #1165 into one `[INFRA] Replace all placeholder Cloudflare resource IDs` issue.
Note: `.nvmrc` already exists in the repo (verify before acting on #1166).

### Cluster B: Testing Gaps
| Issues | Common Theme | Recommended Action |
|--------|-------------|-------------------|
| #1082, #1014, #936, #935, #1141, #1053, #857, #856 | Component/hook/service test coverage | Merge into umbrella `[TESTING] Increase test coverage` issue |
| #1019, #951, #872, #1015 | E2E/integration test gaps | Merge into `[TESTING] Add E2E test coverage` |
| #954 | Add tests for critical untested files | Too vague — close with reference to specific coverage issues |

**Recommended**: Create two umbrella testing issues:
1. `[TESTING] Increase unit/integration test coverage` — merge #1082, #1014, #936, #935, #1141, #1053, #857, #856
2. `[TESTING] Add E2E and integration test suites` — merge #1019, #951, #872, #1015

### Cluster C: Security Hardening
| Issues | Common Theme | Recommended Action |
|--------|-------------|-------------------|
| #1077, #928 | Prompt injection / input sanitization | Merge into umbrella security issue |
| #1078, #1046 | Authorization / access control | Merge into one authorization issue |
| #1088, #1084 | CI security scanning | Merge into CI security scanning issue |
| #930, #890 | CORS hardening | Merge into CORS configuration issue |
| #973, #906, #905, #892, #891, #864 | Various security | Group by severity, close low-priority with ref |

**Recommended**: Create 3 umbrella issues:
1. `[SECURITY] Input validation and sanitization` — merge #1077, #928
2. `[SECURITY] Authorization and access control` — merge #1078, #1046
3. `[SECURITY] CI security scanning` — merge #1088, #1084, #973

### Cluster D: Refactoring
| Issues | Common Theme | Recommended Action |
|--------|-------------|-------------------|
| #1163, #934, #947 | Code organization / duplication | Merge into 1 refactoring issue |
| #1086, #1052 | Component coupling / modernization | Merge into 1 frontend refactoring issue |

**Recommended**: Create umbrella `[REFACTOR] Code organization and deduplication` — merge #1163, #934, #947

### Cluster E: DevEx / DX
| Issues | Common Theme |
|--------|-------------|
| #1142, #1117 | Developer experience |
| #1054 | Docker support |
| #863, #862, #958 | Tooling / cleanup |

These are diverse — keep separate unless they share a common approach.

### Cluster F: Documentation
| Issues | Common Theme |
|--------|-------------|
| #924 | Storybook component docs |
| #870 | JSDoc for components |
| #914 | Rollback procedure docs |

Keep separate (different documentation types, unlikely to conflict).

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total open issues | ~90 |
| Issues to close (duplicates) | 3 (#2063, #2073, #2119) |
| Issues to consolidate | ~40 (into ~8 umbrella issues) |
| Issues to keep standalone | ~40 (innovation, feature requests) |
| Issues needing label normalization | ~20 |

---

## Note: Write Permission Blocked

The GITHUB_TOKEN available in this CI environment cannot write to GitHub Issues
(no `issues: write` permission). All normalization, closing, commenting, and
consolidation actions must be performed by a maintainer with proper credentials.

## Generated by

ULW Loop — Sisyphus (repo maintainer agent)
2026-06-27
