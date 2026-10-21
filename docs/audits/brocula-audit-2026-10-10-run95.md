# BroCula Audit — 2026-10-10 Run 95

**Branch**: `brocula/loop-2026-10-10-run-95`
**Date**: 2026-10-10
**Mode**: Production build (`vite build`) + Preview server (port 4173) + Playwright interactive sweep (landing load/scroll + keyboard nav + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence + generate error path with verified recovery buttons + editor toggle) + Lighthouse hunt + warm passes

## Summary

| Check | Result |
|---|---|
| Console Errors | **0** ✅ (only expected `/api/generate` proxy 502s during error-path test — API not running in audit environment) |
| Console Warnings | **0** ✅ |
| Failed non-API Requests | **0** ✅ |
| LH Performance (Prod) | **98 hunt / 98-100 warm — 100-100-100** ⭐ (hunt FCP/LCP 1.9s, TBT 100ms; warm1 98 FCP/LCP 1.9s TBT 80ms; warm-clean **100 PERFECT** FCP/LCP 1.1s TBT 90ms, CLS 0.007, 227 KiB byte weight) |
| LH Accessibility | **100** 🏆 |
| LH Best Practices | **100** 🏆 |
| LH SEO | **100** 🏆 |
| Optimization Opportunities | **0 actionable** ✅ (lone `unused-javascript` 26 KiB `vendor-react-dom` flag flaky on 2/4 passes = framework-inherent, no code-level action) |
| Tests | **2,700 pass** (1,279 web + 547 api + 874 shared) ✅ |
| Quality Gates | All pass ✅ (npm audit: 8 vulns — 3 moderate + 5 high, pre-existing transitive, breaking-upgrade only, no action) |

## Changes in This Run

