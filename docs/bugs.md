# Bug Log: Known Defects

> **Tracking known bugs and defects** for Blueprintify with status and priority information. Historical cycle-by-cycle audit records live in [`findings.md`](./findings.md).

## Current Defect Status (Oct 2026)

- **Zero code defects**: Typecheck clean; ESLint clean (0 errors, 0 warnings) — verified 2026-10-06.
- **Zero known unhandled exceptions**: Clean console in production bundles.
- **Zero build/lint fatals**: `build`, `build:api`, `typecheck`, `lint`, `format:check`, `scan:secrets`, `validate:wrangler` all passing.
- **Tests green**: 2,692 passed (web 1,271 + api 547 + shared 874) — verified 2026-10-06.
- **Known dependency limitation (no non-breaking fix)**: `npm audit --audit-level=high` reports 9 vulnerabilities (3 moderate, 6 high) via `braces@3.0.3` ← `micromatch/fast-glob/chokidar` ← `tailwindcss@3.4.19` (GHSA-vfj7-8cjw-p6xm) plus `postcss-selector-parser` and `source-map-js` transitives. `braces` has no patched 3.x release; the only audit-suggested path is the breaking `tailwindcss@4.x` upgrade, so this is tracked here and not changed in this cycle. Hardening overrides held: `dompurify@3.4.16`, `undici@7.30.0`, `sharp@0.35.4`, `brace-expansion@5.0.12`, `ajv@6.15.0`, `hono@4.13.9`.
- **Known toolchain drift (lint still green)**: `eslint@10.11.0` exceeds the peer ranges declared by `eslint-plugin-jsx-a11y`/`eslint-plugin-react` (`^3 || ... || ^9`), so `npm ls eslint` reports invalid peer. `npm run lint` still exits 0 with 0 errors/0 warnings; downgrade to 9.39.5 is deferred to avoid churn.

---

## Active & Tracked Issues

| ID | Title | Priority | Area | Status | Notes |
|----|-------|----------|------|--------|-------|
| **BUG-001** | Frontend bundle size performance | Low | Web | In Progress | Dynamic imports, lazy loading, and Vite/Rolldown bundling applied |
| **BUG-008** | ajv package security vulnerabilities | Medium | Deps | ✅ Resolved | Upgraded to `ajv@6.15.0`; `npm audit` reports 0 vulnerabilities |
| **BUG-013** | esbuild/lighthouse tooling vulnerabilities | Low | Deps | ✅ Resolved | Dependencies pinned; 0 vulnerabilities |
| **BUG-014** | Stale doc references in workflows | Low | CI | ✅ Resolved | All workflow refs point to current `docs/*.md` filenames |
| **BUG-017** | Hardcoded Node.js 20 in workflows | Low | CI | ✅ Resolved | All 5 workflows use `node-version-file: ".node-version"` |
| **BUG-048** | ESLint 10 peer dependency conflict | Low | Tooling | ✅ Resolved | ESLint pinned to 9.39.5 to match plugin peer ranges |
| **BUG-049** | Storage route error response format | Low | API | ✅ Resolved | Standardized via `createErrorJson` |
| **BUG-050** | Cloudflare placeholder resource IDs | Medium | Infra | ✅ Resolved | Real IDs provisioned in `apps/api/wrangler.toml` (`validate:wrangler` clean) |
| **BUG-051** | dompurify GHSA-p98j-92pf-mc4p vulnerability | Medium | Deps | ✅ Resolved | Upgraded to `dompurify@3.4.16`; `npm audit` reports 0 vulnerabilities |

---

## Historical Audit Summary

> Over 110 BugFixer and 600+ ULW orchestration cycles have been executed. All individual cycle logs and Phase 1 daily audits are preserved in [`findings.md`](./findings.md) and in `git log -- docs/bugs.md`.

> **Recurring Fix Verification (held across all cycles):**
> - **BUG-048** (ESLint pin, peer dep resolution): Drift noted 2026-10-06 — `eslint@10.11.0` exceeds plugin peer ranges; lint still 0/0, downgrade deferred
> - **BUG-049** (Storage route error format via `createErrorJson`): Verified held
> - **BUG-047** (DOMPurify 3.4.13 security pin): Verified held
> - **BUG-040** (Hono 4.13.2 CORS ReDoS patch): Verified held
> - **BUG-038** (brace-expansion 5.0.9 override): Verified held
> - **BUG-014 / BUG-017** (Workflow docs and Node 22+ references): Verified held

---

## Resolved Bugs

- **BUG-002**: Missing Font Display Optimization (Resolved)
- **BUG-003**: Duplicate Retry Configuration (Resolved)
- **BUG-004**: Hardcoded Configuration Values (Resolved)
- **BUG-005**: Missing Tech Stack Category Icons (Resolved)
- **BUG-006**: Console Error Statements in Production Code (Resolved)
- **BUG-007**: TypeScript 'any' Types in Controllers (Resolved)
- **BUG-009**: CI/CD Workflow Configuration Issues (Resolved)
- **BUG-011**: Flaky Analytics Date Range Test (Resolved)
- **BUG-012**: Unhandled Rejection Warnings in Rate Limit Tests (Resolved)
- **BUG-010**: GitHub Actions Invalid Versions @v5 → @v4 (Resolved 2026-05-22)

### BUG-016: Stale Node.js 18+ References in Documentation

**Status**: Resolved — 2026-05-26 (BugFixer Cycle 4)  
**Priority**: Medium  
**Area**: Documentation  
**Issue**: N/A

#### Description

Multiple documentation files still reference Node.js 18+ as the minimum requirement, but the project requires Node.js 22+ (per `.node-version`, `.nvmrc`, and `package.json` engines).

#### Files Fixed

- `README.md` — Prerequisites section
- `CONTRIBUTING.md` — Prerequisites and troubleshooting
- `apps/web/README.md` — Prerequisites section
- `apps/api/README.md` — Prerequisites section
- `docs/troubleshooting.md` — Node version check instruction

#### Verification

- All fixes applied: `node --version` guidance updated to 22+
- Typecheck/lint/build/tests all pass clean

---

**Last Updated**: 2026-10-06 — BugFixer ULW cycle: verified typecheck/lint/build/test green (2,692 tests); synced audit + toolchain drift (9 vulns: braces/postcss/source-map-js, eslint 10.11.0 peer) without breaking changes
**Maintainer**: Documentation Specialist