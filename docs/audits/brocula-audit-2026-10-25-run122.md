# BroCula Audit — Run 122 (2026-10-25)

**Branch:** `brocula/loop-2026-10-25-run122`
**Base:** `origin/main` at `a0696ecd` (Run 121 audit merge)
**Date:** 2026-10-25

## Summary

BroCula ULW Loop — LH **99 hunt / 100-100-93 warm — 100-100-100** ⭐

- Hunt: **99** (a11y/BP/SEO 100, FCP/LCP 1.3s, TBT 130ms, CLS 0.007, 231 KiB,
  savings>0 audits 0, main-thread work 2.1 s, JS execution 0.5 s)
- Warm1: **100 PERFECT** (FCP/LCP 0.8s, TBT 80ms, savings>0 audits 0)
- Warm2: **100 PERFECT** (FCP/LCP 1.3s, TBT 70ms, savings>0 audits 0)
- Warm3: 93 (FCP 1.6s/LCP 3.0s, TBT 130ms, savings>0 audits 1) — elevated FCP/LCP band =
  ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121
  precedent (same band as Run 110 warm1 92 / Run 111 warm2 91 / Run 115 warm3 91 /
  Run 120 warm1 92 / Run 121 warm2+warm3 92), in-session warm1+warm2 100 = variance not regression
- Byte weight 231 KiB and CLS 0.007 constant across all four passes
- All four passes flag `unused-javascript` `vendor-react-dom-Cm_-9BQy.js`
  26,271–26,640 B wasted (framework-inherent same chunk hash as Run 106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121,
  no code-level action); savings>0 audits 0 on hunt + warm1 + warm2, 1 on warm3 only
- **0 console errors/warnings** (hunt + sweep)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with
  Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review +
  reload persistence with Generate enabled + generate error path with verified recovery buttons
  incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions**
  on first attempt with fresh tmux-detached `--strictPort` server after killing hunt-orphan
  on 4173, no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121
  precedent)
- **0 actionable optimization opportunities** (only the framework-inherent `unused-javascript` flag)
- All **2,958 tests pass** (1,375 web + 555 api + 1,028 shared — shared +5 vs Run 121 count)
- All quality gates pass (typecheck ✅, lint 0/0 ✅ enforced with `--max-warnings=0`, build ✅,
  build:api ✅, prettier ✅, secrets scan ✅ 354 files, npm audit ✅ 0 production vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248 full + headless shell) installed on runner
  (cache empty at run start)
- Validates `origin/main` at `a0696ecd` (5 commits past Run 121 base bbd17809: #3897
  bugfixer docs, #3898 flexy Iteration 207 Framer Motion refactor — app change covered green
  by this sweep, #3896 repokeeper hygiene cycle 24 docs, #3899 chore remove 4 unused export
  modifiers — app change covered green by this sweep, #3895 Run 121 docs merge) with no
  regressions, no app code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **99**      | 100           | 100            | 100 |
| Warm1 | **100**     | 100           | 100            | 100 |
| Warm2 | **100**     | 100           | 100            | 100 |
| Warm3 | 93          | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.3 s | 1.3 s | 130ms | 0.007 | 231 KiB |
| Warm1 | 0.8 s | 0.8 s | 80ms  | 0.007 | 231 KiB |
| Warm2 | 1.3 s | 1.3 s | 70ms  | 0.007 | 231 KiB |
| Warm3 | 1.6 s | 3.0 s | 130ms | 0.007 | 231 KiB |

Hunt diagnostics: main-thread work 2.1 s, JavaScript execution 0.5 s.
`unused-javascript` flag: `vendor-react-dom-Cm_-9BQy.js` 26,271 B (hunt + warm1) /
26,640 B (warm2 + warm3) wasted — framework-inherent, identical chunk hash to
Run 106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121;
savings>0 audits 0 on hunt + warm1 + warm2, 1 on warm3;
byte weight constant 231 KiB and CLS 0.007 across all four passes.

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
| Lint | ✅ (0/0, `--max-warnings=0`) |
| Build | ✅ |
| Build API | ✅ |
| Prettier | ✅ |
| Secrets scan | ✅ (354 files) |
| npm audit (prod) | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,958/2,958 |

## Test Breakdown

- Web: 1,375 tests ✅ (91 files)
- API: 555 tests ✅ (35 files)
- Shared: 1,028 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `a0696ecd` with no console errors, Lighthouse **99 hunt /
100-100-93 warm (ARM64 CPU variance on warm3 only, warm1+warm2 100 PERFECT in-session)**,
25/25 sweep assertions pass on first attempt, all 2,958 tests pass, all quality gates green.
