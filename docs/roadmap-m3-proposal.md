# M3 Strategic Expansion Proposal

> **Status**: Proposal — pending review
> **Date**: 2026-06-07
> **Rationale**: Existing M3 criteria (ZIP download, share links, performance) are already met. This proposal defines a refreshed scope.

## M3 Assessment: Current Criteria Already Met

| Criterion                                | Status | Evidence                                                                    |
| ---------------------------------------- | ------ | --------------------------------------------------------------------------- |
| ZIP download generates runnable projects | ✅ Met | `apps/web/src/lib/export.ts` — JSZip-based export with template scaffolding |
| Share links work correctly               | ✅ Met | `apps/api/src/routes/share.ts` — CRUD share API with D1 persistence         |
| Performance meets standards              | ✅ Met | Lighthouse 100-100-100-100 across multiple BroCula audit cycles             |

## Proposed M3 Scope: Collaboration & Intelligence

Three high-leverage capabilities ordered by value:

---

### M3-A: Collaborative Blueprint Sharing with Auth (Estimated: 3-4 days)

**User Story**: As a project creator, I want to share my blueprints with specific collaborators so that my team can review and contribute without needing to share an API key.

**Acceptance Criteria**:

- [ ] Share links support optional passphrase protection
- [ ] Shared blueprints display in a read-only view with "Fork" capability
- [ ] Fork creates a new local blueprint copy from the shared link
- [ ] Share management UI (list active shares, revoke access, extend expiration)
- [ ] Rate limiting per share ID to prevent enumeration attacks

**Value Justification**: Currently shares are anonymous with no access control. This bridges the gap between "share a link" and "collaborate on a document" — the natural next step for a documentation tool.

**Risk**: Low — extends existing share infrastructure. No new external dependencies.

---

### M3-B: AI-Powered Blueprint Enhancement (Estimated: 3-4 days)

**User Story**: As a user, I want to uplevel my generated blueprint with AI-powered suggestions for missing sections, technology alternatives, and architecture improvements.

**Acceptance Criteria**:

- [ ] "Suggest improvements" button analyzes current blueprint for gaps
- [ ] AI suggests additional features, technologies, or constraints based on project description
- [ ] Suggestions are presented as toggle-able additions (not auto-applied)
- [ ] One-click "Enhance from suggestion" refines the blueprint
- [ ] Enhancement uses existing SSE streaming (no new infrastructure)

**Value Justification**: This leverages the existing AI pipeline (OpenAI + SSE streaming) to provide additive value beyond initial generation. Differentiates from static documentation generators.

**Risk**: Low — extends existing `/refine` endpoint pattern.

---

### M3-C: Version History & Diff View (Estimated: 3-4 days)

**User Story**: As a user, I want to see previous versions of my blueprint and restore them so that I can track changes and recover from mistakes.

**Acceptance Criteria**:

- [ ] Auto-save creates version snapshots (debounced, max 50 per project)
- [ ] Version history panel shows timestamps with "Restore" button
- [ ] Diff view highlights additions/removals between versions
- [ ] localStorage quota management integrates with version count
- [ ] Export includes version history metadata (optional)

**Value Justification**: Users frequently iterate on blueprints. Version history is a safety net that encourages experimentation. Differentiator vs competitors.

**Risk**: Medium — localStorage quota management needs careful implementation. Diff rendering adds UI complexity.

---

## Recommendation

**Start with M3-A (Collaborative Sharing)** — highest user impact, lowest risk, extends existing infrastructure. M3-B and M3-C can follow in any order depending on user feedback.

## Dependencies & Blockers

| Dependency                      | Status     | Notes                                                         |
| ------------------------------- | ---------- | ------------------------------------------------------------- |
| CI/CD workflow node-version fix | ⚠️ Blocked | Requires `workflows: write` token — manual push by maintainer |
| No new npm dependencies         | ✅         | All proposals use existing deps                               |

## Definition of Done

- [ ] M3 scope approved and added to roadmap
- [ ] User stories broken into actionable issues with acceptance criteria
- [ ] CI/CD workflow fix applied (blocker resolved)
