# Bug Log: Known Defects

> **Tracking known bugs and defects** for Blueprintify with status and priority information. Historical cycle-by-cycle audit records live in [`findings.md`](./findings.md).

## Current Defect Status (Oct 2026)

- **Zero code defects**: Typecheck clean; ESLint clean (0 errors, 0 warnings, `--max-warnings=0` exit 0) — verified 2026-10-25.
- **Zero known unhandled exceptions**: Clean console in production bundles.
- **Zero build/lint fatals**: `build`, `build:api`, `typecheck`, `lint`, `format:check`, `scan:secrets`, `validate:wrangler` all passing.
- **Tests green**: 2,953 passed (web 1,375 + api 555 + shared 1,023) — verified 2026-10-25.
- **Known dependency limitation (no non-breaking fix)**: full `npm audit` reports 8 vulnerabilities (4 moderate, 4 high) — all dev-chain: `postcss-selector-parser` transitives via `tailwindcss@3.4.19`/`postcss-nested`/`@tailwindcss/typography` (moderate, GHSA-rj75-hqrm-r3gf CPU exhaustion) plus `zod <4.6.6` via `@cloudflare/vitest-plugin` + `chromium-bidi`/`puppeteer-core` (high, GHSA-mrhx-c7xc-m3w5 memory exhaustion). Both require breaking major upgrades, so tracked here. `npm audit --omit=dev` re-verified 0 production vulnerabilities (2026-10-25). Fixed this cycle (BugFixer 19, non-breaking): `undici` override 7.30.0→7.30.1 (vulnerable range was ≤7.30.0 — 3 advisories: EventSource DoS + SRI bypass + content-length DoS), new `fast-uri` override `3.1.9` (in-range for `ajv@8.20.0`'s `^3.0.1` via lighthouse — 4 advisories: URI scheme spoofing / host confusion etc.), `vitest`/`@vitest/mocker` 4.1.11→4.1.12 patch across api/web/shared (2 advisories: code injection + Windows backslash traversal); net full-audit tally 15 (10 mod/5 high) → 8 (4 mod/4 high). Fixed previously (non-breaking): `shell-quote` critical GHSA-pqg4-j6r4-53mv via override `1.12.0`, `sharp` high GHSA-wq5f-xc86-pv6w via override `0.35.5`, `source-map-js` high GHSA-68fv-2mgg-jv7q via `1.2.2`. Hardening overrides held (root `package.json`): `dompurify@3.4.17`, `brace-expansion@5.0.12`, `fast-uri@3.1.9`, `shell-quote@1.12.0`, `undici@7.30.1`, `ws@8.21.0`, `sharp@0.35.5`, `js-yaml@4.3.1` (+ `miniflare.sharp`); `hono@4.13.13` is a direct `apps/api` dependency and `ajv@6.15.0` a transitive lock pin — neither is an override.
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

**Last Updated**: 2026-10-25 — RepoKeeper Cycle 24: full baseline re-verification on `origin/main` (`bbd17809`, 0-behind, clean tree) — typecheck exit 0, lint 0 errors / 0 warnings (`npx eslint . --ext .ts,.tsx --max-warnings=0` exit 0), prettier / scan:secrets (354 files) / build / build:api / validate:wrangler / validate:models (56 agent files) green, tests 2,953/2,953 (web 1,375/91 + api 555/35 + shared 1,023/5) — header test count FIXED this cycle 2,942 → 2,953 (web 1,364/90 → 1,375/91, +11 web tests from #3894 `useHashScroll` fragment deep links, merged after cycle 23's `adb5c98d` measurement); full audit re-verified 8 (4 mod / 4 high, unchanged: postcss-selector-parser + zod chains, both breaking-major, held); prod `--omit=dev` still 0 vulns; BUG-048 ESLint 10 peer drift re-verified held (lint still 0/0)
**Maintainer**: Documentation Specialist