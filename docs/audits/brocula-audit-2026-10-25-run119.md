# BroCula Audit — Run 119 (2026-10-25)

**Branch:** `brocula/loop-2026-10-25-run119`
**Base:** `origin/main` at `ae3c62e4` (BroCula run 118 audit merge)
**Date:** 2026-10-25

## Summary

BroCula ULW Loop — LH **96 hunt / 98-98-97 warm — 100-100-100** ⭐

- Hunt: **96** (a11y/BP/SEO 100, FCP/LCP 1.9s, TBT 170ms, CLS 0.007, 231 KiB, savings>0 audits 1)
- Warm1: 98 (FCP/LCP 1.3s, TBT 160ms, savings>0 audits 0)
- Warm2: 98 (FCP/LCP 1.8s, TBT 80ms, savings>0 audits 1)
- Warm3: 97 (FCP/LCP 1.9s, TBT 120ms, savings>0 audits 1)
- Sub-100 hunt/warm performance = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118 precedent — byte weight 231 KiB and CLS 0.007 constant across all four passes
- All four passes flag `unused-javascript` 26 KiB `vendor-react-dom-Cm_-9BQy.js` 26,271 B wasted (framework-inherent same chunk hash as Run 106/107/108/109/110/111/112/113/114/115/116/117/118, no code-level action)
- **0 console errors/warnings** (hunt + sweep)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions** on first attempt with fresh tmux-detached `--strictPort` server after proactively killing hunt-orphan on 4173, no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118 precedent)
- **0 actionable optimization opportunities** (only the framework-inherent `unused-javascript` flag)
- All **2,939 tests pass** (1,364 web + 555 api + 1,020 shared — web +8 vs Run 118 baseline from #3887 a11y ErrorFallback focus tests)
- All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, build:api ✅, prettier ✅, secrets scan ✅ 356 files, npm audit ✅ 0 production vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248 full + headless shell) freshly installed on runner (cache was empty at run start)
- Validates `origin/main` at `ae3c62e4` (3 commits past Run 118 base c54be9e0: #3887 feat(a11y) focus recovery action on ErrorFallback, #3889 refactor(flexy) percent-domain "100" literals Iteration 205, #3888 docs(audit) Run 118 merge — all app changes covered green by this sweep) with no regressions, no app code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **96**      | 100           | 100            | 100 |
| Warm1 | 98          | 100           | 100            | 100 |
| Warm2 | 98          | 100           | 100            | 100 |
| Warm3 | 97          | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.9 s | 1.9 s | 170ms | 0.007 | 231 KiB |
| Warm1 | 1.3 s | 1.3 s | 160ms | 0.007 | 231 KiB |
| Warm2 | 1.8 s | 1.8 s | 80ms  | 0.007 | 231 KiB |
| Warm3 | 1.9 s | 1.9 s | 120ms | 0.007 | 231 KiB |

Hunt diagnostics: JavaScript execution time 0.5 s, main-thread work 2.1 s.
Hunt `unused-javascript` flag: `vendor-react-dom-Cm_-9BQy.js` 26,271 B wasted
(framework-inherent, identical chunk hash to Run 106/107/108/109/110/111/112/113/114/115/116/117/118;
flags on hunt + warm2 + warm3, savings>0 audits 0 on warm1;
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
| Secrets scan | ✅ (356 files) |
| npm audit (prod) | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,939/2,939 |

## Test Breakdown

- Web: 1,364 tests ✅ (90 files)
- API: 555 tests ✅ (35 files)
- Shared: 1,020 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `ae3c62e4` with no console errors, Lighthouse **96 hunt /
98-98-97 warm (ARM64 CPU variance)**, 25/25 sweep assertions pass on first attempt,
all 2,939 tests pass, all quality gates green.
