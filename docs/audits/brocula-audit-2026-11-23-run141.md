# BroCula Audit — Run 141 (2026-11-23)

**Branch:** `brocula/loop-2026-11-23-run141`
**Base:** `origin/main` at `00333fdb` (#4061 fix(web) render added-feature chips with dir=auto for RTL text — app change covered green by this sweep; 1 commit past Run 140 audit merge 745922ae)

## Summary

BroCula ULW Loop — LH **99 hunt / 99-98 warm — 100-100-100** ⭐

| Gate | Result |
| --- | --- |
| Console errors | **0** |
| Console warnings | **0** |
| Failed non-API requests | **0** |
| Interactive sweep | **25/25 assertions** |
| Lighthouse hunt | Perf 99 / A11y 100 / BP 100 / SEO 100 |
| Lighthouse warm1 | Perf 99 / A11y 100 / BP 100 / SEO 100 |
| Lighthouse warm2 | Perf 98 / A11y 100 / BP 100 / SEO 100 |
| Typecheck | ✅ |
| Lint (0 errors, 0 warnings) | ✅ |
| Build | ✅ |
| Build:api | ✅ |
| Prettier | ✅ |
| Secrets scan (361 files) | ✅ |
| npm audit (production) | ✅ 0 vulnerabilities |
| validate:wrangler | ✅ |
| validate:models (56 agent files) | ✅ |
| Tests | **3,152 pass** (1,487 web + 558 api + 1,107 shared) |

## Lighthouse Details

### Hunt pass
- Performance: 99
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 130ms
- CLS: 0.007
- Byte weight: 278 KiB
- Savings >0 audits: 0
- Main-thread: 1.8s / JS execution: 0.5s
- `unused-javascript` bytes-only flag: 49,313 B total = `vendor-react-dom-nzDyrI2d.js` 26,248 B of 65,719 B (framework-inherent, same chunk as Run 106–140) + `schemas-fy1VVhR7.js` 23,065 B of 25,254 B — packages/shared Zod schema bundle statically imported by `security-BoG29GI4.js`, score-neutral with `total-byte-weight` already 1 — no code-level action per Run 106–140 bytes-only-flag precedent
- `unused-css-rules` bytes-only flag: 11 KiB `index-cKbhwKcw.css` 11,337 B of 15,194 B — main Tailwind stylesheet shared across landing + wizard routes; unused portion is off-screen wizard-step utilities, score-neutral — no code-level action

### Warm pass 1
- Performance: 99
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 140ms
- CLS: 0.007
- Byte weight: 278 KiB
- Savings >0 audits: 0

### Warm pass 2
- Performance: 98
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 170ms
- CLS: 0.007
- Byte weight: 278 KiB
- Savings >0 audits: 0

Warm2 98 (TBT 170ms) with savings>0 = 0 and identical FCP/LCP/CLS/byte weight to the other passes = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130/131/132/133/134/135/136/137/138/139/140 precedent (known TBT variance band 130–530ms), not a regression.

### Byte weight (278 KiB) — fully accounted, score 1

Top transfers: `vendor-react-dom-nzDyrI2d.js` 66,074 B, JetBrains Mono woff2 31,369 B (`fonts.gstatic.com`, `display=optional` — timing-dependent load per non-render-blocking design in `apps/web/index.html`), `schemas-fy1VVhR7.js` 25,608 B, `es-yNarrea6.js` 21,126 B, `index-cKbhwKcw.css` 15,541 B, `index-9rdrKPKA.js` 15,423 B (new content hash from #4061 RTL chips, 15,423 B vs Run 140's 15,421 B = +2 B), `accessibility-Curx7ACD.js` 14,374 B, `purify.es-DITawkbe.js` 11,798 B. Byte-identical to Run 137/138/139/140's 278 KiB — `total-byte-weight` score = 1 (no penalty), no regression.

## Interactive Sweep (25/25)

Landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons (Back to Review + Try Again → Review recovery) + Ctrl+E editor toggle.

**25/25 assertions on first attempt** with fresh tmux-detached `--strictPort`
server after proactively killing any port-4173 orphan (no teardown race — same
protocol as Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130/131/132/133/134/135/136/137/138/139/140).

## Quality Gates

All gates pass. The only app change since Run 140 (#4061 RTL `dir=auto` on
added-feature chips) is covered green by this sweep — no console errors, no
regressions, byte weight unchanged at 278 KiB.

Browser hunt/sweep/gates validated tree `00333fdb` (= `origin/main` at run
start and at PR time — no new commits landed during the run).

Playwright Chromium (ARM64, chromium-1254 full + headless shell) freshly
installed on runner (cache empty at run start).

Test delta vs Run 140: 3,151 → **3,152** (+1 web, fully accounted by #4061
RTL chips change gaining a test case; api 558 and shared 1,107 unchanged).

No actionable Lighthouse optimization opportunities — only known bytes-only
flags (unused-javascript 49,313 B, unused-css-rules 11,337 B) with scores
already at/above threshold, same no-action disposition as Run 106–140.

🧛‍♂️⭐
