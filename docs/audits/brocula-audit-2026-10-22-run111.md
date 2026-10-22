# BroCula Audit — Run 111 (2026-10-22)

**Branch:** `brocula/loop-2026-10-22-run111`
**Base:** `origin/main` at `ded370e6` (feat(web): add GLOW_STATE_VALUES config and saved glow tracking attribute (#3846))
**Date:** 2026-10-22

## Summary

BroCula ULW Loop — LH **98 hunt / 91-98-98 warm — 100-100-100** ⭐

- Hunt: 98 (a11y/BP/SEO 100, FCP/LCP 1.3s, TBT 150ms, CLS 0.007, 230 KiB)
- Warm1: 98 (FCP/LCP 1.4s, TBT 150ms, savings>0 audits 0)
- Warm2: 91 (FCP 1.9s/LCP 3.0s, TBT 170ms = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/110 precedent — same FCP 1.9s/LCP 3.0s profile as Run 105/110 warm passes)
- Warm3: 98 (FCP/LCP 0.6s, TBT 170ms, savings>0 audits 0)
- Hunt `unused-javascript` 26 KiB `vendor-react-dom-Cm_-9BQy.js` flag (wasted 26,271 B) = framework-inherent same chunk hash as Run 106/107/108/109/110, no code-level action; hunt savings>0 audits 0
- **0 console errors/warnings** (hunt)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions** on first attempt with fresh tmux-detached `--strictPort` server after proactively killing the hunt server before sweep start, no teardown race)
- **0 actionable optimization opportunities**
- All **2,851 tests pass** (1,334 web + 555 api + 962 shared)
- All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, build:api ✅, secrets scan ✅ 349 files, prettier ✅, npm audit ✅ 0 vulnerabilities)
- Playwright Chromium (ARM64) installed on runner for this run
- Validates `origin/main` at `ded370e6` (2 commits past Run 110 base: #3846/#3847) with no regressions, no app code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | 98          | 100           | 100            | 100 |
| Warm1 | 98          | 100           | 100            | 100 |
| Warm2 | 91          | 100           | 100            | 100 |
| Warm3 | 98          | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.3 s | 1.3 s | 150ms | 0.007 | 230 KiB |
| Warm1 | 1.4 s | 1.4 s | 150ms | 0.007 | 230 KiB |
| Warm2 | 1.9 s | 3.0 s | 170ms | 0.007 | 230 KiB |
| Warm3 | 0.6 s | 0.6 s | 170ms | 0.007 | 230 KiB |

Hunt diagnostics: JavaScript execution time 0.4 s, main-thread work 1.8 s.
Hunt `unused-javascript` flag: `vendor-react-dom-Cm_-9BQy.js` 26,271 B wasted
(framework-inherent, identical chunk hash to Run 106/107/108/109/110; hunt savings>0
audits 0, warm1/warm3 reported `savings>0 audits: 0`, warm2 flagged the same 26 KiB
displayValue only).

## Interactive Sweep Results

Fresh tmux-detached `npx vite preview --port 4173 --strictPort` server started
after killing the hunt-orphan before the sweep — **25/25 assertions passed on
first attempt**, no teardown race (Run 90/91/95/96/97/98/99/101/104/107/110 precedent
applied proactively):
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
| Build:api | ✅ |
| Secrets scan | ✅ (349 files) |
| Prettier | ✅ |
| npm audit | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,851/2,851 |

## Test Breakdown

- Web: 1,334 tests ✅ (87 files)
- API: 555 tests ✅ (35 files)
- Shared: 962 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `ded370e6` with no console errors, Lighthouse 98 hunt /
91-98-98 warm (ARM64 CPU variance), 25/25 sweep assertions pass on first attempt,
all 2,851 tests pass, all quality gates green.
