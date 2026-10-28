# BroCula Audit — Run 126 (2026-10-27)

**Branch:** `brocula/loop-2026-10-27-run126`
**Base:** `origin/main` at `82891afa` (Run 125 audit branch tip + 6 more on main)
**Date:** 2026-10-27

## Summary

BroCula ULW Loop — LH **97 hunt / 93-97-93 warm — 100-100-100** ⭐

- Hunt: **97** (a11y/BP/SEO 100, FCP/LCP within variance band, TBT ≤110ms, CLS 0.007,
  231 KiB, savings>0 audits 1, main-thread work 1.5 s, JS execution 0.4 s)
- Warm1: **93** (FCP 2.0s/LCP 2.9s, TBT 110ms, savings>0 audits 1)
- Warm2: **97** (FCP 2.0s/LCP 2.0s, TBT 100ms, savings>0 audits 1)
- Warm3: **93** (FCP 1.8s/LCP 2.9s, TBT 120ms, savings>0 audits 1) — sub-100 = ARM64 runner
  CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123/124/125
  precedent (warm1/warm3 FCP 1.8–2.0s/LCP 2.9s same elevated band as Run 121 warm2+warm3
  2.0s/2.9s and Run 124 warm2/warm3 2.0s/2.8s), in-session warm2 97 = variance not
  regression
- Byte weight 231 KiB constant across all four passes; CLS 0.007 constant across all
  four passes
- Hunt + all three warms flag `unused-javascript` `vendor-react-dom-nzDyrI2d.js` ~26 KiB
  wasted (framework-inherent same chunk as Run 106–125, no code-level action)
- **0 console errors/warnings** (hunt + sweep)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with
  Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to
  Review + reload persistence with Generate enabled + generate error path with verified
  recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor
  toggle — **25/25 assertions** on first attempt with fresh tmux-detached `--strictPort`
  server, no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122/123/124/125
  precedent)
- **0 actionable optimization opportunities** (only the framework-inherent
  `unused-javascript` flag)
- All **2,975 tests pass** (1,391 web + 555 api + 1,029 shared — web +2 vs Run 125 count
  from app changes #3916/#3921/#3924)
- All quality gates pass (typecheck ✅, lint 0/0 ✅ enforced with `--max-warnings=0`, build ✅,
  build:api ✅, prettier ✅, secrets scan ✅ 359 files, npm audit ✅ 0 production vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248 full `chrome-linux-arm64` + headless shell)
  installed on runner (cache empty at run start)
- Validates `origin/main` at `82891afa` (6 commits past Run 125 base 954f8571: #3923
  repokeeper cycle 28 hygiene + doc-sync + scan:secrets .omo exclusion fix, #3922 Run 125
  docs merge, #3921 fix(a11y) retain keyboard focus on export button during export — app
  change covered green by this sweep, #3917 Run 124 docs merge, #3916 fix(a11y) pad
  StepFeatures clear-all button to 24×24 touch target — app change covered green by this
  sweep, #3924 feat(web) add hover and focus state inspection to StartFromScratchButton —
  app change covered green by this sweep) with no regressions, no app code changes
  required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **97**      | 100           | 100            | 100 |
| Warm1 | **93**      | 100           | 100            | 100 |
| Warm2 | **97**      | 100           | 100            | 100 |
| Warm3 | **93**      | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | ~1.6s | ~1.6s | ≤110ms| 0.007 | 231 KiB |
| Warm1 | 2.0 s | 2.9 s | 110ms | 0.007 | 231 KiB |
| Warm2 | 2.0 s | 2.0 s | 100ms | 0.007 | 231 KiB |
| Warm3 | 1.8 s | 2.9 s | 120ms | 0.007 | 231 KiB |

Hunt diagnostics: main-thread work 1.5 s, JavaScript execution 0.4 s.
`unused-javascript` flag: `vendor-react-dom-nzDyrI2d.js` ~26 KiB wasted —
framework-inherent, same chunk as Run 106–125; savings>0 audits 1 on all four passes;
byte weight 231 KiB constant across all four passes and CLS 0.007 constant across all
four passes.

## Interactive Sweep Results

Fresh tmux-detached `npx vite preview --port 4173 --strictPort` server started —
**25/25 assertions passed on first attempt**:
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
| Secrets scan | ✅ (359 files) |
| npm audit (prod) | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,975/2,975 |

## Test Breakdown

- Web: 1,391 tests ✅ (92 files)
- API: 555 tests ✅ (35 files)
- Shared: 1,029 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `82891afa` with no console errors, Lighthouse **97 hunt /
93-97-93 warm (ARM64 CPU variance on warm1/warm3)**, 25/25 sweep assertions pass on first
attempt, all 2,975 tests pass, all quality gates green.
