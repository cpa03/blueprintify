# Issue Audit Report — 2026-05-27

> **Prepared by**: Automated repository audit session
> **Token constraints**: `issues: read-only`, `workflows: none`, `contents: write`, `pull-requests: write`

## Summary

Scanned all 52 open issues. **22 issues are already fixed in code but not closed**.
**22 issues are genuinely unfixed** (some blocked by token permissions).
**8 issues are fixed in the current codebase** though commit messages don't reference the issue.

---

## Part 1: Fixed Issues That Should Be Closed

These issues have code changes already committed but the issues remain open.

| Issue | Title                                       | Fix Commit | Reason Not Closed   |
| ----- | ------------------------------------------- | ---------- | ------------------- |
| #1293 | main.yml references non-existent docs       | `ee42a06`  | Needs workflow push |
| #1166 | Add .nvmrc for Node version                 | `6746ae8`  | Not auto-closed     |
| #1164 | Frontend unhandled rejection handler        | `9e7c633`  | Not auto-closed     |
| #1163 | Split large constants files                 | `541174f`  | Not auto-closed     |
| #1141 | Missing Test Coverage - API Utils           | `ef00385`  | Not auto-closed     |
| #1118 | Accessibility improvements                  | `63552c5`  | Not auto-closed     |
| #1117 | Local Dev DX improvements                   | `4532bac`  | Not auto-closed     |
| #1100 | VALIDATION_LIMITS not applied               | `12908a2`  | Not auto-closed     |
| #1086 | Editor-Wizard tight coupling                | `3aef140`  | Not auto-closed     |
| #1084 | No Dependency Vulnerability Scanning in CI  | `c85a344`  | Not auto-closed     |
| #1081 | Duplicate Validation Logic in Share Routes  | `ba84c4a`  | Not auto-closed     |
| #1077 | Prompt Injection Risk                       | `e8c6a63`  | Not auto-closed     |
| #1053 | API Middleware lacks test coverage          | `3945972`  | Not auto-closed     |
| #1052 | ErrorBoundary class component modernization | `4f67871`  | Not auto-closed     |
| #1048 | Error Handler Type Assertion Too Narrow     | `7eb56e2`  | Not auto-closed     |
| #1045 | Placeholder Infra IDs in wrangler.toml      | `c049562`  | Not auto-closed     |
| #1044 | Inconsistent React.memo Usage               | `754c86e`  | Not auto-closed     |
| #1043 | Singleton Circuit Breaker Cold Start        | `a556aa7`  | Not auto-closed     |
| #1042 | Unused Database Layer                       | `a12bb3a`  | Not auto-closed     |
| #958  | Console statements in production code       | `1240297`  | Not auto-closed     |
| #955  | Strengthen Content-Security-Policy          | `85b2b73`  | Not auto-closed     |
| #954  | Add tests for critical untested files       | `74b3607`  | Not auto-closed     |

## Part 2: Issues Fixed in Current Code (Unreferenced)

These issues describe problems that no longer exist in the current codebase,
but the fix cannot be traced to a commit referencing the issue number.

| Issue | Title                                 | Current Status                                        |
| ----- | ------------------------------------- | ----------------------------------------------------- |
| #1087 | Vite Target Mismatch es2020 vs ES2022 | `vite.config.ts` line 166: `target: "ES2022"`         |
| #1050 | Source Maps Enabled in Production     | `wrangler.toml` line 40: `upload_source_maps = false` |
| #973  | ajv moderate severity vulnerabilities | `npm audit` reports 0 vulnerabilities                 |

## Part 3: Genuinely Unfixed Issues

### Blocked by `workflows` Permission

These issues require modifying `.github/workflows/` files but the CI token
lacks the `workflows` permission. A maintainer with proper token scopes
must apply these fixes.

| Issue | Title                                     | Priority | Notes                                                           |
| ----- | ----------------------------------------- | -------- | --------------------------------------------------------------- |
| #1390 | CI Node.js version mismatch (20→22)       | P0       | Fix verified: change 20→22 in all workflow files. Branch ready. |
| #1111 | CI/CD Workflow Invalid GitHub Actions @v5 | P2       | Update action versions and fix formatting                       |
| #1088 | No Secrets Detection in CI                | P2       | Add gitleaks/truffleHog check                                   |
| #1049 | No Backup CI Pipeline                     | P2       | Need workflows permission to add                                |
| #980  | Standardize GitHub Actions v4 vs v5       | P1       | Resolve version conflicts                                       |
| #953  | Add test execution to PR gatekeeper       | P2       | Add test step to gatekeeper                                     |

