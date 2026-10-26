# BroCula Audit — Run 123 (2026-10-26)

**Branch:** `brocula/loop-2026-10-26-run123`
**Base:** `origin/main` at `f65ffbd2` (Run 122 audit merge `cf2c7d1d` + 7 more)
**Date:** 2026-10-26

## Summary

BroCula ULW Loop — LH **93 hunt / 99-99-93 warm — 100-100-100** ⭐

- Hunt: **93** (a11y/BP/SEO 100, FCP 1.9s/LCP 3.0s, TBT 120ms, CLS 0.007, 231 KiB,
  savings>0 audits 1, main-thread work 1.9 s, JS execution 0.4 s)
- Warm1: **99** (FCP/LCP 0.6s, TBT 110ms, savings>0 audits 0)
- Warm2: **99** (FCP/LCP 1.4s, TBT 80ms, savings>0 audits 0)
- Warm3: 93 (FCP 1.9s/LCP 2.8s, TBT 120ms, savings>0 audits 1) — elevated FCP/LCP band =
  ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122
  precedent (hunt FCP 1.9s/LCP 3.0s same band as Run 121 hunt FCP 1.9s/LCP 2.9s / Run 110
  warm1 92 / Run 111 warm2 91 / Run 115 warm3 91 / Run 120 warm1 92 / Run 121 warm2+warm3 92 /
  Run 122 warm3 FCP 1.6s/LCP 3.0s 93), in-session warm1+warm2 99 = variance not regression
- Byte weight 231 KiB and CLS 0.007 constant across all four passes
- Hunt + warm3 flag `unused-javascript` `vendor-react-dom-Cm_-9BQy.js`
  26,271 B (hunt) / 26,640 B (warm3) wasted (framework-inherent same chunk hash as
  Run 106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122,
  no code-level action); savings>0 audits 0 on warm1 + warm2
- **0 console errors/warnings** (hunt + sweep)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with
  Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review +
  reload persistence with Generate enabled + generate error path with verified recovery buttons
  incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions**
  on first attempt with fresh tmux-detached `--strictPort` server after killing hunt-orphan
  on 4173, no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122
  precedent)
- **0 actionable optimization opportunities** (only the framework-inherent `unused-javascript` flag)
- All **2,964 tests pass** (1,381 web + 555 api + 1,028 shared — web +6 vs Run 122 count)
- All quality gates pass (typecheck ✅, lint 0/0 ✅ enforced with `--max-warnings=0`, build ✅,
  build:api ✅, prettier ✅, secrets scan ✅ 356 files, npm audit ✅ 0 production vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248 full + headless shell) installed on runner
  (cache empty at run start)
- Validates `origin/main` at `f65ffbd2` (8 commits past Run 122 base a0696ecd: #3907
  janitor docs, #3900 fix(deps) @vitest/coverage-v8 at root, #3906 vitest coverage fix +
  StartFromScratchButton micro-UX — app change covered green by this sweep, #3901 bugfixer
  docs, #3903 repokeeper docs, #3902 Run 122 audit docs, #3904 fix(web) focus restore to
  wizard panel on starter template unmount — app change covered green by this sweep, #3905
  janitor docs) with no regressions, no app code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **93**      | 100           | 100            | 100 |
| Warm1 | **99**      | 100           | 100            | 100 |
| Warm2 | **99**      | 100           | 100            | 100 |
| Warm3 | 93          | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.9 s | 3.0 s | 120ms | 0.007 | 231 KiB |
| Warm1 | 0.6 s | 0.6 s | 110ms | 0.007 | 231 KiB |
| Warm2 | 1.4 s | 1.4 s | 80ms  | 0.007 | 231 KiB |
| Warm3 | 1.9 s | 2.8 s | 120ms | 0.007 | 231 KiB |

Hunt diagnostics: main-thread work 1.9 s, JavaScript execution 0.4 s.
`unused-javascript` flag: `vendor-react-dom-Cm_-9BQy.js` 26,271 B (hunt) /
26,640 B (warm3) wasted — framework-inherent, identical chunk hash to
Run 106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122;
savings>0 audits 1 on hunt + warm3, 0 on warm1 + warm2;
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
| Secrets scan | ✅ (356 files) |
| npm audit (prod) | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,964/2,964 |

## Test Breakdown

- Web: 1,381 tests ✅ (92 files)
- API: 555 tests ✅ (35 files)
- Shared: 1,028 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `f65ffbd2` with no console errors, Lighthouse **93 hunt /
99-99-93 warm (ARM64 CPU variance on hunt + warm3 only, warm1+warm2 99 in-session)**,
25/25 sweep assertions pass on first attempt, all 2,964 tests pass, all quality gates green.
