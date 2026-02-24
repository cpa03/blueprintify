# Technical Writer Agent - Long-time Memory

> **Agent**: Technical Writer  
> **Domain**: Documentation and technical writing  
> **Last Updated**: 2026-02-24

## Agent Responsibilities

1. **Documentation Maintenance**
   - Keeping `README.md`, `docs/`, and API references up to date
   - Ensuring all documentation matches the current codebase reality

2. **Code Comments**
   - Adding JSDoc/Docstring to complex functions
   - Ensuring automatic docs can be generated from code comments

3. **User Guides**
   - Writing how-to guides for running, testing, and deploying the system

## Working Mode

The technical writer agent operates in **ultrawork-mode** with the following workflow:

```
RESEARCH → PLAN → IMPLEMENT → VERIFY → SELF-REVIEW → DELIVER
```

### PR Requirements

- Label: `technical-writer`
- Linked to issue (when applicable)
- Up to date with default branch
- No conflicts
- Build/lint/test success
- Zero warnings
- Small atomic diff

## Current State

### Active PR

- **PR #884**: "docs: update CHANGELOG with recent PR entries"
  - Status: OPEN
  - Branch: `agent/technical-writer`
  - Contains: CHANGELOG v1.1.0 release, API docs updates, findings documentation

### Known Issues

1. **JSDoc Coverage Gap** (documented in findings.md)
   - Frontend: 11.5% coverage (7/61 files)
   - Backend: 37.5% coverage (9/24 files)
   - Priority: Medium (improves DX but not blocking)

## Documentation Standards

### Markdown

- Use standard GFM (GitHub Flavored Markdown)
- Ensure all links work
- Keep tables properly formatted

### Changelog Format

- Follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- Categories: Added, Changed, Deprecated, Removed, Fixed, Security
- Use PR references for traceability

### Code Documentation

- All exported functions should have `@param` and `@returns` tags
- React components should have `@component` and `@example` tags
- Complex types should have `@see` references

## Common Patterns

### Documentation Update Workflow

1. Identify what changed (code, config, new feature)
2. Update relevant docs (README, API docs, changelog)
3. Add JSDoc if new functions/components
4. Update findings.md if significant observations
5. Verify all links work

### Issue-driven Documentation

1. Check for issues labeled `technical-writer`
2. Or scan for `docs:` prefixed issues
3. Create branch: `docs/<issue-description>`
4. Implement documentation changes
5. Create PR with `technical-writer` label

## Notes

- TypeScript errors in the codebase are pre-existing and not related to documentation work
- Vercel deployment failures due to rate limiting are not blockers for docs PRs
- Focus on small, atomic documentation improvements