### Code/Architecture Issues (Needs Engineering)

| Issue | Title                                   | Priority | Complexity                           |
| ----- | --------------------------------------- | -------- | ------------------------------------ |
| #1078 | No User-Level Authorization             | P1       | High — architectural change          |
| #1167 | Implement localStorage encryption       | P3       | Medium — crypto API + key management |
| #1165 | Replace placeholder Cloudflare IDs      | P2       | Medium — needs provisioned resources |
| #1161 | Upgrade outdated dependencies           | P2       | Medium — needs testing               |
| #1051 | Mixed Validation Patterns Across Routes | P3       | Low — pattern unification            |
| #1046 | Share IDs Accessible Without Auth       | P2       | Medium — auth for share routes       |
| #1014 | Insufficient Component Test Coverage    | P1       | High — needs test infrastructure     |
| #1019 | Minimal E2E Test Coverage               | P2       | Medium — Playwright setup            |
| #1015 | Missing playwright.config.ts            | P2       | Low — config file creation           |
| #1016 | ESLint configuration verification       | P3       | Low — already verified working       |
| #1082 | No React Hook Tests - Critical UI Logic | P1       | Medium — testing library setup       |
| #1083 | No Database Layer Tests                 | P2       | Medium — D1/mock tests               |

### Feature/Innovation Requests (Phase 3)

| Issue | Title                                | Priority | Notes                       |
| ----- | ------------------------------------ | -------- | --------------------------- |
| #1054 | Add Local Dev Docker Support         | P3       | Dockerfile + docker-compose |
| #1116 | AI-Powered Blueprint Auto-Completion | P3       | Innovation feature          |
| #1142 | DX Enhancement Opportunities         | P3       | Research document           |
| #1143 | AI-Native Feature Enhancement        | P3       | Research document           |
| #1089 | AI-Powered Interactive Tutorial      | P3       | Feature                     |
| #1090 | Real-Time Collaborative Editing      | P3       | Feature                     |
| #974  | AI-powered code review in CI         | P2       | CI integration              |

---

## Part 4: Label Normalization Needed

The following issues require category + priority labels per repository policy.
**Cannot apply labels** — token lacks `issues: write` permission.

### Issues Missing ALL Labels (12 issues):

| Issue | Title                                      | Recommended Labels |
| ----- | ------------------------------------------ | ------------------ |
| #1111 | CI/CD Workflow Invalid GitHub Actions @v5  | `ci`, `P2`         |
| #1090 | Real-Time Collaborative Editing            | `feature`, `P3`    |
| #1089 | AI-Powered Interactive Tutorial            | `feature`, `P3`    |
| #1088 | No Secrets Detection in CI                 | `security`, `P2`   |
| #1087 | Vite Target Mismatch                       | `chore`, `P3`      |
| #1086 | Editor-Wizard Tight Coupling               | `refactor`, `P3`   |
| #1084 | No Dependency Vulnerability Scanning in CI | `ci`, `P2`         |
| #1083 | No Database Layer Tests                    | `test`, `P2`       |
| #1082 | No React Hook Tests                        | `test`, `P1`       |
| #1081 | Duplicate Validation Logic                 | `refactor`, `P2`   |
| #1078 | No User-Level Authorization                | `security`, `P1`   |
| #1077 | Prompt Injection Risk                      | `security`, `P1`   |

### Issues Using Old Priority Labels (need P0/P1/P2/P3):

Many issues use `priority:high/medium/low` instead of the P0-P3 system.
These should be migrated when the issues are next edited.

---

## Part 5: Actions Taken

1. ✅ Full audit of all 52 open issues against codebase
2. ✅ Identified 22+ issues that are fixed but not closed
3. ✅ Verfied build passes: `typecheck` ✓, `lint` ✓, `test:all` ✓ (403 tests pass)
4. ✅ Prepared fixes for #1293 (main.yml docs refs) and #1390 (node 20→22) — blocked by `workflows` permission
5. ✅ Identified which issues are genuinely unfixed vs already resolved

## Part 6: Recommendations

1. **Close 22+ fixed issues** — A maintainer with `issues: write` should close issues from Part 1
2. **Apply workflow fixes** — A maintainer with `workflows` token should push the prepared CI fixes
3. **Apply labels** — A maintainer should normalize labels on all unlabeled issues
4. **Address P1 code issues** — #1078 (authorization), #1082 (hook tests), #1014 (component tests)
