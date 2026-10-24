# BroCula Audit — Run 115 (2026-10-24)

**Branch:** `brocula/loop-2026-10-24-run115`
**Base:** `origin/main` at `8e7ad57f` (docs(bugfixer): hygiene cycle 18 2026-10-23 (#3864))
**Date:** 2026-10-24

## Summary

BroCula ULW Loop — LH **99 hunt / 98-94-91-97 warm — 100-100-100** ⭐

- Hunt: **99** (a11y/BP/SEO 100, FCP/LCP 1.0s, TBT 140ms, CLS 0.007, 230 KiB, savings>0 audits 0)
- Warm1: 98 (FCP/LCP 2.0s, TBT 60ms, savings>0 audits 1 = unused-javascript 26 KiB displayValue)
- Warm2: 94 (FCP 1.4s, LCP 2.9s, TBT 120ms, savings>0 audits 1 = unused-javascript 26 KiB displayValue)
- Warm3: 91 (FCP/LCP 2.0/2.9s, TBT 150ms, savings>0 audits 1 = unused-javascript 26 KiB displayValue)
- Warm4: 97 (FCP/LCP 1.9s, TBT 120ms, savings>0 audits 1 = unused-javascript 26 KiB displayValue)
  (4th pass run to characterize the low warm band; 91→97 recovery within the same session confirms variance, not regression)
- Sub-100 warm performance = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114 precedent; warm3 91 same FCP/LCP profile as Run 105 warm1 91 and Run 111 warm2 91
- Hunt `unused-javascript` 26 KiB `vendor-react-dom-Cm_-9BQy.js` flag (framework-inherent same chunk hash as Run 106/107/108/109/110/111/112/113/114, no code-level action); warm1–4 savings>0 audits 1 (displayValue only, same flag)
- **0 console errors/warnings** (hunt)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions** on first attempt after proactively killing the hunt-orphan and starting a fresh tmux-detached `--strictPort` server, no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113 precedent)
- **0 actionable optimization opportunities**
- All **2,891 tests pass** (1,345 web + 555 api + 991 shared)
- All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, build:api ✅, prettier ✅, secrets scan ✅ 352 files, npm audit ✅ 0 production vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248) installed on runner for this run
- Validates `origin/main` at `8e7ad57f` (4 commits past Run 114 merge: #3864/#3865/#3866/#3868) with no regressions, no app code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **99**      | 100           | 100            | 100 |
| Warm1 | 98          | 100           | 100            | 100 |
| Warm2 | 94          | 100           | 100            | 100 |
| Warm3 | 91          | 100           | 100            | 100 |
| Warm4 | 97          | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.0 s | 1.0 s | 140ms | 0.007 | 230 KiB |
| Warm1 | 2.0 s | 2.0 s | 60ms  | 0.007 | 230 KiB |
| Warm2 | 1.4 s | 2.9 s | 120ms | 0.007 | 230 KiB |
| Warm3 | 2.0 s | 2.9 s | 150ms | 0.007 | 230 KiB |
| Warm4 | 1.9 s | 1.9 s | 120ms | 0.007 | 230 KiB |

Hunt diagnostics: JavaScript execution time 0.5 s, main-thread work 1.8 s.
Hunt `unused-javascript` flag: `vendor-react-dom-Cm_-9BQy.js` 26,640 B wasted
(framework-inherent, identical chunk hash to Run 106/107/108/109/110/111/112/113/114;
hunt savings>0 audits 0, warm1–4 savings>0 audits 1 each (displayValue only, same flag);
byte weight constant 230 KiB and CLS 0.007 across all five passes — identical to Run 114).

## Interactive Sweep Results

Fresh tmux-detached `npx vite preview --port 4173 --strictPort` server started after
proactively killing the hunt-orphan — **25/25 assertions passed on first attempt**:
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
| Build API | ✅ |
| Prettier | ✅ |
| Secrets scan | ✅ (352 files) |
| npm audit (prod) | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,891/2,891 |

## Test Breakdown

- Web: 1,345 tests ✅ (87 files)
- API: 555 tests ✅ (35 files)
- Shared: 991 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `8e7ad57f` with no console errors, Lighthouse **99 hunt /
98-94-91-97 warm (ARM64 CPU variance, 4th-pass recovery 91→97 confirms variance)**,
25/25 sweep assertions pass on first attempt, all 2,891 tests pass,
all quality gates green.
