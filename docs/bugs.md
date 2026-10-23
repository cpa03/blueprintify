# Bug Log: Known Defects

> **Tracking known bugs and defects** for Blueprintify with status and priority information. Historical cycle-by-cycle audit records live in [`findings.md`](./findings.md).

## Current Defect Status (Oct 2026)

- **Zero code defects**: Typecheck clean; ESLint clean (0 errors, 0 warnings, `--max-warnings=0` exit 0) — verified 2026-10-19.
- **Zero known unhandled exceptions**: Clean console in production bundles.
- **Zero build/lint fatals**: `build`, `build:api`, `typecheck`, `lint`, `format:check`, `scan:secrets`, `validate:wrangler` all passing.
- **Tests green**: 2,884 passed (web 1,338 + api 555 + shared 991) — verified 2026-10-23.
- **Known dependency limitation (no non-breaking fix)**: full `npm audit` reports 10 vulnerabilities (5 moderate, 5 high) via `braces@3.0.3` ← `micromatch/fast-glob/chokidar` ← `tailwindcss@3.4.19` (GHSA-vfj7-8cjw-p6xm) plus `postcss-selector-parser` transitives and `vitest`/`@vitest/mocker` (dev-chain; grew from 8→10 after the #3847 `@cloudflare/vitest-plugin` migration). Re-verified 2026-10-23: unchanged on prod path — `braces` has no patched 3.x release; the only audit-suggested path for the tailwind chain is the breaking `tailwindcss@4.x` upgrade, so this is tracked here and not changed in this cycle. `npm audit --omit=dev` re-verified 0 production vulnerabilities. Fixed previously (non-breaking): `shell-quote` critical GHSA-pqg4-j6r4-53mv via override `1.12.0`, `sharp` high GHSA-wq5f-xc86-pv6w via override `0.35.5`, `source-map-js` high GHSA-68fv-2mgg-jv7q via `1.2.2`. Hardening overrides held (root `package.json`): `dompurify@3.4.17`, `brace-expansion@5.0.12`, `shell-quote@1.12.0`, `undici@7.30.0`, `ws@8.21.0`, `sharp@0.35.5`, `js-yaml@4.3.1` (+ `miniflare.sharp`); `hono@4.13.13` is a direct `apps/api` dependency and `ajv@6.15.0` a transitive lock pin — neither is an override.
- **Known toolchain drift (lint still green)**: `eslint@10.12.0` exceeds the peer ranges declared by `eslint-plugin-jsx-a11y`/`eslint-plugin-react` (`^3 || ... || ^9`), so `npm ls eslint` reports invalid peer. `npm run lint` still exits 0 with 0 errors/0 warnings; downgrade to 9.39.5 is deferred to avoid churn.

---

## Active & Tracked Issues

| ID | Title | Priority | Area | Status | Notes |
|----|-------|----------|------|--------|-------|
| **BUG-001** | Frontend bundle size performance | Low | Web | In Progress | Dynamic imports, lazy loading, and Vite/Rolldown bundling applied |
| **BUG-008** | ajv package security vulnerabilities | Medium | Deps | ✅ Resolved | Upgraded to `ajv@6.15.0`; `npm audit` reports 0 vulnerabilities |
| **BUG-013** | esbuild/lighthouse tooling vulnerabilities | Low | Deps | ✅ Resolved | Dependencies pinned; 0 vulnerabilities |
| **BUG-014** | Stale doc references in workflows | Low | CI | ✅ Resolved | All workflow refs point to current `docs/*.md` filenames |
| **BUG-017** | Hardcoded Node.js 20 in workflows | Low | CI | ✅ Resolved | All 5 workflows use `node-version-file: ".node-version"` |
| **BUG-048** | ESLint 10 peer dependency conflict | Low | Tooling | ⚠️ Drift held | `eslint@10.12.0` exceeds plugin peer ranges (`npm ls eslint` invalid); lint still 0 errors/0 warnings; downgrade deferred to avoid churn |
| **BUG-049** | Storage route error response format | Low | API | ✅ Resolved | Standardized via `createErrorJson` |
| **BUG-050** | Cloudflare placeholder resource IDs | Medium | Infra | ✅ Resolved | Real IDs provisioned in `apps/api/wrangler.toml` (`validate:wrangler` clean) |
| **BUG-051** | dompurify GHSA-p98j-92pf-mc4p vulnerability | Medium | Deps | ✅ Resolved | Upgraded to `dompurify@3.4.16`; `npm audit` reports 0 vulnerabilities |

---

## Historical Audit Summary

> Over 110 BugFixer and 600+ ULW orchestration cycles have been executed. All individual cycle logs and Phase 1 daily audits are preserved in [`findings.md`](./findings.md) and in `git log -- docs/bugs.md`.

> **Recurring Fix Verification (held across all cycles):**
> - **BUG-048** (ESLint pin, peer dep resolution): Drift noted 2026-10-08 — `eslint@10.11.0` exceeds plugin peer ranges; lint still 0/0, downgrade deferred
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

**Last Updated**: 2026-10-23 — RepoKeeper Cycle 17: full baseline re-verification on `origin/main` (`ad8e1c6f` = #3856 StepStack reduced-motion + DOM state tracking, 0-behind) — typecheck exit 0, lint 0 errors / 0 warnings, prettier / scan:secrets (352 files) / build / build:api / validate:wrangler / validate:models green, tests 2,884/2,884 (web 1,338/87 + api 555/35 + shared 991/5) re-synced into this file (2,883 → 2,884 after #3856 StepStack merged after cycle-16 branch cut — web +1 StepStack DOM-state test; cycle 16 verified on pre-#3856 base `4548f891`); audit re-verified (prod `--omit=dev` 0 vulns; full 10 = 5 high + 5 moderate — braces@3.0.3 GHSA-vfj7-8cjw-p6xm via tailwindcss@3.4.19 + postcss-selector-parser transitives + vitest/@vitest/mocker from #3847 vitest-plugin migration — no non-breaking fix for the tailwind chain, only tailwindcss@4.x upgrade path); BUG-048 ESLint 10 peer drift re-verified held (lint still 0/0)
**Maintainer**: Documentation Specialist