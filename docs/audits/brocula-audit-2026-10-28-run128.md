# BroCula Audit — Run 128 (2026-10-28)

**Branch:** `brocula/console-lighthouse-20261028`
**Base:** `origin/main` at `dbd07b4f` (Run 127 audit merge)

## Summary

BroCula ULW Loop — LH **99 hunt / 97 warm — 100-100-100** ⭐

| Gate | Result |
| --- | --- |
| Console errors | **0** |
| Console warnings | **0** |
| Failed non-API requests | **0** |
| Interactive sweep | **25/25 assertions** |
| Lighthouse hunt | Perf 99 / A11y 100 / BP 100 / SEO 100 |
| Lighthouse warm | Perf 97 / A11y 100 / BP 100 / SEO 100 |
| Typecheck | ✅ |
| Lint (0 errors, 0 warnings) | ✅ |
| Build | ✅ |
| Prettier | ✅ |
| Secrets scan (358 files) | ✅ |
| npm audit (production) | ✅ 0 vulnerabilities |
| Tests | **2,984 pass** (1,397 web + 555 api + 1,032 shared) |

## Lighthouse Details

### Hunt pass
- Performance: 99
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 1.6s
- TBT: 80ms
- CLS: 0.007
- Byte weight: 232 KiB
- Savings >0 audits: 1 (`unused-javascript` 26 KiB `vendor-react-dom-nzDyrI2d.js` — framework-inherent, same chunk as Run 106–127)

### Warm pass
- Performance: 97
- FCP/LCP: 1.5s
- TBT: 180ms
- CLS: 0.007
- Byte weight: 232 KiB
- Savings >0 audits: 0

Sub-100 on warm = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123/124/125/126/127 precedent. In-session warm recovery not needed — single warm pass showed 97 (FCP 1.5s/TBT 180ms within known variance band).

The `unused-javascript` flag on `vendor-react-dom-nzDyrI2d.js` (26,271 B) is framework-inherent — react-dom ships ~40% unused code in client-only usage. Already isolated in dedicated vendor chunk per `vite.config.ts` manualChunks config. No code-level action.

## Interactive Sweep (25/25)

Landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons (Back to Review + Try Again → Review recovery) + Ctrl+E editor toggle.

First attempt failed with `ERR_CONNECTION_REFUSED` (18/22) — hunt-orphan teardown race. Clean re-sweep with fresh tmux-detached `--strictPort` server passed 25/25 on first attempt.

## Quality Gates

All gates pass. No app code changes required.

Validates `origin/main` at `dbd07b4f` with no regressions.

🧛‍♂️⭐
