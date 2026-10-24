# BroCula Audit — Run 117 (2026-10-24)

**Branch:** `brocula/loop-2026-10-24-run117`
**Base:** `origin/main` at `fa3defaa` (docs(repokeeeper): hygiene cycle 21 2026-10-24 — hygiene CLEAN (0 deletions), 1 doc-sync drift fixed (bugs.md test count 2905→2923), all baselines green (#3880))
**Date:** 2026-10-24

## Summary

BroCula ULW Loop — LH **99 hunt / 99-99-99 warm — 100-100-100** ⭐

- Hunt: **99** (a11y/BP/SEO 100, FCP/LCP 1.4s, TBT 70ms, CLS 0.007, 231 KiB, savings>0 audits 0)
- Warm1: 99 (FCP/LCP 0.6s, TBT 130ms, savings>0 audits 0)
- Warm2: 99 (FCP/LCP 1.3s, TBT 120ms, savings>0 audits 0)
- Warm3: 99 (FCP/LCP 1.3s, TBT 130ms, savings>0 audits 0)
- All four passes at 99 performance with savings>0 audits 0 — sub-100 performance = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116 precedent, with byte weight 231 KiB and CLS 0.007 identical across all four passes (variance, not regression — notably no low-band dip this run, unlike Run 115/116 warm passes)
- Hunt `unused-javascript` 26 KiB `vendor-react-dom-Cm_-9BQy.js` flag (framework-inherent same chunk hash as Run 106/107/108/109/110/111/112/113/114/115/116, no code-level action); all four passes savings>0 audits 0
- **0 console errors/warnings** (hunt)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions** on first attempt after proactively killing the hunt-orphan and starting a fresh tmux-detached `--strictPort` server, no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116 precedent)
- **0 actionable optimization opportunities**
- All **2,923 tests pass** (1,356 web + 555 api + 1,012 shared)
- All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, build:api ✅, prettier ✅, secrets scan ✅ 355 files, npm audit ✅ 0 production vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248, full + headless shell) freshly installed on runner for this run
- Validates `origin/main` at `fa3defaa` (6 commits past Run 116 audit merge 52e75ef2: #3874/#3875/#3878/#3879/#3880/#3881 — including app changes #3878 start-from-scratch divider button and #3879 editor panel focus restore, both covered green by this run's sweep) with no regressions, no app code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **99**      | 100           | 100            | 100 |
| Warm1 | 99          | 100           | 100            | 100 |
| Warm2 | 99          | 100           | 100            | 100 |
| Warm3 | 99          | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.4 s | 1.4 s | 70ms  | 0.007 | 231 KiB |
| Warm1 | 0.6 s | 0.6 s | 130ms | 0.007 | 231 KiB |
| Warm2 | 1.3 s | 1.3 s | 120ms | 0.007 | 231 KiB |
| Warm3 | 1.3 s | 1.3 s | 130ms | 0.007 | 231 KiB |

Hunt diagnostics: JavaScript execution time 0.4 s, main-thread work 1.7 s.
Hunt `unused-javascript` flag: `vendor-react-dom-Cm_-9BQy.js` 26,271 B wasted
(framework-inherent, identical chunk hash to Run 106/107/108/109/110/111/112/113/114/115/116;
all four passes savings>0 audits 0;
byte weight constant 231 KiB and CLS 0.007 across all four passes).

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
| Secrets scan | ✅ (355 files) |
| npm audit (prod) | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,923/2,923 |

## Test Breakdown

- Web: 1,356 tests ✅ (89 files)
- API: 555 tests ✅ (35 files)
- Shared: 1,012 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `fa3defaa` with no console errors, Lighthouse **99 hunt /
99-99-99 warm (ARM64 CPU variance)**, 25/25 sweep assertions pass on first attempt,
all 2,923 tests pass, all quality gates green.
