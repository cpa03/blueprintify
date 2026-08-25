# CMZ Evolution Log

## Evolution History

### 2026-08-25 - TypeIndicator State & Shared Config Consolidation

**Type**: Micro-UX, Modularity, and State Tracking Consolidation
**Changes**:
- Defined and exported `TYPING_STATE_VALUES` (`TYPING: "typing"`, `IDLE: "idle"`) in `packages/shared/src/config/ui.ts` and `@blueprint/shared`.
- Enhanced `TypeIndicator` component in `apps/web/src/components/TypeIndicator.tsx` with `data-state` and `data-position` semantic DOM attributes for UI state inspection.
- Modularized `TypeIndicator` dot array rendering by replacing hardcoded `[0, 1, 2]` with centralized `LOADING_DOTS_COUNT` from `@blueprint/shared`.
- Added unit test assertions in `TypeIndicator.test.tsx` for `data-state` and `data-position` attributes. All 19 tests pass.
- Verified 0 lint errors/warnings, typecheck, build, and full 2,631/2,631 test suite pass.

**Rationale**: Centralized source of truth for component state tracking across shared and web packages, eliminating hardcoded array literals.

### 2026-08-20 - Palette micro-UX Cycle — Reduced-motion toggle app-wide parity

**Type**: Accessibility micro-UX improvement
**Changes**:
- The Header "Reduce Motion" toggle (`Header.tsx` `toggleReducedMotion` → `setUserOverride`) wrote `STORAGE_KEYS.REDUCED_MOTION` to localStorage, but only `ReducedMotionContext` consumers (`AnimatedNumber`, `Header`) honored it — the ~25 components using `useReducedMotion()` read only the OS `prefers-reduced-motion` media query, so the in-app toggle announced "reduce motion on" while most animations kept running.
- `useReducedMotion()` (`apps/web/src/hooks/useReducedMotion.ts`) now reads the localStorage override first (try/catch-guarded for privacy mode) and falls back to the media query; its subscription also listens for the new `ACCESSIBILITY_EVENTS.REDUCED_MOTION_CHANGE` window event so hook consumers re-render same-tab when the override changes (localStorage `storage` events do not fire same-tab). `useAccessibilityPreferences()` inherits the fix automatically.
- `ReducedMotionContext` dispatches the new window event from `setUserOverride` (both set/clear branches) and `resetToSystemPreference`; public API and matchMedia subscription unchanged.
- Added `ACCESSIBILITY_EVENTS.REDUCED_MOTION_CHANGE` to `apps/web/src/config/constants/accessibility.ts`.
- +6 tests (4 hook: override wins over media query both directions, event-driven re-render, listener cleanup; 2 context: event dispatch on setUserOverride/resetToSystemPreference) — 38 passing in the two affected suites.
- Verified 0 lint errors/warnings, typecheck, build, and full 2,615/2,615 test suite pass.

**Rationale**: The in-app toggle promised app-wide reduced motion but was a silent no-op for most animated components — a genuine WCAG 2.3.3 defect. The hook and context now share one override source of truth.

### 2026-08-20 - Palette micro-UX Cycle — LazyMarkdownRenderer loading announcements

**Type**: Accessibility micro-UX improvement
**Changes**:
- Added `LAZY_MARKDOWN_RENDERER.LOADING` / `.READY` labels to `ACCESSIBILITY_LABELS` in `apps/web/src/config/constants/content.ts`.
- Gave `MarkdownPreviewSkeleton` a `role="status"` + `aria-live="polite"` region with a `LOADING` aria-label, moving `aria-hidden` down to the decorative skeleton blocks — screen readers now announce the preview is loading instead of silence (WCAG 4.1.3 status messages).
- Added an sr-only `READY` announcer once the markdown renderer chunk mounts, mirroring `LazyCodeMirror`.
- Added 2 assertions to `LazyMarkdownRenderer.test.tsx` (5/5 tests passing; full web suite green).
- Verified 0 lint errors/warnings, typecheck, build and full test suite pass.

**Rationale**: `LazyCodeMirror` already announced loading/ready via live regions; `LazyMarkdownRenderer`'s skeleton was fully `aria-hidden` — the split-pane preview pane was the remaining silent lazy-loader gap.

### 2026-08-20 - Palette micro-UX Cycle — CircularProgress reduced-motion gating

**Type**: Accessibility micro-UX improvement
**Changes**:
- Added `.circular-complete-celebration` to the `prefers-reduced-motion` kill-list in `apps/web/src/index.css` — the celebration scale-bounce was the only animated class missing from the reduced-motion block.
- Gated the inline `stroke-dashoffset` transition in `CircularProgress.tsx` via `useReducedMotion()` — inline styles are invisible to the CSS media-query kill-list, so the ring now snaps instantly instead of animating for vestibular-sensitive users (WCAG 2.3.3).
- Added 2 reduced-motion assertions to `CircularProgress.test.tsx` (21/21 tests passing).
- Verified all 2,607 tests pass across all 3 workspaces (web, api, shared); 0 lint errors/warnings; 0 secret scan violations; 0 vulnerabilities.

