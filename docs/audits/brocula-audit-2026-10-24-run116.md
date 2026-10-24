# BroCula Audit — Run 116 (2026-10-24)

**Branch:** `brocula/loop-2026-10-24-run116`
**Base:** `origin/main` at `1ff04e78` (fix(a11y): track template grid breakpoints so arrow-key navigation survives resize (#3869))
**Date:** 2026-10-24

## Summary

BroCula ULW Loop — LH **99 hunt / 99-99-95 warm — 100-100-100** ⭐

- Hunt: **99** (a11y/BP/SEO 100, FCP/LCP 1.3s, TBT 120ms, CLS 0.007, 230 KiB, savings>0 audits 0)
- Warm1: 99 (FCP/LCP 1.1s, TBT 120ms, savings>0 audits 0)
- Warm2: 99 (FCP/LCP 1.3s, TBT 100ms, savings>0 audits 0)
- Warm3: 95 (FCP 1.8s, LCP 2.7s, TBT 100ms, savings>0 audits 1 = unused-javascript 26 KiB displayValue)
- Sub-100 warm performance = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115 precedent; warm3 95 same elevated-FCP/LCP variance band as Run 110 warm1 92 / Run 111 warm2 91, with byte weight 230 KiB and CLS 0.007 identical to all prior passes (variance, not regression)
- Hunt `unused-javascript` 26 KiB `vendor-react-dom-Cm_-9BQy.js` flag (framework-inherent same chunk hash as Run 106/107/108/109/110/111/112/113/114/115, no code-level action); warm3 savings>0 audits 1 (displayValue only, same flag)
- **0 console errors/warnings** (hunt)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions** on first attempt after proactively killing the hunt-orphan and starting a fresh tmux-detached `--strictPort` server, no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115 precedent)
- **0 actionable optimization opportunities**
- All **2,905 tests pass** (1,348 web + 555 api + 1,002 shared)
- All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, build:api ✅, prettier ✅, secrets scan ✅ 353 files, npm audit ✅ 0 production vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248) installed on runner for this run
- Validates `origin/main` at `1ff04e78` (5 commits past Run 115 base: #3869/#3870/#3871/#3872/#3873) with no regressions, no app code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **99**      | 100           | 100            | 100 |
| Warm1 | 99          | 100           | 100            | 100 |
| Warm2 | 99          | 100           | 100            | 100 |
| Warm3 | 95          | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.3 s | 1.3 s | 120ms | 0.007 | 230 KiB |
| Warm1 | 1.1 s | 1.1 s | 120ms | 0.007 | 230 KiB |
| Warm2 | 1.3 s | 1.3 s | 100ms | 0.007 | 230 KiB |
| Warm3 | 1.8 s | 2.7 s | 100ms | 0.007 | 230 KiB |

Hunt diagnostics: JavaScript execution time 0.4 s, main-thread work 1.7 s.
Hunt `unused-javascript` flag: `vendor-react-dom-Cm_-9BQy.js` 26,640 B wasted
(framework-inherent, identical chunk hash to Run 106/107/108/109/110/111/112/113/114/115;
hunt savings>0 audits 0, warm1–2 savings>0 audits 0, warm3 savings>0 audits 1 (displayValue only, same flag);
byte weight constant 230 KiB and CLS 0.007 across all four passes — identical to Run 115).

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
| Secrets scan | ✅ (353 files) |
| npm audit (prod) | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,905/2,905 |

## Test Breakdown

- Web: 1,348 tests ✅ (87 files)
- API: 555 tests ✅ (35 files)
- Shared: 1,002 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `1ff04e78` with no console errors, Lighthouse **99 hunt /
99-99-95 warm (ARM64 CPU variance)**, 25/25 sweep assertions pass on first attempt,
all 2,905 tests pass, all quality gates green.
