# BroCula Audit — 2026-10-06 Run 92

**Branch**: `brocula/loop-2026-10-06-run-92`
**Date**: 2026-10-06
**Mode**: Production build (`vite build`) + Preview server (port 4173, `--strictPort`) + Playwright interactive sweep (landing load/scroll + keyboard nav + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence + generate error path with verified recovery buttons + editor toggle) + Lighthouse (hunt pass + 2 warm re-passes)

## Summary

| Check | Result |
|---|---|
| Console Errors | **0** ✅ (only expected `/api/generate` 502s during error-path test — API not running in audit environment) |
| Console Warnings | **0** ✅ |
| Failed non-API Requests | **0** ✅ |
| LH Performance (Prod) | **98 hunt / 98-100 warm — 100-100-100** ⭐ (hunt pass FCP/LCP 1.9s, TBT 100ms, CLS 0.007, identical 227 KiB byte weight; warm1 98 FCP/LCP 1.9s TBT 110ms; warm2 **100 PERFECT** FCP/LCP 1.3s TBT 80ms — sub-100 = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82 precedent) |
| LH Accessibility | **100** 🏆 |
| LH Best Practices | **100** 🏆 |
| LH SEO | **100** 🏆 |
| Optimization Opportunities | **0 actionable** ✅ (hunt + warm1 each flag a single `unused-javascript` 26 KiB from `vendor-react-dom` — framework-inherent, 0 savings on warm2 PERFECT pass; no code-level action) |
| Tests | **2,692 pass** (1,271 web + 547 api + 874 shared) ✅ |
| Quality Gates | All pass ✅ (npm audit: 9 vulns — 3 moderate + 6 high, all pre-existing `braces` stack-exhaustion via `tailwindcss@3.x` chain, breaking v4 upgrade required — no action) |

## Changes in This Run

