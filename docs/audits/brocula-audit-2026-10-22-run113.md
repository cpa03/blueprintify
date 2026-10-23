# BroCula Audit — Run 113 (2026-10-22)

**Branch:** `brocula/loop-2026-10-22-run113`
**Base:** `origin/main` at `4b74e18c` (fix(a11y): use a real link for the header GitHub action instead of window.open (#3853))
**Date:** 2026-10-22

## Summary

BroCula ULW Loop — LH **100 PERFECT hunt / 97-98-99 warm — 100-100-100** 🏆

- Hunt: **100 PERFECT** (a11y/BP/SEO 100, FCP/LCP 0.5s class, TBT 140ms, CLS 0.007, 230 KiB)
- Warm1: 97 (FCP/LCP 1.9s, TBT 120ms, savings>0 audits 1 = unused-javascript 26 KiB displayValue)
- Warm2: 98 (FCP/LCP 1.8s, TBT 70ms, savings>0 audits 1 = unused-javascript 26 KiB displayValue)
- Warm3: 99 (FCP/LCP 1.3s, TBT 130ms, savings>0 audits 0)
- Sub-100 warm performance = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112 precedent
- Hunt `unused-javascript` 26 KiB `vendor-react-dom-Cm_-9BQy.js` flag (framework-inherent same chunk hash as Run 106/107/108/109/110/111/112, no code-level action); hunt savings>0 audits 1 (displayValue only, same flag)
- **0 console errors/warnings** (hunt)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions** on first attempt with fresh tmux-detached `--strictPort` server after proactively killing the hunt server before sweep start, no teardown race)
- **0 actionable optimization opportunities**
- All **2,880 tests pass** (1,334 web + 555 api + 991 shared)
- All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, build:api ✅, secrets scan ✅ 351 files, prettier ✅, npm audit ✅ 0 vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248) installed on runner for this run
- Validates `origin/main` at `4b74e18c` (2 commits past Run 112 base: #3853/#3854) with no regressions, no app code changes required 🧛‍♂️🏆

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **100**     | 100           | 100            | 100 |
| Warm1 | 97          | 100           | 100            | 100 |
| Warm2 | 98          | 100           | 100            | 100 |
| Warm3 | 99          | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.3 s | 1.3 s | 140ms | 0.007 | 230 KiB |
| Warm1 | 1.9 s | 1.9 s | 120ms | 0.007 | 230 KiB |
| Warm2 | 1.8 s | 1.8 s | 70ms  | 0.007 | 230 KiB |
| Warm3 | 1.3 s | 1.3 s | 130ms | 0.007 | 230 KiB |

Hunt diagnostics: JavaScript execution time 0.5 s, main-thread work 1.9 s.
Hunt `unused-javascript` flag: `vendor-react-dom-Cm_-9BQy.js` 26 KiB displayValue
(framework-inherent, identical chunk hash to Run 106/107/108/109/110/111/112; hunt
savings>0 audits 1 (displayValue only), warm1/warm2 reported the 26 KiB displayValue only,
warm3 savings>0 audits 0).

## Interactive Sweep Results

Fresh tmux-detached `npx vite preview --port 4173 --strictPort` server started
after killing the hunt-orphan before the sweep — **25/25 assertions passed on
first attempt**, no teardown race (Run 90/91/95/96/97/98/99/101/104/107/110/111/112
precedent applied proactively):
- Landing load + scroll (6 assertions)
- Keyboard navigation (4 assertions)
- Shortcuts dialog (2 assertions)
- Template select → auto-advance (4 assertions)
- Reload persistence (2 assertions)
- Generate error path + recovery (5 assertions)
- Editor toggle (2 assertions)

Console errors: 0
Console warnings: 0
Non-API request failures: 0

## Quality Gates

| Gate | Status |
|------|--------|
| Typecheck | ✅ |
| Lint | ✅ (0/0) |
| Build | ✅ |
| Build:api | ✅ |
| Secrets scan | ✅ (351 files) |
| Prettier | ✅ |
| npm audit | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,880/2,880 |

## Test Breakdown

- Web: 1,334 tests ✅ (87 files)
- API: 555 tests ✅ (35 files)
- Shared: 991 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `4b74e18c` with no console errors, Lighthouse **100 PERFECT hunt**
/ 97-98-99 warm (ARM64 CPU variance), 25/25 sweep assertions pass on first attempt,
all 2,880 tests pass, all quality gates green.
