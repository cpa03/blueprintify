# Issue Triage Report — 2026-05-25

## Summary

Reviewed 40+ open issues across the repository. Many audit-generated issues from February 2026
have been resolved by subsequent automation and commits. This document captures the findings.

---

## Issues Already Fixed (no further action needed)

| Issue | Title                         | Evidence                                                                                                                                                                                                       |
| ----- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #1077 | Prompt Injection Risk         | `prompt-security.ts` exists with `INJECTION_PATTERNS`, `MAX_INPUT_LENGTH`, `CONTROL_CHAR_FILTER`. `sanitizePromptInput()` used on all user input fields. 12 sanitization tests. Fixed via `bd8b607`, `e8c6a63` |
| #1087 | Vite Target Mismatch          | `vite.config.ts` line 160 already has `target: "ES2022"` and line 82 has `esbuildOptions.target: "es2022"`                                                                                                     |
| #1164 | Unhandled Rejection Handler   | `main.tsx` lines 14-26 already has both `unhandledrejection` and `error` window event handlers                                                                                                                 |
| #1166 | Add .nvmrc                    | `.nvmrc` exists with content `20` (matches `package.json` `"node": ">=20"`)                                                                                                                                    |
| #1100 | VALIDATION_LIMITS not applied | All schemas in `schema.ts` already use `VALIDATION_LIMITS` on all applicable fields                                                                                                                            |
| #1042 | Unused MockDatabaseService    | The 268-line `MockDatabaseService` has been removed; only Zod schemas and utility functions remain                                                                                                             |

## Duplicates Found

| Duplicate                                           | Canonical Issue                                         | Rationale                                                                             |
| --------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| #1165 "Replace placeholder Cloudflare resource IDs" | #1045 "Placeholder Infrastructure IDs in wrangler.toml" | Same topic, #1045 is more detailed and higher priority. #1165 was created a day later |

## Needs Label Normalization

The operating contract requires every issue to have one category label (bug/enhancement/feature/docs/refactor/chore/test/ci/security) and one priority label (P0-P3).

| Issue | Missing Labels | Suggested                    |
| ----- | -------------- | ---------------------------- |
| #1293 | Priority       | `P0` (blocks CI pipeline)    |
| #1111 | Both           | `bug` + `P2` (CI/CD @v5 bug) |
| #1090 | Both           | `enhancement` + `P3`         |
| #1089 | Both           | `enhancement` + `P3`         |
| #1088 | Both           | `security` + `P2`            |
| #1087 | Both           | `chore` + `P3`               |
| #1086 | Both           | `refactor` + `P3`            |
| #1084 | Both           | `security` + `P2`            |
| #1083 | Both           | `test` + `P2`                |
| #1082 | Both           | `test` + `P1`                |
| #1081 | Both           | `refactor` + `P2`            |
| #1078 | Both           | `security` + `P1`            |
| #1077 | Both           | `security` + `P1`            |

## Consolidation Opportunities

### Testing Issues

The following small testing issues could be consolidated into a meta-issue:

- #1141 Missing Test Coverage - API Utils & Services
- #1083 No Database Layer Tests
- #1082 No React Hook Tests
- #1053 API Middleware Lacks Test Coverage
- #1019 Minimal E2E Test Coverage
- #1014 Insufficient Component Test Coverage

### CI/CD Issues

The following issues touch CI/CD workflows and can only be fixed by someone with
`workflows: write` GitHub App permission:

- #1293 CI workflow references non-existent docs files
- #1111 Invalid GitHub Actions versions
- #1084 No Dependency Vulnerability Scanning in CI
- #1088 No Secrets Detection in CI

## Build & Test Health

- Build: ✅ Passes cleanly
- Lint: ✅ Clean (no warnings, no errors)
- Tests: ✅ 28/28 files, 473/473 tests passing
- Dependencies: 4 moderate vulnerabilities (pre-existing)
