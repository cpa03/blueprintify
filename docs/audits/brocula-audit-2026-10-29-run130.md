# BroCula Audit — Run 130 (2026-10-29)

**Branch:** `brocula/loop-2026-10-29-run130`
**Base:** `origin/main` at `81ff51e1` (Run 129 audit merge `fb16864f` + 5 commits)

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
| Secrets scan (354 files) | ✅ |
| npm audit (production) | ✅ 0 vulnerabilities |
| Tests | **2,980 pass** (1,388 web + 555 api + 1,037 shared) |

## Lighthouse Details

### Hunt pass
- Performance: 99
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 1.1s
- TBT: 140ms
- CLS: 0.007
- Byte weight: 262 KiB
- Main-thread: 2.1s / JS execution: 0.5s
- Savings >0 audits: 0 (`unused-javascript` 26 KiB `vendor-react-dom-nzDyrI2d.js` 26,248 B bytes-only flag — framework-inherent, same chunk hash as Run 106–129)

### Warm pass
- Performance: 99
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 1.3s
- TBT: 130ms
- CLS: 0.007
- Byte weight: 262 KiB
- Savings >0 audits: 0

Sub-100 on both passes = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129 precedent (hunt TBT 140ms / warm TBT 130ms within known variance band).

### Byte weight (262 KiB) — fully accounted, no regression

Byte weight matches Run 129's 262 KiB exactly: the **JetBrains Mono woff2**
(31,369 B, `fonts.gstatic.com`, `display=optional` — timing-dependent load per the
non-render-blocking design in `apps/web/index.html`). 268,381 − 31,369 = **237,012 B
≈ the 231–232 KiB Run 106–128 baseline** — every other resource byte-identical,
`total-byte-weight` score = 1 (no penalty). No code-level action.

The `unused-javascript` flag on `vendor-react-dom-nzDyrI2d.js` (26,248 B) is
framework-inherent — react-dom ships ~40% unused code in client-only usage. Already
isolated in dedicated vendor chunk per `vite.config.ts` manualChunks config. No
code-level action.

## Interactive Sweep (25/25)

Landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons (Back to Review + Try Again → Review recovery) + Ctrl+E editor toggle.

**25/25 assertions on first attempt** with fresh tmux-detached `--strictPort` server
after killing the hunt-orphan on 4173, no teardown race per Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129 precedent.

## Quality Gates

All gates pass. No app code changes required.

Validates `origin/main` at `81ff51e1` (5 commits past Run 129 audit merge `fb16864f`:
#3945 flexy Iteration 210 platform.ts CSS-value bypass refactor — app change covered
green by this sweep, #3943 fix(a11y) StepInfo sentence capitalization/spellcheck —
app change covered green by this sweep, #3944 repokeeper cycle 33 docs, #3947 fix(web)
StepTransition suspense act warning — app change covered green by this sweep, #3948
janitor docs carrying the 10-27 enabled `usePersistedStore` dead-duplicate removal
(~485 LOC, vestigial parallel `createPersistedStore` factory superseded by
`store/persistence.ts`; app change covered green by this sweep) with no regressions.

Playwright Chromium (ARM64, chromium-1248 full + headless shell) freshly installed on
runner (cache empty at run start).

Test delta vs Run 129: 2,989 → **2,980** (web −11, shared +2) — fully accounted:
`usePersistedStore.test.ts` suite removed with the dead module (#3948), reworked
`StepTransition.test.tsx` (#3947), +`StepInfo.test.tsx` cases (#3943), shared
`config.test.ts` updates (#3945). Janitor cycle-33 verify run independently measured
the identical 2,980/2,980 (web 1,388/91 + api 555/35 + shared 1,037/5).

🧛‍♂️⭐
