# BroCula Audit — Run 131 (2026-10-29)

**Branch:** `brocula/loop-2026-10-29-run131`
**Base:** `origin/main` at `b9d1e494` (Run 130 audit merge `cc543cfa` + 3 commits)

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
| Secrets scan (356 files) | ✅ |
| npm audit (production) | ✅ 0 vulnerabilities |
| Tests | **2,984 pass** (1,392 web + 555 api + 1,037 shared) |

## Lighthouse Details

### Hunt pass
- Performance: 98
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 1.0s
- TBT: 160ms
- CLS: 0.007
- Byte weight: 262 KiB (268,468 B)
- Main-thread: 2.2s / JS execution: 0.5s
- Savings >0 audits: 1 (`unused-javascript` 26 KiB `vendor-react-dom-nzDyrI2d.js` bytes-only flag — framework-inherent, same chunk hash as Run 106–130)

### Warm pass (clean re-run)
- Performance: 98
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 1.1s
- TBT: 150ms
- CLS: 0.007
- Byte weight: 262 KiB
- Savings >0 audits: 0

Sub-100 on both passes = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130 precedent (hunt TBT 160ms / warm TBT 150ms within known variance band).

### Byte weight (262 KiB) — fully accounted, no regression

Byte weight matches Run 129/130's 262 KiB: the **JetBrains Mono woff2**
(31,369 B, `fonts.gstatic.com`, `display=optional` — timing-dependent load per the
non-render-blocking design in `apps/web/index.html`; warm pass of Run 130 measured
262 KiB with the font, this run's clean warm also loaded it at 262 KiB). 268,468 −
31,369 = **237,099 B ≈ the 231–232 KiB Run 106–128 baseline** — every other resource
byte-identical, `total-byte-weight` score = 1 (no penalty). No code-level action.

The `unused-javascript` flag on `vendor-react-dom-nzDyrI2d.js` is framework-inherent —
react-dom ships ~40% unused code in client-only usage. Already isolated in dedicated
vendor chunk per `vite.config.ts` manualChunks config. No code-level action.

### First warm attempt invalidated (operator interference, not a regression)

The first `lh:warm` invocation ran concurrently with a trailing `npm run build`
quality gate. The build rewrote `dist/` mid-measure, producing transient 404s on
lazy chunks (`ErrorFallback`, `ScrollToTop`, `PageScrollProgressBar`,
`use-spring`, `clipboard`) → cascaded `errors-in-console` (BP 96) and
`landmark-one-main` (a11y 93, since the failed ErrorFallback import prevented
`<main>` from mounting). Hunt pass on the same tree had a11y/BP 100 and the sweep
confirmed 0 console errors against the same dist — clean sequential re-run after
dist stabilized restored **98/100/100/100**. Documented per the teardown-race
transparency precedent.

## Interactive Sweep (25/25)

Landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons (Back to Review + Try Again → Review recovery) + Ctrl+E editor toggle.

**25/25 assertions on first attempt with fresh tmux-detached `--strictPort` server**
after the initial nohup-preview attempt hit `ERR_CONNECTION_REFUSED` (shell-timeout
teardown race — same class as Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130
precedent; tmux session re-establishes a stable detached server per protocol).

## Quality Gates

All gates pass. No app code changes required.

Validates `origin/main` at `b9d1e494` (3 commits past Run 130 audit merge `cc543cfa`:
#3950 fix(a11y) disable mobile autocapitalize/autocorrect on shortcuts search &
feature inputs — app change covered green by this sweep, #3953 repokeeeper cycle 34
docs, #3952 fix(a11y) focus-trap main-landmark fallback when trigger detached —
app change covered green by this sweep) with no regressions.

Playwright Chromium (ARM64, chromium-1248 full + headless shell) freshly installed on
runner (cache empty at run start).

Test delta vs Run 130: 2,980 → **2,984** (web +4) — fully accounted: new
`useFocusTrap.test.ts` landmark-fallback cases (#3952),
`KeyboardShortcutsModal.test.tsx` autocapitalize cases (#3950),
`StepFeatures.test.tsx` autocorrect cases (#3950). api 555 and shared 1,037
unchanged.

🧛‍♂️⭐
