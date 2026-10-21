# BroCula Audit — Run 107 (2026-10-20)

**Branch:** `brocula/loop-2026-10-20-run107`
**Base:** `origin/main` at `4d8ada8c` (refactor(flexy): centralize time helpers, token codec literals, hex pad char & empty-state aria-label (Iteration 186) (#3632))
**Date:** 2026-10-20

## Summary

BroCula ULW Loop — LH **97 hunt / 97-99 warm — 100-100-100** ⭐

- Hunt: 97 (a11y/BP/SEO 100, FCP 1.9s, LCP 1.9s, TBT 140ms, CLS 0.007, 230 KiB)
- Warm1: 97 (FCP 1.9s, LCP 1.9s, TBT 110ms = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106 precedent)
- Warm2: 99 (FCP/LCP 1.3s, TBT 120ms, CLS 0.007, 230 KiB, savings>0 audits 0)
- Hunt+warm1 `unused-javascript` 26 KiB `vendor-react-dom-Cm_-9BQy.js` flag (wasted 26,640 B) = framework-inherent same chunk hash as Run 106, no code-level action
- **0 console errors/warnings** (hunt)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor toggle — **25/25 assertions** on clean re-sweep with fresh in-session detached `--strictPort` server; first attempt `18/22` with `ERR_CONNECTION_REFUSED` on lazy chunks `Toast-D1XHoNvG.js`/`ErrorFallback-BYP1oETE.js` = teardown race when tmux session died mid-sweep, per Run 90/91/95/96/97/98/99/101/104 precedent)
- **0 actionable optimization opportunities**
- All **2,824 tests pass** (1,321 web + 555 api + 948 shared)
- All quality gates pass (typecheck ✅, lint 0/0 ✅, build ✅, secrets scan ✅ 347 files, prettier ✅, npm audit ✅ 0 vulnerabilities)
- Playwright Chromium (ARM64) installed on runner for this run
- Validates `origin/main` at `4d8ada8c` with no regressions, no app code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | 97          | 100           | 100            | 100 |
| Warm1 | 97          | 100           | 100            | 100 |
| Warm2 | 99          | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.9 s | 1.9 s | 140ms | 0.007 | 230 KiB |
| Warm1 | 1.9 s | 1.9 s | 110ms | 0.007 | 230 KiB |
| Warm2 | 1.3 s | 1.3 s | 120ms | 0.007 | 230 KiB |

## Interactive Sweep Results

Clean re-sweep: 25/25 assertions passed:
- Landing load + scroll (6 assertions)
- Keyboard navigation (4 assertions)
- Shortcuts dialog (2 assertions)
- Template select → auto-advance (4 assertions)
- Reload persistence (2 assertions)
- Generate error path + recovery (5 assertions)
- Editor toggle (2 assertions)

First attempt: 18/22 with `ERR_CONNECTION_REFUSED` on lazy chunks — tmux preview
session died mid-sweep (teardown race, not an app defect); resolved by restarting
`vite preview --port 4173 --strictPort` in-session and re-running.

Console errors: 0
Console warnings: 0
Non-API request failures: 0

## Quality Gates

| Gate | Status |
|------|--------|
| Typecheck | ✅ |
| Lint | ✅ (0/0) |
| Build | ✅ |
| Secrets scan | ✅ (347 files) |
| Prettier | ✅ |
| npm audit | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,824/2,824 |

## Test Breakdown

- Web: 1,321 tests ✅ (86 files)
- API: 555 tests ✅ (35 files)
- Shared: 948 tests ✅ (5 files)

## Verdict

✅ **No regressions. No app code changes required.**

Validates `origin/main` at `4d8ada8c` with no console errors, Lighthouse 97-97-99 (ARM64 CPU variance), 25/25 sweep assertions pass on clean re-sweep, all 2,824 tests pass, all quality gates green.
