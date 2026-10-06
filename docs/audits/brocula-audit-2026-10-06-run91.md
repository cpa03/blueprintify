# BroCula Audit — 2026-10-06 Run 91

**Branch**: `brocula/loop-2026-10-06-run-91`
**Date**: 2026-10-06
**Mode**: Production build (`vite build`) + Preview server (port 4173, `--strictPort`) + Playwright interactive sweep (landing load/scroll + keyboard nav + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence + generate error path with verified recovery buttons + editor toggle) + Lighthouse (hunt pass + 2 warm re-passes)

## Summary

| Check | Result |
|---|---|
| Console Errors | **0** ✅ (only expected `/api/generate` 502s during error-path test — API not running in audit environment) |
| Console Warnings | **0** ✅ |
| Failed non-API Requests | **0** ✅ |
| LH Performance (Prod) | **98 hunt / 99-100 warm — 100-100-100** ⭐ (hunt pass FCP/LCP 1.7s, TBT 100ms, SI 1.9s est., TTI 2.4s est.; warm re-passes FCP/LCP 1.4s→0.6s, TBT 80ms both, CLS 0.007, identical 227 KiB byte weight — sub-100 = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90 precedent) |
| LH Accessibility | **100** 🏆 |
| LH Best Practices | **100** 🏆 |
| LH SEO | **100** 🏆 |
| Optimization Opportunities | **0 actionable** ✅ (hunt flags a single `unused-javascript` 26 KiB from `vendor-react-dom` — framework-inherent, 0 savings on both warm passes; no code-level action) |
| Tests | **2,691 pass** (1,270 web + 547 api + 874 shared) ✅ |
| Quality Gates | All pass ✅ (npm audit: 6 high + 3 moderate, all pre-existing chains — `braces`→tailwind 3.x + `source-map-js` + `postcss-selector-parser`, breaking-fix only — no action) |

## Changes in This Run

- **No application code changes required.** BroCula hunt (build → preview → console capture → Lighthouse) returned **0 errors, 0 warnings, 0 failed non-API requests**, and Lighthouse **98 hunt / 99-100 warm — 100-100-100** ⭐ (sub-100 Performance = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90 precedent: hunt FCP/LCP 1.7s TBT 100ms; warms FCP/LCP 1.4s→0.6s TBT 80ms, CLS 0.007, identical 227 KiB byte weight). The single flagged `unused-javascript` (26 KiB, `vendor-react-dom`) appears on hunt only with 0 savings on both warms — variance, not regression. The interactive sweep (`scripts/brocula-sweep.mjs`, **25/25 assertions**) returned **0 console errors / 0 warnings / 0 failed non-API requests** on the clean managed re-run. Code is clean; no fixes or optimizations needed.
- **Playwright Chromium installed** on this runner (`npx playwright install chromium`) — browser binaries were missing on the fresh runner (same as Run 76/77/78/79/80/81/82/83/84/85/86/87/88/90 precedent).
- First manual sweep attempt's `ERR_CONNECTION_REFUSED` chunk loads = invalid manual preview invocation (`--cwd` flag) in this run, not an app regression — resolved on clean managed re-run with fresh `--strictPort` server — **25/25**.

## Lighthouse Results (Preview Server, Production Bundle)

Lighthouse ran on the GitHub runner (aarch64) against the production preview server (`http://localhost:4173`) using Playwright's Chromium:

| Category | Hunt Pass | Warm Re-pass 1 | Warm Re-pass 2 |
|---|---|---|---|
| Performance | **98** ⭐ | **99** ⭐ | **100** 🏆 |
| Accessibility | **100** 🏆 | **100** 🏆 | **100** 🏆 |
| Best Practices | **100** 🏆 | **100** 🏆 | **100** 🏆 |
| SEO | **100** 🏆 | **100** 🏆 | **100** 🏆 |

Savings>0 audits: hunt **1** (`unused-javascript` 26 KiB `vendor-react-dom`), warm1 **0**, warm2 **0** — single-audit flag on cold hunt only = cold-start/CPU variance, not a code regression. Hunt FCP/LCP 1.7s, TBT 100ms; warms FCP/LCP 1.4s→0.6s, TBT 80ms both, with identical 227 KiB byte weight (held from Run 90).

## Lighthouse Diagnostics (hunt pass / warm re-passes)

| Metric | Hunt | Warm |
|---|---|---|
| First Contentful Paint | 1.7s | 1.4s → 0.6s |
| Largest Contentful Paint | 1.7s | 1.4s → 0.6s |
| Total Blocking Time | 100ms | 80ms |
| Speed Index | 1.9s est. | — |
| Time to Interactive | 2.4s est. | — |
| Cumulative Layout Shift | 0.007 | 0.007 |
| Total Byte Weight | 227 KiB | 227 KiB |
| JS Execution Time | 0.4s | — |
| Main-Thread Work | 1.7s | — |

