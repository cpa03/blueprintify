# BroCula Audit — Run 127 (2026-10-27)

**Branch:** `agent`
**Base:** `origin/main` at `78c396df` (4 commits past Run 126 audit merge b24527c4)
**Date:** 2026-10-27

## Summary

BroCula ULW Loop — LH **99 hunt / 97-99-99 warm — 100-100-100** ⭐

- Hunt: **99** (a11y/BP/SEO 100, FCP/LCP 1.4s, TBT 80ms, CLS 0.007, 232 KiB,
  savings>0 audits 1, main-thread work 1.7 s, JS execution 0.4 s)
- Warm1: **97** (FCP 2.0s/LCP 2.0s, TBT 110ms, savings>0 audits 1)
- Warm2: **99** (FCP 0.6s/LCP 0.6s, TBT 100ms, savings>0 audits 0)
- Warm3: **99** (FCP 1.4s/LCP 1.4s, TBT 80ms, savings>0 audits 0) — sub-100 on warm1 = ARM64
  runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123/124/125/126
  precedent (warm1 FCP 2.0s same elevated band as Run 121 warm2+warm3 2.0s/2.9s and
  Run 124 warm2/warm3 2.0s/2.8s), in-session warm2+warm3 99 = variance not regression
- Byte weight 232 KiB constant across all four passes; CLS 0.007 constant across all
  four passes
- Hunt + warm1 flag `unused-javascript` `vendor-react-dom-nzDyrI2d.js` ~26 KiB
  wasted (framework-inherent same chunk as Run 106–126, no code-level action)
- **0 console errors/warnings** (hunt + sweep)
- **0 failed non-API requests** (interactive sweep: landing load/scroll + keyboard nav with
  Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to
  Review + reload persistence with Generate enabled + generate error path with verified
  recovery buttons incl. Back to Review + Try Again → Review recovery + Ctrl+E editor
  toggle — **25/25 assertions** on first attempt with fresh tmux-detached `--strictPort`
  server, no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122/123/124/125/126
  precedent)
- **0 actionable optimization opportunities** (only the framework-inherent
  `unused-javascript` flag)
- All **2,981 tests pass** (1,397 web + 555 api + 1,029 shared — web +6 vs Run 126 count
  from app changes #3925/#3930)
- All quality gates pass (typecheck ✅, lint 0/0 ✅ enforced with `--max-warnings=0`, build ✅,
  build:api ✅, prettier ✅, secrets scan ✅ 357 files, npm audit ✅ 0 production vulnerabilities)
- Playwright Chromium (ARM64, chromium-1248 full `chrome-linux-arm64` + headless shell)
  installed on runner (cache empty at run start)
- Validates `origin/main` at `78c396df` (4 commits past Run 126 audit merge b24527c4: #3925
  fix(a11y) skip decorative checkmark animations under prefers-reduced-motion — app
  change covered green by this sweep, #3930 fix(a11y) flip enterKeyHint next/go to match
  real Enter behavior in StepInfo — app change covered green by this sweep, #3931
  bugfixer cycle 30 docs, #3929 repokeeper cycle 30 docs) with no regressions, no app
  code changes required 🧛‍♂️⭐

## Lighthouse Scores

| Pass  | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Hunt  | **99**      | 100           | 100            | 100 |
| Warm1 | **97**      | 100           | 100            | 100 |
| Warm2 | **99**      | 100           | 100            | 100 |
| Warm3 | **99**      | 100           | 100            | 100 |

### Metrics

| Pass  | FCP   | LCP   | TBT   | CLS   | Weight |
|-------|-------|-------|-------|-------|--------|
| Hunt  | 1.4 s | 1.4 s | 80 ms | 0.007 | 232 KiB |
| Warm1 | 2.0 s | 2.0 s | 110ms | 0.007 | 232 KiB |
| Warm2 | 0.6 s | 0.6 s | 100ms | 0.007 | 232 KiB |
| Warm3 | 1.4 s | 1.4 s | 80 ms | 0.007 | 232 KiB |

Hunt diagnostics: main-thread work 1.7 s, JavaScript execution 0.4 s.
`unused-javascript` flag: `vendor-react-dom-nzDyrI2d.js` ~26 KiB wasted —
framework-inherent, same chunk as Run 106–126; savings>0 audits 1 on hunt+warm1 and
0 on warm2+warm3; byte weight 232 KiB constant across all four passes and CLS 0.007
constant across all four passes.

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
| Secrets scan | ✅ (357 files) |
| npm audit (prod) | ✅ (0 vulnerabilities) |
| Tests | ✅ 2,981/2,981 |
