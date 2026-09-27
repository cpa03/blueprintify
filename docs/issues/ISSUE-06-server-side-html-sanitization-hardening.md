# Issue: Hardening Server-Side HTML/Markdown Sanitization Beyond Regex

## Metadata
- **Category**: security
- **Priority**: P1
- **Affected Files**:
  - `apps/api/src/utils/sanitize.ts`
- **Origin**: Manual Architectural Code Review (API route hardening)

## Problem Description
`apps/api/src/utils/sanitize.ts` implements a custom regex-based HTML/Markdown sanitizer designed for Cloudflare Workers runtime (where standard browser DOM APIs and heavy JSDOM dependencies are unavailable).

While regex sanitization handles well-formed HTML tags:
- Regex-based HTML sanitizers are notoriously vulnerable to parser differentials (where the browser's HTML parser interprets malformed HTML differently than the regular expression engine, e.g. nested attributes, unclosed tags, comments inside tag names).
- Example: `<script <script>alert(1)</script>>` or `<a href="javascript&#58;alert(1)">` or mutated attribute boundaries.
- The Cloudflare Workers runtime now supports WASM-based or lightweight tree-based sanitizers (such as `ammonia-wasm` or `sanitize-html` configured with an HTML5 token stream parser).

## Proposed Solution
Evaluate and adopt a spec-compliant HTML parser or AST-based sanitizer compatible with Cloudflare Workers:
1. Benchmark lightweight parser options that run on `workerd` (e.g. `ultrahtml`, `sanitize-html` with custom worker adapter).
2. Add comprehensive XSS test vectors from OWASP Cheat Sheet to `sanitize.test.ts`.

## Acceptance Criteria
- [ ] No regression on safe Markdown tags (headings, tables, code blocks, lists).
- [ ] Known parser mutation vectors tested and blocked.
- [ ] Compatible with Cloudflare Workers (no Node-only native bindings).