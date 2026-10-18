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
| LH Performance (Prod) | **99 hunt / 100-97 warm — 100-100-100** ⭐ (hunt pass FCP/LCP 0.6s, TBT 100ms, CLS 0.007, identical 227 KiB byte weight; warm re-passes FCP/LCP 1.3s/1.9s, TBT 70ms/130ms — sub-100 = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90 precedent) |
| LH Accessibility | **100** 🏆 |
| LH Best Practices | **100** 🏆 |
| LH SEO | **100** 🏆 |
| Optimization Opportunities | **0 actionable** ✅ (hunt + one warm pass each flag a single `unused-javascript` 26 KiB from `vendor-react-dom` — framework-inherent, 0 savings on the other warm pass; no code-level action) |
| Tests | **2,692 pass** (1,271 web + 547 api + 874 shared) ✅ |
| Quality Gates | All pass ✅ (typecheck ✅, lint 0/0 ✅, build + build:api ✅, secrets scan ✅ 339 files, npm audit exit 0, prettier ✅) |

## Changes in This Run

- **No application code changes required.** BroCula hunt (build → preview → console capture → Lighthouse) returned **0 errors, 0 warnings, 0 failed non-API requests**, and Lighthouse **99 hunt / 100-97 warm — 100-100-100** ⭐ (sub-100 Performance = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90 precedent: hunt FCP/LCP 0.6s TBT 100ms; warms FCP/LCP 1.3s/1.9s TBT 70ms/130ms, CLS 0.007, identical 227 KiB byte weight). The single flagged `unused-javascript` (26 KiB, `vendor-react-dom`) appears on only 2 of 3 passes and is framework-inherent client-only React-DOM weight — already isolated in its own chunk per `vite.config.ts` — no code-level action warranted. The interactive sweep (`scripts/brocula-sweep.mjs`, **25/25 assertions**) returned **0 console errors / 0 warnings / 0 failed non-API requests** on the clean re-sweep. Code is clean; no fixes or optimizations needed.
- **Playwright Chromium installed** on this runner (`npx playwright install chromium`) — browser binaries were missing on the fresh runner (same as Run 76/77/78/79/80/81/82/83/84/85/86/87/88/90 precedent).
- First sweep attempt's `ERR_CONNECTION_REFUSED` chunk loads = preview-server teardown race from hunt orphan on port 4173 (Run 86/87/88/90 precedent), resolved on clean re-sweep with fresh `--strictPort` server — **25/25**.

## Lighthouse Results (Preview Server, Production Bundle)

Lighthouse ran on the GitHub runner (aarch64) against the production preview server (`http://localhost:4173`) using Playwright's Chromium:

| Category | Hunt Pass | Warm Re-pass 1 | Warm Re-pass 2 |
|---|---|---|---|
| Performance | **99** ⭐ | **100** 🏆 | **97** ⭐ |
| Accessibility | **100** 🏆 | **100** 🏆 | **100** 🏆 |
| Best Practices | **100** 🏆 | **100** 🏆 | **100** 🏆 |
| SEO | **100** 🏆 | **100** 🏆 | **100** 🏆 |

Savings>0 audits: hunt **1** (`unused-javascript` 26 KiB `vendor-react-dom`), warm1 **0**, warm2 **1** (same `unused-javascript`) — flaky single-audit flag = cold-start/CPU variance, not a code regression. Hunt FCP/LCP 0.6s, TBT 100ms; warms FCP/LCP 1.3s/1.9s, TBT 70ms/130ms with identical 227 KiB byte weight (same as Run 90 — no bundle growth).

## Lighthouse Diagnostics (hunt pass / warm re-passes)

| Metric | Hunt | Warm |
|---|---|---|
| First Contentful Paint | 0.6s | 1.3s / 1.9s |
| Largest Contentful Paint | 0.6s | 1.3s / 1.9s |
| Total Blocking Time | 100ms | 70ms / 130ms |
| Cumulative Layout Shift | 0.007 | 0.007 |
| Total Byte Weight | 227 KiB | 227 KiB |
| JS Execution Time | 0.4s | — |
| Main-Thread Work | 1.5s | — |

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

All sweep assertions passed (**25/25**) on the clean re-sweep against a freshly started `--strictPort` preview server (first attempt's `ERR_CONNECTION_REFUSED` = hunt-orphan teardown race, Run 86/87/88/90 precedent). The `npm run brocula` hunt (landing page, networkidle, scroll) is the authoritative gate for this run and is fully clean on console.

## Console Findings

- **0 errors** across the landing page (production build) and interactive sweep (keyboard nav, template select, reload, generate error path, editor toggle)
- **0 warnings**
- **0 failed non-API network requests** (only expected `/api/generate` failures during the API-unavailable error-path test — the API server is not running in the audit environment)

## Optimization Opportunities

**None actionable.** The lone flagged audit (`unused-javascript`, 26 KiB `vendor-react-dom-xGqjuPrj.js` of 65.7 KiB total) is framework-inherent client-only React-DOM weight, already isolated in its own `vendor-react-dom` chunk so it never bloats other cache keys (see `vite.config.ts` manualChunks comment). It appears on only 2 of 3 passes (hunt + warm2) with 0 savings on warm1 — variance, not regression. `unused-css-rules` (1.0), `total-byte-weight` 227 KiB (1.0), `bootup-time`, `mainthread-work-breakdown` all pass.

| Lighthouse Category | Score | Notes |
|---|---|---|
| Performance | 99 hunt / 100-97 warm ⭐ | Hunt FCP/LCP 0.6s, TBT 100ms; warms FCP/LCP 1.3s/1.9s, TBT 70ms/130ms, CLS 0.007 — sub-100 = ARM64 variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90 precedent |
| Accessibility | 100 🏆 | Proper ARIA labels, contrast, semantic HTML |
| Best Practices | 100 🏆 | HTTPS, no deprecated APIs, no known security issues |
| SEO | 100 🏆 | Meta tags, viewport, robots, descriptive links |

## Quality Gates

- Build ✅ (`vite build` exit 0, ~9.1s)
- Build API ✅ (`wrangler deploy --dry-run` exit 0)
- Typecheck (shared/api/web) ✅
- Lint ✅ (0 errors, **0 warnings**)
- Secrets scan ✅ (339 files)
- `npm audit` ✅ (exit 0)
- Test (web) — 1,271 passed ✅
- Test (api) — 547 passed ✅
- Test (shared) — 874 passed ✅
- Prettier ✅ (`prettier --check .` clean)

## Verdict

**🧛‍♂️ 0 console errors, 0 warnings, 0 failed non-API requests, 0 actionable optimization opportunities.** LH **99 hunt / 100-97 warm — 100-100-100** ⭐ (sub-100 Performance = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90 precedent; lone `unused-javascript` flag is framework-inherent and flaky across passes, identical 227 KiB byte weight). All **2,692 tests pass** (1,271 web + 547 api + 874 shared). All quality gates pass (typecheck ✅, lint 0/0 ✅, build + build:api ✅, secrets scan ✅ 339 files, npm audit ✅, prettier ✅). Interactive sweep **25/25 assertions** on clean re-sweep. No application code changes required this run; Playwright Chromium installed on the runner.

---

*BroCula — Browser Console Vampire Hunter 🧛‍♂️*
