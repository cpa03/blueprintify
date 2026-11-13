# BroCula Audit — Run 129 (2026-10-28)

**Branch:** `brocula/loop-2026-10-28-run129`
**Base:** `origin/main` at `2fb180c2` (Run 128 audit merge `d9c47258` + 3 commits)

## Summary

BroCula ULW Loop — LH **99 hunt / 99 warm — 100-100-100** ⭐

| Gate | Result |
| --- | --- |
| Console errors | **0** |
| Console warnings | **0** |
| Failed non-API requests | **0** |
| Interactive sweep | **25/25 assertions** |
| Lighthouse hunt | Perf 99 / A11y 100 / BP 100 / SEO 100 |
| Lighthouse warm | Perf 99 / A11y 100 / BP 100 / SEO 100 |
| Typecheck | ✅ |
| Lint (0 errors, 0 warnings) | ✅ |
| Build | ✅ |
| Build:api | ✅ |
| Prettier | ✅ |
| Secrets scan (358 files) | ✅ |
| npm audit (production) | ✅ 0 vulnerabilities |
| Tests | **2,989 pass** (1,399 web + 555 api + 1,035 shared) |

## Lighthouse Details

### Hunt pass
- Performance: 99
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 1.3s
- TBT: 120ms
- CLS: 0.007
- Byte weight: 262 KiB (268,358 B)
- Main-thread: 1.7s / JS execution: 0.4s
- Savings >0 audits: 0 (`unused-javascript` 26 KiB `vendor-react-dom-nzDyrI2d.js` 26,248 B bytes-only flag — framework-inherent, same chunk hash as Run 106–128)

### Warm pass
- Performance: 99
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 140ms
- CLS: 0.007
- Byte weight: 262 KiB (268,381 B)
- Savings >0 audits: 0

Sub-100 on both passes = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123/124/125/126/127/128 precedent (hunt TBT 120ms / warm TBT 140ms within known variance band).

### Byte-weight delta vs Run 128 (232 → 262 KiB) — fully accounted, no regression

Entire +30 KiB delta is the **JetBrains Mono woff2** (31,369 B, `fonts.gstatic.com`,
`display=optional` — timing-dependent load, not counted on Run 128's passes).
268,381 − 31,369 = **237,012 B ≈ Run 128's 231–232 KiB** — every other resource is
byte-identical to Run 128 (same `vendor-react-dom-nzDyrI2d.js` 66,074 B transfer, same
46-request footprint). `total-byte-weight` score = **1** (no penalty); font is
non-render-blocking per the `display=optional` + preconnect design documented in
`apps/web/index.html`. No code-level action.

The `unused-javascript` flag on `vendor-react-dom-nzDyrI2d.js` (26,248 B) is
framework-inherent — react-dom ships ~40% unused code in client-only usage. Already
isolated in dedicated vendor chunk per `vite.config.ts` manualChunks config. No
code-level action.

## Interactive Sweep (25/25)

Landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons (Back to Review + Try Again → Review recovery) + Ctrl+E editor toggle.

**25/25 assertions on first attempt** with fresh tmux-detached `--strictPort` server;
port 4173 was free after hunt cleanup (no orphan, no teardown race) per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122/123/124/125/126/127/128 precedent.

## Quality Gates

All gates pass. No app code changes required.

Validates `origin/main` at `2fb180c2` (3 commits past Run 128 audit merge `d9c47258`:
#3942 repokeeper cycle 32 docs, #3941 fix(a11y) StepInfo mobile autocorrect — app
change covered green by this sweep, #3935 fix(a11y) EditorEmptyState decorative dots
aria-hidden — app change covered green by this sweep) with no regressions.

Playwright Chromium (ARM64, chromium-1248 full + headless shell) freshly installed on
runner (cache empty at run start).

Test delta vs Run 128: web +2 (StepInfo tests from #3941), shared +3 — 2,984 → **2,989**.

🧛‍♂️⭐
