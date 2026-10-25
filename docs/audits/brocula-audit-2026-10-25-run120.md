# BroCula Audit — Run 120 (2026-10-25)

**Branch:** `brocula/loop-2026-10-25-run120`
**Base:** `origin/main` at `adb5c98d` (Repokeeper hygiene cycle 22 merge)
**Date:** 2026-10-25

## Summary

BroCula ULW Loop — LH **99 hunt / 92-99-98 warm — 100-100-100** ⭐

- Hunt: **99** (a11y/BP/SEO 100, FCP/LCP 1.4s, TBT 130ms, CLS 0.007, 231 KiB, savings>0 audits 0)
- Warm1: 92 (FCP 2.0s/LCP 2.8s, TBT 160ms, savings>0 audits 0) — elevated FCP/LCP band =
  ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119
  precedent (warm 92 same band as Run 110 warm1 92 / Run 111 warm2 91 / Run 115 warm3 91),
  in-session recovery to warm2 99 = variance not regression
- Warm2: 99 (FCP/LCP 0.8s, TBT 100ms, savings>0 audits 0)
- Warm3: 98 (FCP/LCP 1.9s, TBT 100ms, savings>0 audits 1)
- Byte weight 231 KiB and CLS 0.007 constant across all four passes
- Hunt + warm3 flag `unused-javascript` 26 KiB `vendor-react-dom-Cm_-9BQy.js` 26,640 B wasted
  (framework-inherent same chunk hash as Run 106/107/108/109/110/111/112/113/114/115/116/117/118/119,
  no code-level action); warm1/warm2 savings>0 audits 0
- **0 console errors/warnings** (hunt + sweep)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with
  Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review +
  reload persistence with Generate enabled + generate error path with verified recovery buttons
  incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions**
  on first attempt with fresh tmux-detached `--strictPort` server after confirming port 4173
  free (hunt cleanup left no orphan), no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119
  precedent)
- **0 actionable optimization opportunities** (only the framework-inherent `unused-javascript` flag)
- All **2,942 tests pass** (1,364 web + 555 api + 1,023 shared — shared +3 vs Run 119 count)
- All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, build:api ✅, prettier ✅,
  secrets scan ✅ 352 files, npm audit ✅ 0 production vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248 full + headless shell) freshly installed on runner
  (cache empty at run start)
- Validates `origin/main` at `adb5c98d` (3 commits past Run 119 base ae3c62e4: #3891
  refactor(flexy) DOM event string literals Iteration 206 — app change covered green by this
  sweep, #3890 docs(audit) Run 119 merge, #3886 docs(repokeeper) hygiene cycle 22) with no
  regressions, no app code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **99**      | 100           | 100            | 100 |
| Warm1 | 92          | 100           | 100            | 100 |
| Warm2 | 99          | 100           | 100            | 100 |
| Warm3 | 98          | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.4 s | 1.4 s | 130ms | 0.007 | 231 KiB |
| Warm1 | 2.0 s | 2.8 s | 160ms | 0.007 | 231 KiB |
| Warm2 | 0.8 s | 0.8 s | 100ms | 0.007 | 231 KiB |
| Warm3 | 1.9 s | 1.9 s | 100ms | 0.007 | 231 KiB |

Hunt diagnostics: JavaScript execution time 0.4 s, main-thread work 1.8 s.
Hunt `unused-javascript` flag: `vendor-react-dom-Cm_-9BQy.js` 26,640 B wasted
(framework-inherent, identical chunk hash to Run 106/107/108/109/110/111/112/113/114/115/116/117/118/119;
flag on hunt + warm3, savings>0 audits 0 on hunt/warm1/warm2;
byte weight constant 231 KiB and CLS 0.007 across all four passes).

## Interactive Sweep Results

Fresh tmux-detached `npx vite preview --port 4173 --strictPort` server started after
confirming port 4173 free (hunt cleanup left no orphan) — **25/25 assertions passed on
first attempt**:
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
| Tests | ✅ 2,942/2,942 |

## Test Breakdown

- Web: 1,364 tests ✅ (90 files)
- API: 555 tests ✅ (35 files)
- Shared: 1,023 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `adb5c98d` with no console errors, Lighthouse **99 hunt /
92-99-98 warm (ARM64 CPU variance on warm1)**, 25/25 sweep assertions pass on first attempt,
all 2,942 tests pass, all quality gates green.
