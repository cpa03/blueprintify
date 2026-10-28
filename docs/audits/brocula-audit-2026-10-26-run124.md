# BroCula Audit — Run 124 (2026-10-26)

**Branch:** `brocula/loop-2026-10-26-run124`
**Base:** `origin/main` at `f44ee4d7` (Run 123 audit merge `8f5b3236` + 6 more)
**Date:** 2026-10-26

## Summary

BroCula ULW Loop — LH **94 hunt / 99-93-94 warm — 100-100-100** ⭐

- Hunt: **94** (a11y/BP/SEO 100, FCP 1.4s/LCP 2.9s, TBT 110ms, CLS 0.007, 231 KiB,
  savings>0 audits 1, main-thread work 1.8 s, JS execution 0.4 s)
- Warm1: **99** (FCP/LCP 1.4s, TBT 80ms, savings>0 audits 0)
- Warm2: 93 (FCP 2.0s/LCP 2.8s, TBT 130ms, savings>0 audits 1)
- Warm3: 94 (FCP 2.0s/LCP 2.8s, TBT 110ms, savings>0 audits 1) — elevated FCP/LCP band =
  ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123
  precedent (warm2/warm3 FCP 2.0s/LCP 2.8s same band as Run 121 warm2 2.0s/2.9s and
  Run 110 warm1 1.9s/3.0s), in-session warm1 99 = variance not regression
- Byte weight 236,952 B (231 KiB) on hunt + warm1 + warm2, 237,084 B (232 KiB, +132 B) on
  warm3; CLS 0.007 constant across all four passes
- Hunt + warm2 + warm3 flag `unused-javascript` `vendor-react-dom-nzDyrI2d.js`
  26,271 B (hunt) / 26,639 B (warm2, warm3) wasted (framework-inherent same chunk as
  Run 106–123, new content hash from merged #3911/#3912/#3914 dep bumps, no code-level
  action); savings>0 audits 0 on warm1
- **0 console errors/warnings** (hunt + sweep)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with
  Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to
  Review + reload persistence with Generate enabled + generate error path with verified
  recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor
  toggle — **25/25 assertions** on first attempt with fresh tmux-detached `--strictPort`
  server after killing hunt-orphan on 4173, no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122/123
  precedent)
- **0 actionable optimization opportunities** (only the framework-inherent
  `unused-javascript` flag)
- All **2,970 tests pass** (1,387 web + 555 api + 1,028 shared — web +6 vs Run 123 count)
- All quality gates pass (typecheck ✅, lint 0/0 ✅ enforced with `--max-warnings=0`, build ✅,
  build:api ✅, prettier ✅, secrets scan ✅ 360 files, npm audit ✅ 0 production vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248 full `chrome-linux-arm64` + headless shell)
  installed on runner (cache empty at run start)
- Validates `origin/main` at `f44ee4d7` (7 commits past Run 123 base f65ffbd2: #3908
  bugfixer docs, #3909 Run 123 audit docs, #3910 fix(a11y) wizard chip remove 24×24 touch
  targets — app change covered green by this sweep, #3915 fix(web) export button
  disabled/exporting announcements — app change covered green by this sweep, #3914
  chore(deps-dev) @vitest/ui 5.0.5, #3911 chore(deps) 3 production updates, #3912
  chore(deps-dev) 8 updates) with no regressions, no app code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **94**      | 100           | 100            | 100 |
| Warm1 | **99**      | 100           | 100            | 100 |
| Warm2 | 93          | 100           | 100            | 100 |
| Warm3 | 94          | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.4 s | 2.9 s | 110ms | 0.007 | 231 KiB |
| Warm1 | 1.4 s | 1.4 s | 80ms  | 0.007 | 231 KiB |
| Warm2 | 2.0 s | 2.8 s | 130ms | 0.007 | 231 KiB |
| Warm3 | 2.0 s | 2.8 s | 110ms | 0.007 | 232 KiB |

Hunt diagnostics: main-thread work 1.8 s, JavaScript execution 0.4 s.
`unused-javascript` flag: `vendor-react-dom-nzDyrI2d.js` 26,271 B (hunt) /
26,639 B (warm2 + warm3) wasted — framework-inherent, same chunk as Run 106–123 with new
content hash from dep bumps; savings>0 audits 1 on hunt + warm2 + warm3, 0 on warm1;
byte weight 236,952 B constant on three passes (+132 B on warm3) and CLS 0.007 constant
across all four passes.

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
| Secrets scan | ✅ (360 files) |
| npm audit (prod) | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,970/2,970 |

## Test Breakdown

- Web: 1,387 tests ✅ (92 files)
- API: 555 tests ✅ (35 files)
- Shared: 1,028 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `f44ee4d7` with no console errors, Lighthouse **94 hunt /
99-93-94 warm (ARM64 CPU variance on warm2 + warm3 only, in-session warm1 99)**,
25/25 sweep assertions pass on first attempt, all 2,970 tests pass, all quality gates green.
