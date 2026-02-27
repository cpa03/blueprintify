# Repository Rules

> Governance and compliance rules for Blueprintify repository contributors and automated agents.

## Code Submission Rules

### 1. Pull Request Requirements

- **All PRs must be linked to an issue** or have a clear justification in the description
- **Branch naming convention**: `type/scope-description` (e.g., `feat/split-pane-editor`, `fix/api-validation`)
- **Commit message format**: Follow Conventional Commits specification

  ```
  type(scope): subject

  [optional body]

  [optional footer]
  ```

### 2. Code Quality Standards

Before submitting a PR, ensure:

- [ ] **Build passes**: `npm run build`
- [ ] **TypeScript compiles**: `npm run typecheck`
- [ ] **Linting passes**: `npm run lint`
- [ ] **Tests pass**: `npm run test:api`
- [ ] **No console errors** in browser
- [ ] **No hardcoded secrets** or API keys

### 3. File and Scope Constraints

**ALLOWED**:

- Modifying files within the scope of your task
- Adding tests for new functionality
- Updating documentation to reflect changes
- Refactoring for clarity (with justification)

**PROHIBITED** (will be rejected by Repo Guardian):

- Adding files outside task scope
- Creating new folders without task approval
- Adding documentation without Architect approval
- Deleting files without confirming redundancy
- Large-scale refactoring mixed with feature work

### 4. Review Requirements

- All PRs require at least **1 approval** from a code owner
- **No self-merging** without explicit exception
- PRs must be **up-to-date with main** before merge
- All CI checks must pass

## Automated Agent Rules

### Agent Role Boundaries

| Agent              | Scope                            | Cannot Do             |
| ------------------ | -------------------------------- | --------------------- |
| Architect          | Task planning, priority setting  | Implementation        |
| Backend Engineer   | API routes, services, middleware | Frontend changes      |
| Frontend Engineer  | React components, UI logic       | API changes           |
| Database Architect | Schema, migrations               | Business logic        |
| DevOps Engineer    | CI/CD, infrastructure            | Application code      |
| Janitor            | Cleanup, organization            | Feature changes       |
| Security Engineer  | Security audits, fixes           | Non-security features |
| Technical Writer   | Documentation                    | Code changes          |

### Agent Workflow Constraints

1. **Never work outside assigned task scope**
2. **Always sync with main before starting work**
3. **Never create duplicate issues**
4. **Never merge without verification**
5. **Always run validation before completing task**
6. **Document all changes in commit messages**

### Agent-Generated Changes

When agents make automated changes:

- Changes must be **atomic and focused**
- Commit messages must follow convention: `chore(scope): description`
- No mixing of unrelated changes
- Failed validations must be fixed before completion
- Agents must not delete files without certainty

## Compliance Enforcement

### Repo Guardian Checks

All PRs are checked by Repo Guardian for:

1. **Scope compliance**: Files changed match task scope
2. **Documentation drift**: Docs updated to reflect code changes
3. **Pattern consistency**: Code follows established patterns
4. **No unauthorized additions**: No new files/folders without approval
5. **Build verification**: CI passes, no regressions

### Violation Consequences

| Violation           | Action                             |
| ------------------- | ---------------------------------- |
| Files outside scope | PR rejected with comment           |
| Missing tests       | Request changes                    |
| Lint errors         | Auto-fix attempted, then rejection |
| Breaking changes    | Request rollback + explanation     |
| Unauthorized docs   | Request Architect approval         |

## Documentation Standards

### Required Documentation

Every significant feature must include:

1. **Code comments** for complex logic
2. **README updates** for user-facing changes
3. **API documentation** for new endpoints
4. **Type definitions** for shared interfaces

### Documentation Locations

- User guides: `docs/user-guide.md`
- API docs: `docs/api-documentation.md`
- Architecture: `docs/blueprint.md`
- Tasks (entry point): `docs/task.md`
- Active Tasks: `docs/active-tasks.md`
- Completed Tasks: `docs/completed-tasks-YYYY-QX.md`
- Features: `docs/features.md`


## Task Lifecycle Management

This section defines how tasks are tracked, organized, and archived.

### Task States

Tasks move through the following states:

1. **Open** - New task, not yet started
2. **In Progress** - Actively being worked on
3. **Review** - Pull request created, pending review
4. **Done** - Merged and verified

### Task Organization

- **Active Tasks** (`docs/active-tasks.md`): Current work items
- **Completed Tasks** (`docs/completed-tasks-YYYY-QX.md`): Archived completed work
- **Main Task File** (`docs/task.md`): Entry point and references

### Archival Process

When a task is completed:

1. Task is marked as complete in the relevant section
2. At the end of each quarter, completed tasks are archived
3. Archive format: `completed-tasks-YYYY-QX.md`
4. The active-tasks.md is updated to remove archived items

### Technical Writer Responsibilities

- Maintain active-tasks.md with current priorities
- Quarterly archival of completed tasks
- Ensure task.md references are accurate
- Report task sprawl issues

### Task Sprawl Prevention

If `docs/task.md` exceeds 100 lines, the Technical Writer must:

1. Archive completed tasks to the quarterly file
2. Simplify active-tasks.md
3. Update task lifecycle documentation if needed

### Issue-Driven Tasks

For GitHub issues requiring documentation work:

1. Create issue with appropriate labels (`area:technical-writer`, `documentation`)
2. Technical Writer picks up issue based on priority
3. Changes committed to `agent/technical-writer` branch
4. PR created and linked to issue
5. Issue closed after PR merge

## Emergency Procedures

### Critical Bug Fix

1. Create issue with `P0` priority
2. Branch from main: `hotfix/description`
3. Minimal fix only
4. Fast-track review (1 approval)
5. Merge and deploy immediately

### Security Incident

1. Do NOT create public issue
2. Contact security team directly
3. Fix in private branch
4. Coordinate disclosure
5. Deploy fix before announcement

## Questions?

- Review existing issues and PRs for examples
- Consult AGENTS.md for agent-specific guidelines
- When in doubt, ask in PR comments or create a discussion