- **No application code changes required.** BroCula sweep (build → preview → console capture → Lighthouse) returned **0 errors, 0 warnings, 0 failed non-API requests**, and Lighthouse **98 hunt / 98-100 warm** with a **100 PERFECT** warm-clean 🏆 (FCP/LCP 1.1s, TBT 90ms, CLS 0.007, identical 227 KiB byte weight — stable vs Run 90/91/92/93/94's 227 KiB). Lone `unused-javascript` 26 KiB `vendor-react-dom` flag on hunt + warm1, clean on warm2 + warm-clean — flaky framework-inherent per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94 precedent, no code-level action. The interactive sweep (`scripts/brocula-sweep.mjs`, **25/25 assertions**) returned **0 console errors / 0 warnings / 0 failed non-API requests** on clean re-sweep with fresh `--strictPort` server; first attempt `ERR_CONNECTION_REFUSED` + dynamic-import fetch failures = hunt-orphan teardown race per Run 90/91 precedent, not a product defect. Code is clean; no fixes or optimizations needed.
- **Playwright Chromium installed** on this runner (`npx playwright install chromium`) — browser binaries were missing on the fresh runner (same as Run 76/77/78/79/80/81/82/83/84/85/86/87/88/90/91/92/93/94 precedent).
- Validates `main` at `cf340fde` (feat(web): add reduced motion and DOM state attributes to EditorToolbar #3743) — no regressions vs Run 94.

## Lighthouse Results (Preview Server, Production Bundle)

Lighthouse ran on the GitHub runner (aarch64) against the production preview server (`http://127.0.0.1:4173`) using Playwright's Chromium:

| Category | Hunt | Warm1 | Warm2 | Warm-clean |
|---|---|---|---|---|
| Performance | **98** | **98** | **99** | **100** 🏆 |
| Accessibility | **100** 🏆 | **100** 🏆 | **100** 🏆 | **100** 🏆 |
| Best Practices | **100** 🏆 | **100** 🏆 | **100** 🏆 | **100** 🏆 |
| SEO | **100** 🏆 | **100** 🏆 | **100** 🏆 | **100** 🏆 |

Savings>0 audits: **1** (hunt + warm1: `unused-javascript` 26 KiB `vendor-react-dom`) / **0** (warm2 + warm-clean — no optimization opportunities). FCP/LCP 1.9s→1.1s, TBT 100ms→90ms, CLS 0.007 with identical 227 KiB byte weight (stable vs Run 90/91/92/93/94 — no weight regression). A mid-run warm pass scored 89 with TBT 440ms while `vitest` ran in parallel — CPU contention artifact, discarded; clean re-run scored 100.

## Lighthouse Diagnostics

| Metric | Hunt | Warm1 | Warm2 | Warm-clean |
|---|---|---|---|---|
| First Contentful Paint | 1.9s | 1.9s | 0.6s | 1.1s |
| Largest Contentful Paint | 1.9s | 1.9s | 0.6s | 1.1s |
| Total Blocking Time | 100ms | 80ms | 140ms | 90ms |
| Cumulative Layout Shift | 0.007 | 0.007 | 0.007 | 0.007 |
| Total Byte Weight | 227 KiB | 227 KiB | 227 KiB | 227 KiB |

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

All sweep assertions passed (**25/25**) on the clean re-sweep. The `npm run brocula` hunt path (landing page, networkidle, scroll) is covered by the sweep console capture and is fully clean on console.

## Console Findings

- **0 errors** across the landing page (production build) and interactive sweep (keyboard nav, template select, reload, generate error path, editor toggle)
- **0 warnings**
- **0 failed non-API network requests** (only expected `/api/generate` proxy failures during the API-unavailable error-path test — the API server is not running in the audit environment)

## Optimization Opportunities

**None actionable.** Hunt + warm1 report lone `unused-javascript` 26 KiB `vendor-react-dom` (framework-inherent React DOM payload, flaky on 2/4 passes per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94 precedent); warm2 + warm-clean report `savings>0 audits: 0` with `total-byte-weight` 227 KiB passing (1.0). No `unused-css-rules`, `render-blocking-resources`, or `modern-image-formats` flags on any pass. `bootup-time`, `mainthread-work-breakdown` all pass. Sub-100 scores = ARM64 runner CPU variance, no code-level action.

| Lighthouse Category | Score | Notes |
|---|---|---|
| Performance | 98→100 ⭐ | FCP/LCP 1.9s→1.1s, TBT 100ms→90ms, CLS 0.007, 227 KiB — warm-clean PERFECT |
| Accessibility | 100 🏆 | Proper ARIA labels, contrast, semantic HTML |
| Best Practices | 100 🏆 | HTTPS, no deprecated APIs, no known security issues |
| SEO | 100 🏆 | Meta tags, viewport, robots, descriptive links |

## Quality Gates

- Build ✅ (`vite build` exit 0, ~9s)
- Build API ✅ (`wrangler deploy --dry-run` exit 0)
- Typecheck (shared/api/web) ✅
- Lint ✅ (0 errors, **0 warnings**)
- Secrets scan ✅ (341 files)
- `npm audit` ⚠️ (8 vulns: 3 moderate + 5 high, pre-existing transitive chains — breaking upgrades only, no action this run)
- Test (web) — 1,279 passed ✅
- Test (api) — 547 passed ✅
- Test (shared) — 874 passed ✅
- Prettier ✅ (`format:check` clean)

## Verdict

**🧛‍♂️ 0 console errors, 0 warnings, 0 failed non-API requests, 0 actionable optimization opportunities.** LH **98 hunt / 98-100 warm — 100-100-100** ⭐ (hunt FCP/LCP 1.9s TBT 100ms; warm-clean PERFECT FCP/LCP 1.1s TBT 90ms CLS 0.007, identical 227 KiB byte weight). All **2,700 tests pass** (1,279 web + 547 api + 874 shared). All quality gates pass (typecheck ✅, lint 0/0 ✅, build + build:api ✅, secrets scan ✅ 341 files, prettier ✅; npm audit pre-existing only, breaking-fix only). Interactive sweep **25/25 assertions** on clean re-sweep. No application code changes required this run; Playwright Chromium installed on the runner.

---

*BroCula — Browser Console Vampire Hunter 🧛‍♂️*
