# BroCula Audit — Run 121 (2026-10-25)

**Branch:** `brocula/loop-2026-10-25-run121`
**Base:** `origin/main` at `bbd17809` (Run 120 audit merge)
**Date:** 2026-10-25

## Summary

BroCula ULW Loop — LH **93 hunt / 99-92-92 warm — 100-100-100** ⭐

- Hunt: **93** (a11y/BP/SEO 100, FCP 1.9s/LCP 2.9s, TBT 110ms, CLS 0.007, 231 KiB,
  savings>0 audits 1)
- Warm1: **99** (FCP/LCP 1.5s, TBT 110ms, savings>0 audits 0)
- Warm2: 92 (FCP 2.0s/LCP 2.9s, TBT 130ms, savings>0 audits 1) — elevated FCP/LCP band =
  ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120
  precedent (same band as Run 110 warm1 92 / Run 111 warm2 91 / Run 115 warm3 91 /
  Run 120 warm1 92), in-session warm1 99 = variance not regression
- Warm3: 92 (FCP 1.9s/LCP 2.9s, TBT 130ms, savings>0 audits 1) — same elevated band as
  warm2, byte weight and CLS constant
- Byte weight 231 KiB and CLS 0.007 constant across all four passes
- Hunt + warm2 + warm3 flag `unused-javascript` 26 KiB `vendor-react-dom-Cm_-9BQy.js`
  26,640 B wasted (framework-inherent same chunk hash as Run 106/107/108/109/110/111/112/113/114/115/116/117/118/119/120,
  no code-level action); warm1 savings>0 audits 0
- **0 console errors/warnings** (hunt + sweep)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with
  Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review +
  reload persistence with Generate enabled + generate error path with verified recovery buttons
  incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions**
  on first attempt with fresh tmux-detached `--strictPort` server after killing hunt-orphan
  on 4173, no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120
  precedent)
- **0 actionable optimization opportunities** (only the framework-inherent `unused-javascript` flag)
- All **2,953 tests pass** (1,375 web + 555 api + 1,023 shared — web +11 vs Run 120 count
  from #3894 fragment deep-link tests)
- All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, build:api ✅, prettier ✅,
  secrets scan ✅ 354 files, npm audit ✅ 0 production vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248 full + headless shell) installed on runner
  (cache empty at run start)
- Validates `origin/main` at `bbd17809` (3 commits past Run 120 base adb5c98d: #3892
  repokeeper hygiene cycle 23 docs, #3894 feat(a11y) fragment deep links — app change
  covered green by this sweep, #3893 Run 120 docs merge) with no regressions,
  no app code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **93**      | 100           | 100            | 100 |
| Warm1 | **99**      | 100           | 100            | 100 |
| Warm2 | 92          | 100           | 100            | 100 |
| Warm3 | 92          | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.9 s | 2.9 s | 110ms | 0.007 | 231 KiB |
| Warm1 | 1.5 s | 1.5 s | 110ms | 0.007 | 231 KiB |
| Warm2 | 2.0 s | 2.9 s | 130ms | 0.007 | 231 KiB |
| Warm3 | 1.9 s | 2.9 s | 130ms | 0.007 | 231 KiB |

Hunt diagnostics: main-thread work 1.7 s.
Hunt `unused-javascript` flag: `vendor-react-dom-Cm_-9BQy.js` 26,640 B wasted
(framework-inherent, identical chunk hash to Run 106/107/108/109/110/111/112/113/114/115/116/117/118/119/120;
flag on hunt + warm2 + warm3, savings>0 audits 0 on warm1;
byte weight constant 231 KiB and CLS 0.007 across all four passes).

## Interactive Sweep Results

Fresh tmux-detached `npx vite preview --port 4173 --strictPort` server started after
killing hunt-orphan on 4173 — **25/25 assertions passed on first attempt**:
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
| Secrets scan | ✅ (354 files) |
| npm audit (prod) | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,953/2,953 |

## Test Breakdown

- Web: 1,375 tests ✅ (91 files)
- API: 555 tests ✅ (35 files)
- Shared: 1,023 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `bbd17809` with no console errors, Lighthouse **93 hunt /
99-92-92 warm (ARM64 CPU variance on hunt + warm2/warm3, warm1 99 in-session recovery)**,
25/25 sweep assertions pass on first attempt, all 2,953 tests pass, all quality gates green.
