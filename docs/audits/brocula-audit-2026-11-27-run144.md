# BroCula Audit — Run 144 (2026-11-27)

**Branch:** `brocula/loop-2026-11-27-run144`
**Base:** `origin/main` at `3fa90f79` (1 commit past Run 143 audit base `baf6500a` — docs-only #4084 bugfixer fatal-gate cycle 51 test-count sync; app code byte-identical to Run 143)

## Summary

BroCula ULW Loop — LH **96 hunt / 98-97 warm — 100-100-100** ⭐

| Gate | Result |
| --- | --- |
| Console errors | **0** |
| Console warnings | **0** |
| Failed non-API requests | **0** |
| Interactive sweep | **25/25 assertions** |
| Lighthouse hunt | Perf 96 / A11y 100 / BP 100 / SEO 100 |
| Lighthouse warm1 | Perf 98 / A11y 100 / BP 100 / SEO 100 |
| Lighthouse warm2 | Perf 97 / A11y 100 / BP 100 / SEO 100 |
| Typecheck | ✅ |
| Lint (0 errors, 0 warnings) | ✅ |
| Build | ✅ |
| Build:api | ✅ |
| Prettier | ✅ |
| Secrets scan (361 files) | ✅ |
| npm audit (production) | ✅ 0 vulnerabilities |
| validate:wrangler | ✅ |
| validate:models (56 agent files) | ✅ |
| Tests | **3,161 pass** (1,496 web + 558 api + 1,107 shared) |

## Lighthouse Details

### Hunt pass
- Performance: 96
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 210ms
- CLS: 0.007
- Byte weight: 278 KiB
- Savings >0 (time) audits: 0
- Main-thread: 2.0s / JS execution: 0.5s
- `unused-javascript` bytes-only flag: 48,866 B total = `vendor-react-dom-nzDyrI2d.js` 25,801 B of 65,719 B (framework-inherent, same chunk as Run 106–143) + `schemas-fy1VVhR7.js` 23,065 B of 25,254 B — packages/shared Zod schema bundle statically imported by `security-BoG29GI4.js`, score-neutral with `total-byte-weight` already 1 — no code-level action per Run 106–143 bytes-only-flag precedent
- `unused-css-rules` bytes-only flag: 11,338 B `index-a4CJuUVq.css` of 15,191 B transfer — main Tailwind stylesheet shared across landing + wizard routes; unused portion is off-screen wizard-step utilities, score-neutral — no code-level action (byte-identical to Run 143; no app code changed)

### Warm pass 1
- Performance: 98
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 160ms
- CLS: 0.007
- Byte weight: 278 KiB
- Savings >0 audits: 0

### Warm pass 2
- Performance: 97
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 190ms
- CLS: 0.007
- Byte weight: 278 KiB
- Savings >0 audits: 0

All three passes 96–98 perf / savings>0 (time) 0 = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130/131/132/133/134/135/136/137/138/139/140/141/142/143 precedent (known TBT variance band 100–530ms), not a regression. Hunt TBT 210ms within band; warm recovery to 98 confirms variance.

### Byte weight (278 KiB) — fully accounted, score 1

Byte-identical to Run 137–143: `vendor-react-dom-nzDyrI2d.js` 66,074 B, JetBrains Mono woff2 31,369 B (`fonts.gstatic.com`, `display=optional` — timing-dependent load per non-render-blocking design in `apps/web/index.html`), `schemas-fy1VVhR7.js` 25,608 B, `es-yNarrea6.js` 21,126 B, `index-a4CJuUVq.css` 15,538 B, `index-DEm_blvV.js` 15,441 B, `accessibility-Curx7ACD.js` 14,374 B, `purify.es-DITawkbe.js` 11,798 B — `total-byte-weight` score = 1 (no penalty), no regression.

## Interactive Sweep (25/25)

Landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons (Back to Review + Try Again → Review recovery) + Ctrl+E editor toggle.

**25/25 assertions** on clean re-sweep with a fresh preview server after proactively
freeing port 4173 (first attempt 18/22 with `ERR_CONNECTION_REFUSED` on lazy
chunks `Toast-*.js` / `ErrorFallback-*.js` = stale hunt-orphan server on 4173 died
mid-sweep while the replacement preview had failed EADDRINUSE — same class as
Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130/131/143 teardown-race precedent; chunks verified present in dist and serving 200 before re-sweep).

## Quality Gates

All gates pass. No app code changes since Run 143 (docs-only #4084 between
bases) — this run's green sweep confirms the same tree remains clean.

Browser hunt/sweep/gates validated tree `3fa90f79` (= `origin/main` at run
start).

Playwright Chromium (ARM64, chromium-1255 full + headless shell) freshly
installed on runner (cache empty at run start).

Test count: **3,161** (1,496 web + 558 api + 1,107 shared) — matches the
docs-synced count established by #4084 (bugfixer cycle 51).

No actionable Lighthouse optimization opportunities — only known bytes-only
flags (unused-javascript 48,866 B, unused-css-rules 11,338 B) with scores
already at/above threshold and savings>0 (time) audits = 0 on all three
passes, same no-action disposition as Run 106–143.

No app code changes required.

🧛‍♂️
