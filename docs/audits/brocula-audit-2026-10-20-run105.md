# BroCula Audit — Run 105 (2026-10-20)

**Branch:** `brocula/loop-2026-10-20-run105`
**Base:** `origin/main` at `e03b32a0` (docs(repokeeeper): hygiene cycle 11 2026-10-20 — 1 doc-sync fix, all baselines green (#3830))
**Date:** 2026-10-20

## Summary

BroCula ULW Loop — LH **97 hunt / 91-98 warm — 100-100-100** ⭐

- Hunt: 97 (a11y/BP/SEO 100)
- Warm1: 91 (FCP 1.9s, LCP 3.0s, TBT 170ms = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104 precedent)
- Warm2: 98 (FCP/LCP 0.6s, TBT 150ms, CLS 0.007, 228 KiB)
- Hunt+warm `unused-javascript` 26 KiB `vendor-react-dom` flag (wasted ~26,271–26,640 B) = framework-inherent same chunk hash, no code-level action
- **0 console errors/warnings**
- **0 failed non-API requests** (incl. interactive sweep: landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions** on first attempt with fresh `--strictPort` detached server, no teardown race)
- **0 actionable optimization opportunities**
- All **2,796 tests pass** (1,320 web + 550 api + 926 shared)
- All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, secrets scan ✅ 346 files, prettier ✅; npm audit 8 vulns — 3 moderate + 5 high, all pre-existing transitive, breaking-upgrade only)
- Playwright Chromium (ARM64) installed on runner for this run
- Validates `origin/main` at `e03b32a0` with no regressions, no app code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| Hunt | 97 | 100 | 100 | 100 |
| Warm1 | 91 | 100 | 100 | 100 |
| Warm2 | 98 | 100 | 100 | 100 |

## Interactive Sweep Results

25/25 assertions passed (first attempt, no teardown race):
- Landing load + scroll (5 assertions)
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
| Secrets scan | ✅ (346 files) |
| Prettier | ✅ |
| npm audit | 8 vulns (3 moderate + 5 high, pre-existing transitive) |
| Tests | ✅ 2,796/2,796 |

## Test Breakdown

- Web: 1,320 tests ✅
- API: 550 tests ✅
- Shared: 926 tests ✅

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `e03b32a0` with no console errors, Lighthouse 97-91-98 (ARM64 CPU variance), 25/25 sweep assertions pass on first attempt, all 2,796 tests pass, all quality gates green.
