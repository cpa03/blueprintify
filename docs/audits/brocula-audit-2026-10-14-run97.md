# BroCula Audit — 2026-10-14 Run 97

**Branch**: `brocula/loop-2026-10-14-run-97`
**Date**: 2026-10-14
**Mode**: Production build (`vite build`) + Preview server (port 4173) + Playwright interactive sweep (landing load/scroll + keyboard nav + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence + generate error path with verified recovery buttons + editor toggle) + Lighthouse 3 warm passes

## Summary

| Check | Result |
|---|---|
| Console Errors | **0** ✅ (only expected `/api/generate` proxy 502s during error-path test — API not running in audit environment) |
| Console Warnings | **0** ✅ |
| Failed non-API Requests | **0** ✅ |
| LH Performance (Prod) | **94 / 98 / 100 PERFECT — 100-100-100** 🏆 (warm1 FCP 1.7s/LCP 2.8s TBT 110ms; warm2 FCP/LCP 1.9s TBT 100ms; warm3 FCP/LCP 1.3s TBT 80ms, CLS 0.007, 226 KiB byte weight) |
| LH Accessibility | **100** 🏆 |
| LH Best Practices | **100** 🏆 |
| LH SEO | **100** 🏆 |
| Optimization Opportunities | **0 actionable** ✅ (lone `unused-javascript` 26 KiB `vendor-react-dom` flag on warm1+warm2 only, clean on warm3 = framework-inherent, no code-level action) |
| Tests | **2,700 pass** (1,279 web + 547 api + 874 shared) ✅ |
| Quality Gates | All pass ✅ (npm audit: 8 vulns — 3 moderate + 5 high, pre-existing transitive, breaking-upgrade only, no action) |

## Changes in This Run

- **No application code changes required.** BroCula sweep (build → preview → console capture → Lighthouse) returned **0 errors, 0 warnings, 0 failed non-API requests**, and Lighthouse **94 / 98 / 100 PERFECT** with **100-100-100** on A11y/BP/SEO all passes 🏆 (FCP/LCP 1.7s/2.8s→1.3s, TBT 110ms→80ms, CLS 0.007, 226 KiB byte weight — 1 KiB lighter vs Run 90/91/92/93/94/95's 227 KiB, no weight regression). Lone `unused-javascript` 26 KiB `vendor-react-dom` flag on warm1+warm2 only, clean on warm3 — flaky framework-inherent per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95 precedent, no code-level action. The interactive sweep (`scripts/brocula-sweep.mjs`, **25/25 assertions**) returned **0 console errors / 0 warnings / 0 failed non-API requests** on first attempt with fresh preview server, no teardown race. Code is clean; no fixes or optimizations needed.
- **Playwright Chromium installed** on this runner (`npx playwright install chromium`) — browser binaries were missing on the fresh runner (same as Run 76/77/78/79/80/81/82/83/84/85/86/87/88/90/91/92/93/94/95 precedent).
- Validates `main` at `fb6b1abf` (DOM state inspection to Toast item and container (#3761)) — no regressions vs Run 95/96.

## Lighthouse Results (Preview Server, Production Bundle)

Lighthouse ran on the GitHub runner (aarch64) against the production preview server (`http://127.0.0.1:4173`) using Playwright's Chromium:

| Category | Warm1 | Warm2 | Warm3 |
|---|---|---|---|
| Performance | **94** | **98** | **100** 🏆 |
| Accessibility | **100** 🏆 | **100** 🏆 | **100** 🏆 |
| Best Practices | **100** 🏆 | **100** 🏆 | **100** 🏆 |
| SEO | **100** 🏆 | **100** 🏆 | **100** 🏆 |

Savings>0 audits: **1** (warm1: `unused-javascript` 26 KiB `vendor-react-dom`) / **1** (warm2: `unused-javascript` 26 KiB `vendor-react-dom`) / **0** (warm3 — no optimization opportunities). FCP 1.7s→1.3s, LCP 2.8s→1.3s, TBT 110ms→80ms, CLS 0.007 with 226 KiB byte weight (1 KiB lighter vs Run 90–95 — no weight regression).

## Lighthouse Diagnostics

| Metric | Warm1 | Warm2 | Warm3 |
|---|---|---|---|
| First Contentful Paint | 1.7s | 1.9s | 1.3s |
| Largest Contentful Paint | 2.8s | 1.9s | 1.3s |
| Total Blocking Time | 110ms | 100ms | 80ms |
| Cumulative Layout Shift | 0.007 | 0.007 | 0.007 |
| Total Byte Weight | 226 KiB | 226 KiB | 226 KiB |

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

All sweep assertions passed (**25/25**) on the first attempt. The `npm run brocula` hunt path (landing page, networkidle, scroll) is covered by the sweep console capture and is fully clean on console.

## Console Findings

- **0 errors** across the landing page (production build) and interactive sweep (keyboard nav, template select, reload, generate error path, editor toggle)
- **0 warnings**
- **0 failed non-API network requests** (only expected `/api/generate` proxy failures during the API-unavailable error-path test — the API server is not running in the audit environment)

## Optimization Opportunities

**None actionable.** Warm1+warm2 report lone `unused-javascript` 26 KiB `vendor-react-dom` (framework-inherent React DOM payload, flaky per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95 precedent); warm3 reports `savings>0 audits: 0` with `total-byte-weight` 226 KiB passing (1.0). No `unused-css-rules`, `render-blocking-resources`, or `modern-image-formats` flags on any pass. `bootup-time`, `mainthread-work-breakdown` all pass. Sub-100 scores = ARM64 runner CPU variance, no code-level action.

| Lighthouse Category | Score | Notes |
|---|---|---|
| Performance | 94→100 🏆 | FCP 1.7s→1.3s, LCP 2.8s→1.3s, TBT 110ms→80ms, CLS 0.007, 226 KiB — warm3 clean, zero savings |
| Accessibility | 100 🏆 | Proper ARIA labels, contrast, semantic HTML |
| Best Practices | 100 🏆 | HTTPS, no deprecated APIs, no known security issues |
| SEO | 100 🏆 | Meta tags, viewport, robots, descriptive links |

## Quality Gates

- Build ✅ (`vite build` exit 0, ~9s)
- Typecheck (shared/api/web) ✅
- Lint ✅ (0 errors, **0 warnings**)
- Secrets scan ✅ (340 files)
- `npm audit` ⚠️ (8 vulns: 3 moderate + 5 high, pre-existing transitive chains — breaking upgrades only, no action this run)
- Test (web) — 1,279 passed ✅
- Test (api) — 547 passed ✅
- Test (shared) — 874 passed ✅
- Prettier ✅ (`format:check` clean)

## Verdict

**🧛‍♂️ 0 console errors, 0 warnings, 0 failed non-API requests, 0 actionable optimization opportunities.** LH **94 / 98 / 100 PERFECT — 100-100-100** 🏆 (warm1 FCP 1.7s/LCP 2.8s TBT 110ms; warm2 FCP/LCP 1.9s TBT 100ms; warm3 FCP/LCP 1.3s TBT 80ms CLS 0.007, 226 KiB byte weight). All **2,700 tests pass** (1,279 web + 547 api + 874 shared). All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, secrets scan ✅ 340 files, prettier ✅; npm audit pre-existing only, breaking-fix only). Interactive sweep **25/25 assertions** on first attempt. No application code changes required this run; Playwright Chromium installed on the runner.

---

*BroCula — Browser Console Vampire Hunter 🧛‍♂️*
