# BroCula Audit — Run 133 (2026-11-19)

**Branch:** `brocula/loop-2026-11-19-run133`
**Base:** `origin/main` at `2fff285c` (Run 132 audit merge `98cb83b8` + 73 commits)

## Summary

BroCula ULW Loop — LH **98 hunt / 87-98 warm — 100-100-100** ⭐

| Gate | Result |
| --- | --- |
| Console errors | **0** |
| Console warnings | **0** |
| Failed non-API requests | **0** |
| Interactive sweep | **25/25 assertions** |
| Lighthouse hunt | Perf 98 / A11y 100 / BP 100 / SEO 100 |
| Lighthouse warm1 | Perf 87 / A11y 100 / BP 100 / SEO 100 |
| Lighthouse warm2 | Perf 98 / A11y 100 / BP 100 / SEO 100 |
| Typecheck | ✅ |
| Lint (0 errors, 0 warnings) | ✅ |
| Build | ✅ |
| Build:api | ✅ |
| Prettier | ✅ |
| Secrets scan (358 files) | ✅ |
| npm audit (production) | ✅ 0 vulnerabilities |
| validate:wrangler | ✅ |
| validate:models (56 agent files) | ✅ |
| Tests | **3,128 pass** (1,463 web + 558 api + 1,107 shared) |

## Lighthouse Details

### Hunt pass
- Performance: 98
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 180ms
- CLS: 0.007
- Byte weight: 277 KiB
- Main-thread: 2.1s / JS execution: 0.6s
- Savings >0 audits: 0
- `unused-javascript` bytes-only flag: 48 KiB total = `vendor-react-dom-nzDyrI2d.js` 26,248 B (framework-inherent, same chunk as Run 106–132) + `schemas-fy1VVhR7.js` 23,065 B of 25,254 B — the packages/shared Zod schema bundle, statically imported by `security-BoG29GI4.js` (2 named exports used by the input-sanitization layer; remainder is shared wizard/validation schemas). Newly observed loaded on landing this run; splitting would require partitioning packages/shared exports across the security→schemas static dependency for marginal gain with `total-byte-weight` score already 1 — no code-level action per Run 106–132 bytes-only-flag precedent
- `unused-css-rules` bytes-only flag: 11 KiB `index-cKbhwKcw.css` 11,337 B of 15,194 B — main Tailwind stylesheet shared across landing + wizard routes; unused portion is off-screen wizard-step utilities, score-neutral — no code-level action

### Warm pass 1
- Performance: 87
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.7s
- TBT: 530ms (elevated)
- CLS: 0.007
- Byte weight: 278 KiB
- Savings >0 audits: 0

### Warm pass 2 (clean re-run to characterize)
- Performance: 98
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 170ms
- CLS: 0.007
- Byte weight: 277 KiB
- Savings >0 audits: 0

Warm1 87 (TBT 530ms) → warm2 98 (TBT 170ms) in-session recovery confirms ARM64 runner CPU variance, not regression, per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130/131/132 precedent (warm1 TBT 530ms same elevated-TBT band as prior low-warm dips; hunt TBT 180ms and warm2 TBT 170ms within known variance band).

### Byte weight (277 KiB) — fully accounted, score 1

Top transfers: `vendor-react-dom-nzDyrI2d.js` 66,074 B, JetBrains Mono woff2 31,369 B (`fonts.gstatic.com`, `display=optional` — timing-dependent load per non-render-blocking design in `apps/web/index.html`), `schemas-fy1VVhR7.js` 25,608 B, `es-yNarrea6.js` 21,126 B, `index-cKbhwKcw.css` 15,541 B, `index-DeWV-_vU.js` 15,356 B, `accessibility-Dhi3F7m5.js` 14,096 B, `purify.es-DITawkbe.js` 11,798 B. `total-byte-weight` score = 1 (no penalty). 277 KiB vs Run 132's 262 KiB (+15 KiB) = schemas chunk transfer now observed during hunt plus font-timing variance — no regression concern, score unchanged.

## Interactive Sweep (25/25)

Landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons (Back to Review + Try Again → Review recovery) + Ctrl+E editor toggle.

**25/25 assertions on first attempt** with fresh tmux-detached `--strictPort`
server after proactively killing any port-4173 orphan (no teardown race — same
protocol as Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130/131/132).

## Quality Gates

All gates pass. No app code changes required.

Validates `origin/main` at `2fff285c` (73 commits past Run 132 audit merge
`98cb83b8`, incl. 45 app-change commits covered green by this sweep. Notable:
#4039 fix(web) focus-visible rings footer external links, #4034 fix(web) drop
incorrect aria-orientation on TemplateGrid listbox, #4030 fix(web) tech-stack
selection bar ARIA progressbar, #4029 fix(web) announce limit reached on
compact counter, #4020 fix(web) hide pre-hydration skeleton from AT, #4017
fix(web) gate step-indicator pulse, #4015 fix(web) pause decorative idle loops
when page hidden, #4013/#4012 fix(web) gate skip-link animations / stop
infinite shimmer on static landing skeletons, #4008 fix(web) preserve keyboard
focus on toast dismiss, #4007 fix(web) announce paste truncation, #4001
fix(web) keep focus on Add all suggestions, #3993 feat(web) editor empty-state
? badge opens shortcuts modal, #3992 fix(web) editor copy failure error toast,
#3991 fix(api,web) prompt-injection false negatives + markdown import
truncation, #3989 fix(a11y) character counters aria-describedby, #3984
fix(web) PreviewEmptyState switch aria-label, #3978 feat(web)
data-reduced-motion/data-current-step DOM inspection, #3975/#3973/#3972/
#3968/#3964/#3960 fix(web) WCAG counter/toast/table/Next/copy-button
focus & announcement fixes, flexy Iterations 212–222, dep bumps
#4024/#4025/#3979–#3981/#3976/#3977) with no regressions.

Playwright Chromium (ARM64, chromium-1254 full + headless shell) freshly
installed on runner (cache empty at run start).

Test delta vs Run 132: 2,994 → **3,128** (+134: web +61, api +3, shared +70) —
fully accounted by test additions across the 73 commits (bugfixer fatal-gate
cycles 34–41 document the live-status progression 3,060→3,128; key sources =
WCAG/accessibility test cases from the fix(web)/fix(a11y) commits listed
above, api prompt-injection/markdown tests from #3991, shared schema/config
test expansions across flexy and dep-bump cycles).

🧛‍♂️⭐