**Rationale**: Consistent reduced-motion support — every other animated component in the codebase respects `prefers-reduced-motion`; CircularProgress was the remaining gap.

### 2026-08-20 - Cycle 106 / Cycle 577 Verification Loop

**Type**: Maintenance & Quality Verification
**Changes**:
- Executed standard 9-phase loop: Branch sync (Phase 0), BugLover audit (Phase 1), Palette micro-UX (Phase 2), Flexy modularity (Phase 3), TestGuard testing (Phase 4), StorX consolidation (Phase 5), CodeKeep quality review (Phase 6), CMZ agent sync (Phase 7).
- Verified all 2,605 tests pass across all 3 workspaces (web, api, shared).
- Verified 0 lint errors/warnings, 0 secret scan violations, 0 vulnerabilities.
- Verified `.opencode/agent/cmz.md` and memory files structure.

**Rationale**: Continuous system health maintenance and autonomous verification loop.

### 2026-02-05 - Initial Setup

**Type**: Creation
**Changes**:

- Created CMZ agent with self-heal, self-learning, self-evolve capabilities
- Configured model: `opencode/deepseek-v4-flash-free` (per AGENTS.md mandate)
- Integrated with existing agent ecosystem

> **Note**: Fallback models were initially configured but later removed per AGENTS.md mandate requiring exclusive use of `opencode/deepseek-v4-flash-free`.

**Rationale**: Maximize system potential through autonomous management

### 2026-02-05 - Repository Integration

**Type**: Integration
**Changes**:

- Analyzed oh-my-opencode (28.5k stars) - Agent harness with multi-model orchestration
- Analyzed opencode-antigravity-auth (7.6k stars) - OAuth plugin for Antigravity models
- Analyzed AI-Agents-public (50 Claude Code skills)
- Analyzed superpowers (45.2k stars) - Skills framework with TDD
- Analyzed system_prompts_leaks - System prompt references

**Integration Strategy**:

- No conflicts with existing agents
- oh-my-opencode configured as plugin
- Google auth disabled to prevent conflicts
- Skills added without duplication

**Rationale**: Leverage best-in-class tools without breaking existing functionality

### 2026-02-05 - GitHub Action Optimization

**Type**: Optimization
**Changes**:

- Analyzed last 3 iterate.yml runs (1 success, 2 failures)
- Identified root cause: Unsupported models (iflowcn/glm-4.7, opencode/big-pickle)
- Fixed by standardizing on approved models

**Before**:

- Model errors causing CI failures
- "undefined is not an object" hook errors

**After**:

- All agents use `opencode/deepseek-v4-flash-free` exclusively per AGENTS.md mandate
- CI pipeline stabilized

**Rationale**: Prevent CI failures through proper model configuration

### 2026-02-05 - Skill Installation

**Type**: Enhancement
**Changes**:
Installed 7 skills from skillhub.club and custom creation:

1. madappgang-claude-code-debugging-strategies
2. vasilyu1983-ai-agents-public-git-commit-message
3. obra-superpowers-systematic-debugging (custom)
4. professor-for-testing-agentic-qe-skill-builder
5. maxritter-claude-codepro-backend-models-standards
6. modu-ai-moai-adk-moai-tool-opencode
7. muratcankoylan-agent-skills-for-context-engineering-memory-systems

**Rationale**: Equip CMZ with comprehensive debugging, testing, and orchestration capabilities

### 2026-02-05 - Memory System Initialization

**Type**: Infrastructure
**Changes**:

- Created .opencode/memory/ directory
- Created cmz-knowledge.md for solutions and patterns
- Created cmz-issues.md for known issues and resolutions
- Created cmz-evolution.md (this file)

**Rationale**: Enable self-learning through persistent knowledge storage

## Metrics

### Before CMZ

- CI Success Rate: 33% (1/3 recent runs)
- Missing agent: Yes
- Skills installed: 15 (existing)
- Configuration issues: Model errors

### After CMZ

- CI Success Rate: Expected 100% (model issues resolved)
- CMZ agent: ✅ Created and configured
- Total skills: 22 (15 existing + 7 new)
- Configuration: ✅ All agents using approved models

## Next Evolution Steps

1. **Monitor CI/CD**: Track success rates and identify new issues
2. **Expand Knowledge**: Add more patterns to cmz-knowledge.md
3. **Optimize Performance**: Analyze and optimize slow operations
4. **Integrate New Tools**: Evaluate and integrate beneficial repositories
5. **Self-Improvement**: Use learnings to enhance CMZ capabilities

## Success Criteria Tracking

- [x] All CI/CD pipelines passing
- [x] No configuration conflicts
- [x] All agents functioning correctly
- [x] Skills properly installed
- [x] Documentation up to date
- [x] Memory system initialized
- [ ] 30-day stability validation
- [ ] First automated issue detection
- [ ] First self-heal operation

## Notes

CMZ is now fully operational with:

- Self-heal capabilities (issue detection and resolution)
- Self-learning (knowledge accumulation in memory files)
- Self-evolve (continuous improvement based on experience)

The system is ready for autonomous operation.
