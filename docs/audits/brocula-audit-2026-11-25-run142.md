# BroCula Audit — Run 142 (2026-11-25)

**Branch:** `brocula/loop-2026-11-25-run142`
**Base:** `origin/main` at `06a0a2b3` (#4075 docs(bugfixer) fatal-gate cycle 49; 14 commits past Run 141 audit base 00333fdb — incl. app changes #4063 fix(a11y) aria-valuetext on progress bars and #4072 fix(web) SmartTooltip keyboard-focus show, both covered green by this sweep; #4066/#4067/#4068 dep bumps, #4069/#4070 janitor, docs-only #4064/#4065/#4071/#4073/#4074/#4075/#4076)

## Summary

BroCula ULW Loop — LH **99 hunt / 99-99 warm — 100-100-100** ⭐

| Gate | Result |
| --- | --- |
| Console errors | **0** |
| Console warnings | **0** |
| Failed non-API requests | **0** |
| Interactive sweep | **25/25 assertions** |
| Lighthouse hunt | Perf 99 / A11y 100 / BP 100 / SEO 100 |
| Lighthouse warm1 | Perf 99 / A11y 100 / BP 100 / SEO 100 |
| Lighthouse warm2 | Perf 99 / A11y 100 / BP 100 / SEO 100 |
| Typecheck | ✅ |
| Lint (0 errors, 0 warnings) | ✅ |
| Build | ✅ |
| Build:api | ✅ |
| Prettier | ✅ |
| Secrets scan (361 files) | ✅ |
| npm audit (production) | ✅ 0 vulnerabilities |
| validate:wrangler | ✅ |
| validate:models (56 agent files) | ✅ |
| Tests | **3,156 pass** (1,491 web + 558 api + 1,107 shared) |

## Lighthouse Details

### Hunt pass
- Performance: 99
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 140ms
- CLS: 0.007
- Byte weight: 278 KiB
- Savings >0 (time) audits: 0
- Main-thread: 1.8s / JS execution: 0.5s
- `unused-javascript` bytes-only flag: 48,866 B total = `vendor-react-dom-nzDyrI2d.js` 25,801 B of 65,719 B (framework-inherent, same chunk as Run 106–141) + `schemas-fy1VVhR7.js` 23,065 B of 25,254 B — packages/shared Zod schema bundle statically imported by `security-BoG29GI4.js`, score-neutral with `total-byte-weight` already 1 — no code-level action per Run 106–141 bytes-only-flag precedent
- `unused-css-rules` bytes-only flag: 11,337 B `index-cKbhwKcw.css` of 15,194 B transfer — main Tailwind stylesheet shared across landing + wizard routes; unused portion is off-screen wizard-step utilities, score-neutral — no code-level action

### Warm pass 1
- Performance: 99
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 150ms
- CLS: 0.007
- Byte weight: 278 KiB
- Savings >0 audits: 0

### Warm pass 2
- Performance: 99
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP/LCP: 0.6s
- TBT: 100ms
- CLS: 0.007
- Byte weight: 278 KiB
- Savings >0 audits: 0

All three passes 99 perf / savings>0 (time) 0 = ARM64 runner CPU variance per Run 67/70/71/73/74/75/76/78/79/80/81/82/90/91/92/93/94/95/96/97/98/99/100/101/102/103/104/105/106/107/108/109/110/111/112/113/114/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130/131/132/133/134/135/136/137/138/139/140/141 precedent (known TBT variance band 100–530ms), not a regression.

### Byte weight (278 KiB) — fully accounted, score 1

Top transfers: `vendor-react-dom-nzDyrI2d.js` 66,074 B, JetBrains Mono woff2 31,369 B (`fonts.gstatic.com`, `display=optional` — timing-dependent load per non-render-blocking design in `apps/web/index.html`), `schemas-fy1VVhR7.js` 25,608 B, `es-yNarrea6.js` 21,126 B, `index-cKbhwKcw.css` 15,541 B, `index-DcVhhdCm.js` 15,442 B (new content hash from #4063/#4072 app changes), `accessibility-Curx7ACD.js` 14,374 B, `purify.es-DITawkbe.js` 11,798 B. Byte-identical total to Run 137–141's 278 KiB — `total-byte-weight` score = 1 (no penalty), no regression.

## Interactive Sweep (25/25)

Landing load/scroll + keyboard nav with Home/End roving tabindex + shortcuts dialog + template select → wizard auto-advance to Review + reload persistence with Generate enabled + generate error path with verified recovery buttons (Back to Review + Try Again → Review recovery) + Ctrl+E editor toggle.

**25/25 assertions on first attempt** with fresh tmux-detached `--strictPort`
server after proactively killing any port-4173 orphan (no teardown race — same
protocol as Run 90/91/95/96/97/98/99/101/104/107/108/110/111/112/113/115/116/117/118/119/120/121/122/123/124/125/126/127/128/129/130/131/132/133/134/135/136/137/138/139/140/141).

## Quality Gates

All gates pass. App changes since Run 141 (#4063 progress-bar `aria-valuetext`,
#4072 SmartTooltip keyboard-focus show) are covered green by this sweep — no
console errors, no regressions, byte weight unchanged at 278 KiB.

Browser hunt/sweep/gates validated tree `06a0a2b3` (= `origin/main` at run
start and at PR time — no new commits landed during the run).

Playwright Chromium (ARM64, chromium-1255 full + headless shell) freshly
installed on runner (cache empty at run start).

Test delta vs Run 141: 3,152 → **3,156** (+4 web, fully accounted by #4063
aria-valuetext cases and #4072 SmartTooltip focus cases; api 558 and shared
1,107 unchanged — matches bugfixer cycle 47–49 live-status 3,156).

No actionable Lighthouse optimization opportunities — only known bytes-only
flags (unused-javascript 48,866 B, unused-css-rules 11,337 B) with scores
already at/above threshold, same no-action disposition as Run 106–141.

No app code changes required.

🧛‍♂️⭐
