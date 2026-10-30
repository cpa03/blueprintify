# BroCula Audit — Run 132 (2026-10-30)

**Branch:** `brocula/loop-2026-10-30-run132`
**Base:** `origin/main` at `e8f2be10` (Run 131 audit merge `3a1f3b11` + 5 commits)

## Summary

BroCula ULW Loop — LH **98 hunt / 98 warm — 100-100-100** ⭐

| Gate | Result |
| --- | --- |
| Console errors | **0** |
| Console warnings | **0** |
| Failed non-API requests | **0** |
| Interactive sweep | **25/25 assertions** |
| Lighthouse hunt | Perf 98 / A11y 100 / BP 100 / SEO 100 |
| Lighthouse warm | Perf 98 / A11y 100 / BP 100 / SEO 100 |
| Typecheck | ✅ |
| Lint (0 errors, 0 warnings) | ✅ |
| Build | ✅ |
| Build:api | ✅ |
| Prettier | ✅ |
| Secrets scan (358 files) | ✅ |
| npm audit (production) | ✅ 0 vulnerabilities |
| Tests | **2,994 pass** (1,402 web + 555 api + 1,037 shared) |

## Lighthouse Details

### Hunt pass
- Performance: 98
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 1.3s
- TBT: 140ms
- CLS: 0.007
- Byte weight: 262 KiB
- Main-thread: 2.0s / JS execution: 0.5s
- Savings >0 audits: 0
- `unused-javascript` bytes-only flag: 26 KiB `vendor-react-dom-nzDyrI2d.js` 26,248 B — framework-inherent (react-dom ships ~40% unused code in client-only usage; already isolated in dedicated vendor chunk per `vite.config.ts` manualChunks), same chunk hash as Run 106–131, no code-level action

### Warm pass (clean re-run)
- Performance: 98
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 1.3s
- TBT: 150ms
- CLS: 0.007
- Byte weight: 262 KiB
- Savings >0 audits: 0

Sub-100 on both passes = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130/131 precedent (hunt TBT 140ms / warm TBT 150ms within known variance band).

### Byte weight (262 KiB) — fully accounted, no regression

Byte weight matches Run 129/130/131's 262 KiB: the **JetBrains Mono woff2**
(31,369 B, `fonts.gstatic.com`, `display=optional` — timing-dependent load per the
non-render-blocking design in `apps/web/index.html`). 268,468 − 31,369 = **237,099 B
≈ the 231–232 KiB Run 106–128 baseline** — every other resource byte-identical,
`total-byte-weight` score = 1 (no penalty). No code-level action.

## Interactive Sweep (25/25)

Landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons (Back to Review + Try Again → Review recovery) + Ctrl+E editor toggle.

**25/25 assertions on first attempt** with fresh tmux-detached `--strictPort`
server after proactively killing any port-4173 orphan (no teardown race — same
protocol as Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130/131).

## Quality Gates

All gates pass. No app code changes required.

Validates `origin/main` at `e8f2be10` (6 commits past Run 131 base `b9d1e494`:
#3958 fix(web) celebration-state reset + per-tab content tracking — app change
covered green by this sweep, #3957 Run 131 audit docs, #3956 refactor(flexy)
StepInfo DOM element ID centralization Iteration 211 — app refactor covered
green by this sweep, #3955 repokeeeper cycle 35 docs, #3959 feat(ui) offline
banner accessibility + state inspection — app change covered green by this
sweep, #3954 feat(web) paste-truncation announcements on maxLength wizard
fields — app change covered green by this sweep) with no regressions.

Playwright Chromium (ARM64, chromium-1248 full + headless shell) freshly
installed on runner (cache empty at run start).

Test delta vs Run 131: 2,984 → **2,994** (web +10) — fully accounted:
new `usePasteTruncation.test.ts` (#3954),
`OfflineBanner.test.tsx` cases (#3959),
`accessibility.test.ts` DOM_ELEMENT_IDS cases (#3956),
`GenerationCelebration.test.tsx` cases (#3958). api 555 and shared 1,037
unchanged.

🧛‍♂️⭐
