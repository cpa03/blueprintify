# BroCula Audit — Run 118 (2026-10-25)

**Branch:** `brocula/loop-2026-10-25-run118`
**Base:** `origin/main` at `c54be9e0` (EditorHeader Micro-UX and Platform-Aware Keyboard Shortcut Labels (#3884))
**Date:** 2026-10-25

## Summary

BroCula ULW Loop — LH **97 hunt / 97-92-100 warm — 100-100-100** 🏆

- Hunt: **97** (a11y/BP/SEO 100, FCP/LCP 1.9s, TBT 140ms, CLS 0.007, 231 KiB, savings>0 audits 1)
- Warm1: 97 (FCP/LCP 1.9s, TBT 110ms, savings>0 audits 1)
- Warm2: 92 (FCP 1.9s/LCP 2.9s, TBT 140ms, savings>0 audits 1)
- Warm3: **100 PERFECT** (FCP/LCP 1.4s, TBT 70ms, savings>0 audits 0)
- Sub-100 hunt/warm1/warm2 performance = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117 precedent — warm2 92 same elevated-FCP/LCP variance band as Run 110 warm1 92 / Run 111 warm2 91 / Run 115 warm3 91 — with byte weight 231 KiB and CLS 0.007 constant across all four passes; warm3 recovering to **100 PERFECT in-session confirms variance, not regression**
- All four passes flag `unused-javascript` 26 KiB `vendor-react-dom-Cm_-9BQy.js` 26,271 B wasted (framework-inherent same chunk hash as Run 106/107/108/109/110/111/112/113/114/115/116/117, no code-level action); warm3 savings>0 audits 0
- **0 console errors/warnings** (hunt + sweep)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions** on first attempt with fresh tmux-detached `--strictPort` server after proactively confirming port 4173 free (hunt cleanup clean, no orphan), no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117 precedent)
- **0 actionable optimization opportunities** (only the framework-inherent `unused-javascript` flag)
- All **2,931 tests pass** (1,356 web + 555 api + 1,020 shared — shared +8 vs Run 117 baseline from #3883/#3884)
- All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, build:api ✅, prettier ✅, secrets scan ✅ 351 files, npm audit ✅ 0 production vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248 full + headless shell) freshly installed on runner (cache was empty at run start)
- Validates `origin/main` at `c54be9e0` (2 commits past Run 117 audit merge 25f53219: #3883 flexy data-attribute literal refactor, #3884 EditorHeader Micro-UX — both app changes covered green by this sweep) with no regressions, no app code changes required 🧛‍♂️🏆

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **97**      | 100           | 100            | 100 |
| Warm1 | 97          | 100           | 100            | 100 |
| Warm2 | 92          | 100           | 100            | 100 |
| Warm3 | **100** 🏆  | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.9 s | 1.9 s | 140ms | 0.007 | 231 KiB |
| Warm1 | 1.9 s | 1.9 s | 110ms | 0.007 | 231 KiB |
| Warm2 | 1.9 s | 2.9 s | 140ms | 0.007 | 231 KiB |
| Warm3 | 1.4 s | 1.4 s | 70ms  | 0.007 | 231 KiB |

Hunt diagnostics: JavaScript execution time 0.4 s, main-thread work 1.9 s.
Hunt `unused-javascript` flag: `vendor-react-dom-Cm_-9BQy.js` 26,271 B wasted
(framework-inherent, identical chunk hash to Run 106/107/108/109/110/111/112/113/114/115/116/117;
flags on hunt + warm1 + warm2, savings>0 audits 0 on warm3;
byte weight constant 231 KiB and CLS 0.007 across all four passes).

## Interactive Sweep Results

Fresh tmux-detached `npx vite preview --port 4173 --strictPort` server started after
confirming port 4173 free (hunt `cleanup()` left no orphan) — **25/25 assertions passed on first attempt**:
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
| Secrets scan | ✅ (351 files) |
| npm audit (prod) | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,931/2,931 |

## Test Breakdown

- Web: 1,356 tests ✅ (89 files)
- API: 555 tests ✅ (35 files)
- Shared: 1,020 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `c54be9e0` with no console errors, Lighthouse **97 hunt /
97-92-100 warm (ARM64 CPU variance, warm3 100 PERFECT)**, 25/25 sweep assertions pass
on first attempt, all 2,931 tests pass, all quality gates green.