- **No application code changes required.** BroCula hunt (build → preview → console capture → Lighthouse) returned **0 errors, 0 warnings, 0 failed non-API requests**, and Lighthouse **98 hunt / 98-100 warm — 100-100-100** ⭐ (sub-100 Performance = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82 precedent: hunt FCP/LCP 1.9s TBT 100ms; warm1 FCP/LCP 1.9s TBT 110ms; warm2 PERFECT FCP/LCP 1.3s TBT 80ms, CLS 0.007 throughout, identical 227 KiB byte weight). The single flagged `unused-javascript` (26 KiB, `vendor-react-dom`) appears on only 2 of 3 passes and is framework-inherent client-only React-DOM weight — already isolated in its own chunk per `vite.config.ts` — no code-level action warranted. The interactive sweep (`scripts/brocula-sweep.mjs`, **25/25 assertions**) returned **0 console errors / 0 warnings / 0 failed non-API requests** on the first attempt with a fresh `--strictPort` server (no teardown race this run). Code is clean; no fixes or optimizations needed.
- **Playwright Chromium installed** on this runner (`npx playwright install chromium`) — browser binaries were missing on the fresh runner (same as Run 76/77/78/79/80/81/82/83/84/85/86/87/88/90 precedent).
- Validates `main` at `8a6c5e9b` (fix(web): act test warnings + reduced-motion ShowEditorButton #3724) — the first BroCula run against the post-#3724 tree; no regressions vs Run 90 (identical 227 KiB byte weight, same flaky audit signature).

## Lighthouse Results (Preview Server, Production Bundle)

Lighthouse ran on the GitHub runner (aarch64) against the production preview server (`http://localhost:4173`) using Playwright's Chromium:

| Category | Hunt Pass | Warm Re-pass 1 | Warm Re-pass 2 |
|---|---|---|---|
| Performance | **98** ⭐ | **98** ⭐ | **100** 🏆 |
| Accessibility | **100** 🏆 | **100** 🏆 | **100** 🏆 |
| Best Practices | **100** 🏆 | **100** 🏆 | **100** 🏆 |
| SEO | **100** 🏆 | **100** 🏆 | **100** 🏆 |

Savings>0 audits: hunt **1** (`unused-javascript` 26 KiB `vendor-react-dom`), warm1 **1** (same `unused-javascript`), warm2 **0** — flaky single-audit flag = cold-start/CPU variance, not a code regression. Hunt FCP/LCP 1.9s, TBT 100ms; warm1 FCP/LCP 1.9s, TBT 110ms; warm2 PERFECT FCP/LCP 1.3s, TBT 80ms, CLS 0.007 throughout with identical 227 KiB byte weight (stable vs Run 90's 227 KiB — post-#3724 tree introduces no weight regression).

## Lighthouse Diagnostics (hunt pass / warm re-passes)

| Metric | Hunt | Warm1 | Warm2 |
|---|---|---|---|
| First Contentful Paint | 1.9s | 1.9s | 1.3s |
| Largest Contentful Paint | 1.9s | 1.9s | 1.3s |
| Total Blocking Time | 100ms | 110ms | 80ms |
| Cumulative Layout Shift | 0.007 | 0.007 | 0.007 |
| Total Byte Weight | 227 KiB | 227 KiB | 227 KiB |
| JS Execution Time | 0.4s | — | — |
| Main-Thread Work | 1.9s | — | — |

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

All sweep assertions passed (**25/25**) on the first attempt against a freshly started `--strictPort` preview server (no `ERR_CONNECTION_REFUSED` teardown race this run). The `npm run brocula` hunt (landing page, networkidle, scroll) is the authoritative gate for this run and is fully clean on console.

## Console Findings

- **0 errors** across the landing page (production build) and interactive sweep (keyboard nav, template select, reload, generate error path, editor toggle)
- **0 warnings**
- **0 failed non-API network requests** (only expected `/api/generate` failures during the API-unavailable error-path test — the API server is not running in the audit environment)

## Optimization Opportunities

**None actionable.** The lone flagged audit (`unused-javascript`, 26 KiB `vendor-react-dom-xGqjuPrj.js`) is framework-inherent client-only React-DOM weight, already isolated in its own `vendor-react-dom` chunk so it never bloats other cache keys (see `vite.config.ts` manualChunks comment). It appears on only 2 of 3 passes (hunt + warm1) with 0 savings on the warm2 PERFECT pass — variance, not regression. `unused-css-rules` (1.0), `total-byte-weight` 227 KiB (1.0), `bootup-time`, `mainthread-work-breakdown` all pass.

| Lighthouse Category | Score | Notes |
|---|---|---|
| Performance | 98 hunt / 98-100 warm ⭐ | Hunt FCP/LCP 1.9s, TBT 100ms; warm1 FCP/LCP 1.9s TBT 110ms; warm2 PERFECT FCP/LCP 1.3s TBT 80ms, CLS 0.007 — sub-100 = ARM64 variance per Run 67/70/71/73/74/75/76/78/79/80/81/82 precedent |
| Accessibility | 100 🏆 | Proper ARIA labels, contrast, semantic HTML |
| Best Practices | 100 🏆 | HTTPS, no deprecated APIs, no known security issues |
| SEO | 100 🏆 | Meta tags, viewport, robots, descriptive links |

## Quality Gates

- Build ✅ (`vite build` exit 0, ~9.4s)
- Build API ✅ (`wrangler deploy --dry-run` exit 0)
- Typecheck (shared/api/web) ✅
- Lint ✅ (0 errors, **0 warnings**)
- Secrets scan ✅ (337 files)
- `npm audit` ⚠️ (9 vulns: 3 moderate + 6 high, all pre-existing `braces` stack-exhaustion via `tailwindcss@3.4.19`→`chokidar`/`micromatch`/`fast-glob` chain; fix requires breaking `tailwindcss@4` major — no action this run)
- Test (web) — 1,271 passed ✅
- Test (api) — 547 passed ✅
- Test (shared) — 874 passed ✅
- Prettier ✅ (`format:check` clean)

## Verdict

**🧛‍♂️ 0 console errors, 0 warnings, 0 failed non-API requests, 0 actionable optimization opportunities.** LH **98 hunt / 98-100 warm — 100-100-100** ⭐ (sub-100 Performance = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82 precedent; lone `unused-javascript` flag is framework-inherent and flaky across passes, identical 227 KiB byte weight). All **2,692 tests pass** (1,271 web + 547 api + 874 shared). All quality gates pass (typecheck ✅, lint 0/0 ✅, build + build:api ✅, secrets scan ✅ 337 files, prettier ✅; npm audit pre-existing only, breaking-fix only). Interactive sweep **25/25 assertions** on first attempt. No application code changes required this run; Playwright Chromium installed on the runner.

---

*BroCula — Browser Console Vampire Hunter 🧛‍♂️*
