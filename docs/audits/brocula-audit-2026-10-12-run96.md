# BroCula Audit — 2026-10-12 Run 96

**Branch**: `brocula/loop-2026-10-12-run-96`
**Date**: 2026-10-12
**Mode**: Production build (`vite build`) + Preview server (port 4173, `--strictPort`) + Playwright interactive sweep (landing load/scroll + keyboard nav + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence + generate error path with verified recovery buttons + editor toggle) + Lighthouse hunt + 2 warm passes

## Summary

| Check | Result |
|---|---|
| Console Errors | **0** ✅ (only expected `/api/generate` proxy 502s during error-path test — API not running in audit environment) |
| Console Warnings | **0** ✅ |
| Failed non-API Requests | **0** ✅ |
| LH Performance (Prod) | **99 hunt / 100-100 warm — 100-100-100** 🏆 (hunt FCP/LCP 1.3s, TBT 110ms; warm1 100 FCP/LCP 1.3s TBT 40ms; warm2 100 FCP/LCP 1.3s TBT 70ms, CLS 0.007, 227 KiB byte weight) |
| LH Accessibility | **100** 🏆 |
| LH Best Practices | **100** 🏆 |
| LH SEO | **100** 🏆 |
| Optimization Opportunities | **0 actionable** ✅ (lone `unused-javascript` 26 KiB `vendor-react-dom` flag on hunt only, clean on both warms = framework-inherent, no code-level action) |
| Tests | **2,700 pass** (1,279 web + 547 api + 874 shared) ✅ |
| Quality Gates | All pass ✅ (npm audit: 8 vulns — 3 moderate + 5 high, pre-existing transitive, breaking-upgrade only, no action) |

## Changes in This Run

- **No application code changes required.** BroCula sweep (build → preview → console capture → Lighthouse) returned **0 errors, 0 warnings, 0 failed non-API requests**, and Lighthouse **99 hunt / 100-100 warm** with **100-100-100** on A11y/BP/SEO all passes 🏆 (FCP/LCP 1.3s all passes, TBT 110ms→40ms→70ms, CLS 0.007, identical 227 KiB byte weight — stable vs Run 90/91/92/93/94/95's 227 KiB). Lone `unused-javascript` 26 KiB `vendor-react-dom` flag on hunt only (score 0.5, `overallSavingsMs` filter clean 0/0/0), clean on both warms — flaky framework-inherent per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95 precedent, no code-level action. The interactive sweep (`scripts/brocula-sweep.mjs`, **25/25 assertions**) returned **0 console errors / 0 warnings / 0 failed non-API requests** on the first attempt with a fresh `--strictPort` server, no teardown race. Code is clean; no fixes or optimizations needed.
- **Playwright Chromium installed** on this runner (`npx playwright install chromium`) — browser binaries were missing on the fresh runner (same as Run 76/77/78/79/80/81/82/83/84/85/86/87/88/90/91/92/93/94/95 precedent).
- Validates `main` at `8644f65f` (ScrollToTop `data-has-scrolled` DOM state tracking (#3751)) — no regressions vs Run 95; hunt 98→99 and warms 99→100 are ARM64 runner CPU variance upward, not code-driven.

## Lighthouse Results (Preview Server, Production Bundle)

Lighthouse ran on the GitHub runner (aarch64) against the production preview server (`http://127.0.0.1:4173`) using Playwright's Chromium:

| Category | Hunt | Warm1 | Warm2 |
|---|---|---|---|
| Performance | **99** | **100** 🏆 | **100** 🏆 |
| Accessibility | **100** 🏆 | **100** 🏆 | **100** 🏆 |
| Best Practices | **100** 🏆 | **100** 🏆 | **100** 🏆 |
| SEO | **100** 🏆 | **100** 🏆 | **100** 🏆 |

Savings>0 audits: **0** (hunt — `overallSavingsMs` filter; lone `unused-javascript` 26 KiB `vendor-react-dom` displayValue flag, score 0.5, framework-inherent) / **0** (warm1 — no optimization opportunities) / **0** (warm2 — no optimization opportunities). FCP/LCP 1.3s all passes, TBT 110ms→40ms→70ms, CLS 0.007 with identical 227 KiB byte weight (stable vs Run 90/91/92/93/94/95 — no weight regression).

## Lighthouse Diagnostics

| Metric | Hunt | Warm1 | Warm2 |
|---|---|---|---|
| First Contentful Paint | 1.3s | 1.3s | 1.3s |
| Largest Contentful Paint | 1.3s | 1.3s | 1.3s |
| Total Blocking Time | 110ms | 40ms | 70ms |
| Cumulative Layout Shift | 0.007 | 0.007 | 0.007 |
| Total Byte Weight | 227 KiB | 227 KiB | 227 KiB |

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

**None actionable.** Hunt reports lone `unused-javascript` 26 KiB `vendor-react-dom` displayValue flag (score 0.5, `overallSavingsMs` filter 0 — framework-inherent React DOM payload, hunt-only per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95 precedent); both warms report `savings>0 audits: 0` with `total-byte-weight` 227 KiB passing (1.0). No `unused-css-rules`, `render-blocking-resources`, or `modern-image-formats` flags on any pass. `bootup-time`, `mainthread-work-breakdown` all pass. Hunt 99→warm 100 gap = ARM64 runner CPU variance (cold vs warm JIT), no code-level action.

| Lighthouse Category | Score | Notes |
|---|---|---|
| Performance | 99→100 🏆 | FCP/LCP 1.3s all passes, TBT 110ms→40ms, CLS 0.007, 227 KiB — warms perfect, zero savings |
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

**🧛‍♂️ 0 console errors, 0 warnings, 0 failed non-API requests, 0 actionable optimization opportunities.** LH **99 hunt / 100-100 warm — 100-100-100** 🏆 (FCP/LCP 1.3s all passes, TBT 110ms→40ms→70ms, CLS 0.007, identical 227 KiB byte weight). All **2,700 tests pass** (1,279 web + 547 api + 874 shared). All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, secrets scan ✅ 340 files, prettier ✅; npm audit pre-existing only, breaking-fix only). Interactive sweep **25/25 assertions** on first attempt. No application code changes required this run; Playwright Chromium installed on the runner.

---

*BroCula — Browser Console Vampire Hunter 🧛‍♂️*