## Verification Scope

BroCula hunt (production landing page, networkidle, scroll) plus a Playwright sweep (`scripts/brocula-sweep.mjs`) exercising:

1. Landing page load (networkidle) — **0 errors / 0 warnings / 0 failed non-API requests**
2. Full-page scroll (LCP/content trigger) — scroll-to-top helper appears; **0 errors / 0 warnings**
3. Keyboard navigation — ArrowRight/Home/End roving tabindex on template cards (focus moves to first/last card), Tab advances focus
4. Shortcuts dialog — `?` opens (role=dialog), `Escape` closes cleanly
5. Template select → wizard activation — template auto-advances to Review with Generate Blueprint enabled, persists `blueprint-*` localStorage state
6. Page reload — wizard state persists (localStorage read path) with **0 console errors/warnings**; Generate Blueprint remains enabled on restored Review
7. Generate error path — API-unavailable retry flow surfaces recovery buttons (**Try Again** + **Back to Review**); **Back to Review recovery verified returning to Review step**; **Try Again verified returning to Review for retry** (per its ARIA contract); page stays alive with no crash; only expected `/api/generate` failures, zero non-API failures
8. Editor toggle — Ctrl+E hides the (auto-opened-during-generation) editor panel, Ctrl+E re-opens it

All sweep assertions passed (**25/25**) on the clean managed re-run against a freshly started `--strictPort` preview server. The `npm run brocula` hunt (landing page, networkidle, scroll) is the authoritative gate for this run and is fully clean on console.

## Console Findings

- **0 errors** across the landing page (production build) and interactive sweep (keyboard nav, template select, reload, generate error path, editor toggle)
- **0 warnings**
- **0 failed non-API network requests** (only expected `/api/generate` failures during the API-unavailable error-path test — the API server is not running in the audit environment)

## Optimization Opportunities

**None actionable.** The lone flagged audit (`unused-javascript`, 26 KiB `vendor-react-dom-xGqjuPrj.js`) is framework-inherent client-only React-DOM weight, already isolated in its own `vendor-react-dom` chunk so it never bloats other cache keys (see `vite.config.ts` manualChunks comment). It appears on hunt only with 0 savings on both warms — variance, not regression. `unused-css-rules` (1.0), `total-byte-weight` 227 KiB (1.0), `bootup-time`, `mainthread-work-breakdown` all pass.

| Lighthouse Category | Score | Notes |
|---|---|---|
| Performance | 98 hunt / 99-100 warm ⭐ | Hunt FCP/LCP 1.7s, TBT 100ms; warms FCP/LCP 1.4s→0.6s, TBT 80ms, CLS 0.007 — sub-100 = ARM64 variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90 precedent |
| Accessibility | 100 🏆 | Proper ARIA labels, contrast, semantic HTML |
| Best Practices | 100 🏆 | HTTPS, no deprecated APIs, no known security issues |
| SEO | 100 🏆 | Meta tags, viewport, robots, descriptive links |

## Quality Gates

- Build ✅ (`vite build` exit 0, ~9s)
- Build API ✅ (`wrangler deploy --dry-run` exit 0)
- Typecheck (shared/api/web) ✅
- Lint ✅ (0 errors, **0 warnings** — verified with `--max-warnings 0` via `npm run lint`)
- Secrets scan ✅ (340 files)
- `npm audit` ⚠️ (6 high + 3 moderate: `braces` stack-exhaustion via `tailwindcss@3.4.19`→`chokidar`/`micromatch`/`fast-glob` chain + `source-map-js` event-loop DoS + `postcss-selector-parser` quadratic parsing; fixes require breaking majors — no action this run)
- Test (web) — 1,270 passed ✅
- Test (api) — 547 passed ✅
- Test (shared) — 874 passed ✅
- Prettier ✅ (`format:check` clean)
- Wrangler validate ✅

## Verdict

**🧛‍♂️ 0 console errors, 0 warnings, 0 failed non-API requests, 0 actionable optimization opportunities.** LH **98 hunt / 99-100 warm — 100-100-100** ⭐ (sub-100 Performance = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90 precedent; lone `unused-javascript` flag is framework-inherent and hunt-only, identical 227 KiB byte weight). All **2,691 tests pass** (1,270 web + 547 api + 874 shared). All quality gates pass (typecheck ✅, lint 0/0 ✅, build + build:api ✅, secrets scan ✅ 340 files, prettier ✅; npm audit 6 high + 3 moderate pre-existing, breaking-fix only). Interactive sweep **25/25 assertions** on clean managed re-run. No application code changes required this run; Playwright Chromium installed on the runner.

---

*BroCula — Browser Console Vampire Hunter 🧛‍♂️*
