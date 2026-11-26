# BroCula Audit — Run 143 (2026-11-26)

**Branch:** `brocula/loop-2026-11-26-run143`
**Base:** `origin/main` at `baf6500a` (5 commits past Run 142 audit base 06a0a2b3 — incl. app changes #4081 fix(web) stop remaining idle infinite loops on static landing and #4077 fix(web) honor prefers-reduced-motion on generation auto-scroll (WCAG 2.3.3), both covered green by this sweep; docs-only #4078/#4079/#4080)

## Summary

BroCula ULW Loop — LH **97 hunt / 99-98 warm — 100-100-100** ⭐

| Gate | Result |
| --- | --- |
| Console errors | **0** |
| Console warnings | **0** |
| Failed non-API requests | **0** |
| Interactive sweep | **25/25 assertions** |
| Lighthouse hunt | Perf 97 / A11y 100 / BP 100 / SEO 100 |
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
| Tests | **3,158 pass** (1,493 web + 558 api + 1,107 shared) |

## Lighthouse Details

### Hunt pass
- Performance: 97
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 200ms
- CLS: 0.007
- Byte weight: 278 KiB (284,506 B)
- Savings >0 (time) audits: 0
- Main-thread: 2.0s / JS execution: 0.5s
- `unused-javascript` bytes-only flag: 48,866 B total = `vendor-react-dom-nzDyrI2d.js` 25,801 B of 65,719 B (framework-inherent, same chunk as Run 106–142) + `schemas-fy1VVhR7.js` 23,065 B of 25,254 B — packages/shared Zod schema bundle statically imported by `security-BoG29GI4.js`, score-neutral with `total-byte-weight` already 1 — no code-level action per Run 106–142 bytes-only-flag precedent
- `unused-css-rules` bytes-only flag: 11,338 B `index-a4CJuUVq.css` of 15,191 B transfer — main Tailwind stylesheet shared across landing + wizard routes; unused portion is off-screen wizard-step utilities, score-neutral — no code-level action (content hash changed from #4081 index.css edit, +1 B vs Run 142's 11,337 B)

### Warm pass 1
- Performance: 99
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 120ms
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

All three passes 97–99 perf / savings>0 (time) 0 = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130/131/132/133/134/135/136/137/138/139/140/141/142 precedent (known TBT variance band 100–530ms), not a regression. Hunt TBT 200ms within band; warm recovery to 99 confirms variance.

### Byte weight (278 KiB) — fully accounted, score 1

Top transfers: `vendor-react-dom-nzDyrI2d.js` 66,074 B, JetBrains Mono woff2 31,369 B (`fonts.gstatic.com`, `display=optional` — timing-dependent load per non-render-blocking design in `apps/web/index.html`), `schemas-fy1VVhR7.js` 25,608 B, `es-yNarrea6.js` 21,126 B, `index-a4CJuUVq.css` 15,538 B (new hash from #4081, −3 B vs Run 142), `index-zHQSLfji.js` 15,440 B (new hash from #4077/#4081, −2 B vs Run 142), `accessibility-Curx7ACD.js` 14,374 B, `purify.es-DITawkbe.js` 11,798 B. Byte-identical 278 KiB total to Run 137–142 — `total-byte-weight` score = 1 (no penalty), no regression.

## Interactive Sweep (25/25)

Landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons (Back to Review + Try Again → Review recovery) + Ctrl+E editor toggle.

**25/25 assertions on first attempt** with fresh tmux-detached `--strictPort`
server after proactively killing any port-4173 orphan (no teardown race — same
protocol as Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130/131/132/133/134/135/136/137/138/139/140/141/142).

## Quality Gates

All gates pass. App changes since Run 142 (#4081 idle infinite loops on static
landing, #4077 prefers-reduced-motion on generation auto-scroll) are covered
green by this sweep — no console errors, no regressions, byte weight unchanged
at 278 KiB.

Browser hunt/sweep/gates validated tree `baf6500a` (= `origin/main` at run
start and at PR time — no new commits landed during the run).

Playwright Chromium (ARM64, chromium-1255 full + headless shell) freshly
installed on runner (cache empty at run start).

Test delta vs Run 142: 3,156 → **3,158** (+2 web, fully accounted by #4077
useAutoScroll prefers-reduced-motion test cases; api 558 and shared 1,107
unchanged — matches app diff `useAutoScroll.test.ts` +81 lines).

No actionable Lighthouse optimization opportunities — only known bytes-only
flags (unused-javascript 48,866 B, unused-css-rules 11,338 B) with scores
already at/above threshold, same no-action disposition as Run 106–142.

No app code changes required.

🧛‍♂️⭐
