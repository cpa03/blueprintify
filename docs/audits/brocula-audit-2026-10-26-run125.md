# BroCula Audit — Run 125 (2026-10-26)

**Branch:** `brocula/loop-2026-10-26-run125`
**Base:** `origin/main` at `954f8571` (Run 124 audit branch tip `f39b049b` + 3 more on main)
**Date:** 2026-10-26

## Summary

BroCula ULW Loop — LH **99 hunt / 99-99-98 warm — 100-100-100** ⭐

- Hunt: **99** (a11y/BP/SEO 100, FCP/LCP 1.6s, TBT 80ms, CLS 0.007, 231 KiB,
  savings>0 audits 0, main-thread work 1.9 s, JS execution 0.5 s)
- Warm1: **99** (FCP/LCP 1.6s, TBT 80ms, savings>0 audits 0)
- Warm2: **99** (FCP/LCP 1.4s, TBT 90ms, savings>0 audits 0)
- Warm3: **98** (FCP 1.9s/LCP 2.0s, TBT 80ms, savings>0 audits 1) — sub-100 = ARM64 runner
  CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123/124
  precedent (warm3 FCP 1.9s/LCP 2.0s same band as Run 121 warm2 2.0s/2.9s and Run 124
  warm2/warm3 2.0s/2.8s), in-session warm1+warm2 99 = variance not regression
- Byte weight 236,952 B (231 KiB) constant across all four passes; CLS 0.007 constant
  across all four passes
- Hunt + warm3 flag `unused-javascript` `vendor-react-dom-nzDyrI2d.js` 26,271–26,639 B
  wasted (framework-inherent same chunk as Run 106–124, no code-level action);
  savings>0 audits 0 on warm1 + warm2
- **0 console errors/warnings** (hunt + sweep)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with
  Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to
  Review + reload persistence with Generate enabled + generate error path with verified
  recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor
  toggle — **25/25 assertions** on first attempt with fresh tmux-detached `--strictPort`
  server after killing hunt-orphan on 4173, no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122/123/124
  precedent)
- **0 actionable optimization opportunities** (only the framework-inherent
  `unused-javascript` flag)
- All **2,973 tests pass** (1,389 web + 555 api + 1,029 shared — web +2, shared +1 vs
  Run 124 count)
- All quality gates pass (typecheck ✅, lint 0/0 ✅ enforced with `--max-warnings=0`, build ✅,
  build:api ✅, prettier ✅, secrets scan ✅ 357 files, npm audit ✅ 0 production vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248 full `chrome-linux-arm64` + headless shell)
  installed on runner (cache empty at run start)
- Validates `origin/main` at `954f8571` (3 commits past Run 124 base f44ee4d7: #3918
  repokeeper cycle 27 docs, #3920 janitor remove stray unreferenced CMZ agent.json,
  #3919 bugfixer fatal-gate cycle 27 docs) with no regressions, no app code changes
  required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **99**      | 100           | 100            | 100 |
| Warm1 | **99**      | 100           | 100            | 100 |
| Warm2 | **99**      | 100           | 100            | 100 |
| Warm3 | **98**      | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.6 s | 1.6 s | 80ms  | 0.007 | 231 KiB |
| Warm1 | 1.6 s | 1.6 s | 80ms  | 0.007 | 231 KiB |
| Warm2 | 1.4 s | 1.4 s | 90ms  | 0.007 | 231 KiB |
| Warm3 | 1.9 s | 2.0 s | 80ms  | 0.007 | 231 KiB |

Hunt diagnostics: main-thread work 1.9 s, JavaScript execution 0.5 s.
`unused-javascript` flag: `vendor-react-dom-nzDyrI2d.js` 26,271–26,639 B wasted —
framework-inherent, same chunk as Run 106–124 with no new dep bumps this run;
savings>0 audits 1 on hunt + warm3, 0 on warm1 + warm2; byte weight 236,952 B constant
across all four passes and CLS 0.007 constant across all four passes.

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
| Secrets scan | ✅ (357 files) |
| npm audit (prod) | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,973/2,973 |

## Test Breakdown

- Web: 1,389 tests ✅ (92 files)
- API: 555 tests ✅ (35 files)
- Shared: 1,029 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `954f8571` with no console errors, Lighthouse **99 hunt /
99-99-98 warm (ARM64 CPU variance on warm3 only)**, 25/25 sweep assertions pass on first
attempt, all 2,973 tests pass, all quality gates green.
