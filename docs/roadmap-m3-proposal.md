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

## Implementation Plan: M3-A — Collaborative Blueprint Sharing

### Iteration 1: Passphrase Protection & Enhanced Share API (Estimated: 1 day)

**User Story**: As a project creator, I want to protect my shared blueprints with a passphrase so that only intended collaborators can access them.

**Backend Tasks**:

1. Add optional `passphraseHash` field to share schema (apps/api/src/routes/share.ts)
2. Add `POST /share/:id/verify` endpoint that accepts passphrase and returns access token
3. Add `passphrase_required` flag to share GET response
4. Rate limit verify endpoint per share ID (prevent brute-force)
5. Update Zod validation schemas in packages/shared

**Frontend Tasks**:

1. Add passphrase input dialog when accessing passphrase-protected share
2. Update ShareDialog component with passphrase toggle
3. Store access token in session storage

**Verification**:

- [ ] Shares created with passphrase require verification before viewing
- [ ] Shares without passphrase work as before (backward compatible)
- [ ] Failed passphrase attempts rate-limited (5 attempts/minute)
- [ ] Access token expires after browser session ends
- [ ] All existing tests pass (1,223+)

### Iteration 2: Read-Only View & Fork Capability (Estimated: 1 day)

**User Story**: As a user viewing a shared blueprint, I want to see it in a clean read-only view and create my own copy to build upon.

**Backend Tasks**:

1. Ensure share GET returns full blueprint content for read-only view
2. No additional backend needed — fork is client-side operation

**Frontend Tasks**:

1. Create `SharedBlueprintView` component (read-only markdown renderer)
2. Add "Fork this Blueprint" button that copies content to local editor
3. Style read-only view consistently with editor (dark mode support)
4. Handle fork-from-share edge case (user not authenticated)

**Verification**:

- [ ] Shared blueprint renders in read-only view
- [ ] Fork button creates local copy in editor
- [ ] Fork works without auth (localStorage only)
- [ ] Dark mode toggle works in read-only view

### Iteration 3: Share Management UI (Estimated: 1-2 days)

**User Story**: As a user with active shares, I want to see all my shared blueprints, revoke access, and extend expiration dates from a single dashboard.

**Backend Tasks**:

1. Add `GET /shares` endpoint listing user's active shares with metadata
2. Add `PATCH /share/:id` endpoint for updating expiration/revoking
3. Add share metadata (view count, created date, expires at) to list response

**Frontend Tasks**:

1. Create `ShareManager` component with share list table
2. Add "Revoke" button with confirmation dialog
3. Add "Extend Expiration" action
4. Add share status indicators (active/expired/revoked)
5. Integrate ShareManager into user settings or main navigation

**Verification**:

- [ ] Share list shows all active shares with metadata
- [ ] Revoke immediately invalidates share link
- [ ] Expiration extension works correctly
- [ ] Expired/revoked shares show appropriate status
- [ ] Empty state handled when no shares exist

## Definition of Done

- [ ] M3 scope approved and added to roadmap
- [ ] User stories broken into actionable issues with acceptance criteria
- [ ] CI/CD workflow fix applied (blocker resolved)
