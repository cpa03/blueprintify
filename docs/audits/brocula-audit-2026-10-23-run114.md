# BroCula Audit — Run 114 (2026-10-23)

**Branch:** `brocula/loop-2026-10-23-run114`
**Base:** `origin/main` at `57542ed9` (docs(bugs): hygiene sync — test count 2883→2884 (#3861))
**Date:** 2026-10-23

## Summary

BroCula ULW Loop — LH **98 hunt / 99-97-98 warm — 100-100-100** ⭐

- Hunt: **98** (a11y/BP/SEO 100, FCP/LCP 0.5s class, TBT 140ms, CLS 0.007, 230 KiB)
- Warm1: 99 (FCP/LCP 1.0s, TBT 120ms, savings>0 audits 0)
- Warm2: 97 (FCP/LCP 1.9s, TBT 140ms, savings>0 audits 1 = unused-javascript 26 KiB displayValue)
- Warm3: 98 (FCP/LCP 1.3s, TBT 140ms, savings>0 audits 0)
- Sub-100 warm performance = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113 precedent
- Hunt `unused-javascript` 26 KiB `vendor-react-dom-Cm_-9BQy.js` flag (framework-inherent same chunk hash as Run 106/107/108/109/110/111/112/113, no code-level action); hunt savings>0 audits 1 (displayValue only, same flag)
- **0 console errors/warnings** (hunt)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions** on clean re-sweep; first attempt `18/22` with `ERR_CONNECTION_REFUSED` on lazy chunks = hunt-orphan teardown race per Run 90/91/95/96/97/98/99/101/104/107/109/113 precedent)
- **0 actionable optimization opportunities**
- All **2,885 tests pass** (1,339 web + 555 api + 991 shared)
- All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, secrets scan ✅ 348 files, npm audit ✅ 0 vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248) installed on runner for this run
- Validates `origin/main` at `57542ed9` (4 commits past Run 113 base: #3856/#3861/#3862/#3863) with no regressions, no app code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **98**      | 100           | 100            | 100 |
| Warm1 | 99          | 100           | 100            | 100 |
| Warm2 | 97          | 100           | 100            | 100 |
| Warm3 | 98          | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 0.5 s | 0.5 s | 140ms | 0.007 | 230 KiB |
| Warm1 | 1.0 s | 1.0 s | 120ms | 0.007 | 230 KiB |
| Warm2 | 1.9 s | 1.9 s | 140ms | 0.007 | 230 KiB |
| Warm3 | 1.3 s | 1.3 s | 140ms | 0.007 | 230 KiB |

Hunt diagnostics: JavaScript execution time 0.5 s, main-thread work 1.9 s.
Hunt `unused-javascript` flag: `vendor-react-dom-Cm_-9BQy.js` 26 KiB displayValue
(framework-inherent, identical chunk hash to Run 106/107/108/109/110/111/112/113; hunt
savings>0 audits 1 (displayValue only), warm2 reported the 26 KiB displayValue only,
warm1/warm3 savings>0 audits 0).

## Interactive Sweep Results

First attempt failed with `18/22` (`ERR_CONNECTION_REFUSED` on lazy chunks) = hunt-orphan
teardown race (Run 90/91/95/96/97/98/99/101/104/107/109/113 precedent). Re-ran with fresh
in-session `npx vite preview --port 4173 --strictPort` after killing the hunt-orphan —
**25/25 assertions passed**:
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
| Secrets scan | ✅ (348 files) |
| npm audit | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,885/2,885 |

## Test Breakdown

- Web: 1,339 tests ✅ (87 files)
- API: 555 tests ✅ (35 files)
- Shared: 991 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `57542ed9` with no console errors, Lighthouse **98 hunt /
99-97-98 warm (ARM64 CPU variance)**, 25/25 sweep assertions pass on clean re-sweep,
all 2,885 tests pass, all quality gates green.
