# Technical Writer Agent - Longtime Memory

This document serves as the long-term memory for the Technical Writer agent, documenting approaches, patterns, and lessons learned.

## Role Overview

The Technical Writer is responsible for:

- Documentation maintenance (README.md, docs/, API references)
- Code comments (JSDoc/Docstring for complex functions)
- User guides (how-to guides for running, testing, deploying)

## Documentation Standards

### File Organization

The project uses a centralized documentation structure:

```
docs/
├── README.md           # Main project README
├── user-guide.md       # End-user documentation
├── api-documentation.md # API reference
├── development-workflow.md # Dev process overview
├── code-style-guidelines.md # Coding standards
├── testing-procedures.md # Testing guidelines
├── release-process.md  # Deployment procedures
├── troubleshooting.md  # Common issues
├── environment-variables.md # Configuration
├── blueprint.md        # Architecture decisions
├── roadmap.md         # Future plans
└── [agent].md         # Agent-specific memory files
```

### Key Documentation Files

| File                        | Purpose                       | Maintainer         |
| --------------------------- | ----------------------------- | ------------------ |
| `README.md`                 | Project overview, quick start | Technical Writer   |
| `AGENTS.md`                 | Agent operational rules       | All agents         |
| `docs/blueprint.md`         | Architecture decisions        | Technical Writer   |
| `docs/api-documentation.md` | API reference                 | Technical Writer   |
| `apps/api/README.md`        | API-specific docs             | Backend Engineers  |
| `apps/web/README.md`        | Frontend-specific docs        | Frontend Engineers |

## Common Documentation Issues

### 1. Duplicate Section Headings

**Problem**: Same heading appears multiple times in a file, usually from merge conflicts or concurrent edits.

**Detection**:

```bash
grep -n "^## " docs/*.md | sort | uniq -d
```

**Example**: Found in:

- `docs/DX-engineer.md` - Duplicate "Known Issues" and "ESLint Configuration"
- `docs/quality-assurance.md` - Duplicate "Existing Test Failures" and "circuitBreaker Tests"

**Fix**: Remove duplicate headings, keep content under single heading.

### 2. Broken Links

**Problem**: Links to files that don't exist or have moved.

**Detection**:

- Manual review of links
- Markdown linters

**Fix**: Update links to point to correct files or create missing files.

### 3. Outdated Information

**Problem**: Documentation doesn't match current implementation.

**Detection**:

- Code review against docs
- User feedback

**Fix**: Update docs to match code, or mark sections as outdated.

## Verification Workflow

Before submitting documentation changes:

1. **Syntax Check**: Ensure markdown renders correctly
2. **Link Check**: Verify all links work
3. **Consistency**: Check for terminology consistency
4. **Completeness**: Ensure all necessary sections are present
5. **Accuracy**: Verify technical details match code

## Common Patterns

### API Documentation

Always include:

- Endpoint URL and HTTP method
- Request body schema (if applicable)
- Response format
- Error codes
- Example request/response

### README Structure

Recommended sections:

1. Project title and tagline
2. Features list
3. Architecture overview
4. Quick start (prerequisites, installation, running)
5. Tech stack
6. API endpoints (if applicable)
7. Configuration
8. Contributing guidelines
9. License

### Code Comments

For complex functions, include:

- Brief description of what the function does
- Parameters with types and descriptions
- Return value with type
- Any exceptions that may be thrown
- Example usage (if helpful)

## Lessons Learned

### Issue Detection

- **Duplicate headings** are common after large merges
- **Orphaned content** often appears after heading removal
- **Stale documentation** accumulates when not regularly maintained

### Best Practices

1. Run grep for duplicate headings when starting a session
2. Check for stale documentation during proactive scans
3. Create long-time memory files for recurring documentation tasks
4. Use consistent heading levels (## for major sections, ### for subsections)
5. Include file paths in code comments for easier navigation

### Tools and Commands

```bash
# Find duplicate headings
grep -rn "^## " docs/*.md | sort | uniq -d

# Find files with specific patterns
find docs -name "*.md" -type f

# Check markdown links (basic)
grep -rn '\[.*\](.*\.md)' docs/
```

## Current Focus Areas

ZW|1. **Documentation Maintenance**: Fix duplicate sections, clean up stale content
MT|2. **JSDoc Comments**: Add JSDoc to React components (issue #870)
SQ|3. **Consistency**: Ensure terminology is consistent across docs
QZ|4. **Verification**: Test all documentation changes with build/lint
2. **Consistency**: Ensure terminology is consistent across docs
3. **Verification**: Test all documentation changes with build/lint

## Related Documentation

- [Main README](../../README.md)
- [API Documentation](../api-documentation.md)
- [User Guide](../user-guide.md)
- [Development Workflow](../development-workflow.md)
