# CMZ Knowledge Base

## System Failures & Solutions

### Issue: Model Not Found (iflowcn/glm-4.7)

**Date**: 2026-02-05
**Detection**: GitHub Action logs showing ProviderModelNotFoundError
**Root Cause**: Using unsupported provider/model combination
**Solution**: Use only approved model:

- `opencode/glm-4.7-free` (exclusive per AGENTS.md mandate)
  **Prevention**: Validate model names in all agent configs

### Issue: Context Hooks Error (big-pickle)

**Date**: 2026-02-05
**Detection**: GitHub Action logs showing "undefined is not an object (evaluating 'context.hooks.on')"
**Root Cause**: Model incompatibility with OpenCode hooks system
**Solution**: Avoid opencode/big-pickle model
**Prevention**: Test models in CI before deployment

### Issue: GitHub Action Failures (iterate.yml)

**Date**: 2026-02-05
**Detection**: 2 out of 3 recent runs failed
**Pattern**: Model configuration errors
**Solution**:

1. Standardize on `opencode/glm-4.7-free` exclusively
2. Validate configuration before runs
   **Status**: Fixed via agent configuration updates

## Successful Patterns

### Pattern: Standardized Model Configuration

**When to use**: All agent configurations
**Implementation**:

- **Mandatory**: Use `opencode/glm-4.7-free` exclusively per AGENTS.md mandate
- **NO fallback models** - AGENTS.md mandates exclusive use of single model
- Validate all agent configurations use the correct model
  **Result**: Consistent behavior, reduced CI failures, compliance with project standards

### Pattern: Self-Healing CI/CD

**When to use**: Automated error detection and repair
**Implementation**:

1. Monitor GitHub Action logs
2. Detect model/provider errors
3. Validate and update configurations
4. Re-run failing workflows
   **Result**: Proactive issue resolution

### Pattern: Repository Integration

**When to use**: Adding external capabilities without conflicts
**Implementation**:

1. Analyze repository structure
2. Check for duplicate functionality
3. Integrate complementary features only
4. Maintain harmony
   **Examples**:

- oh-my-opencode: Plugin-based agent harness
- superpowers: Skills framework for systematic development
- AI-Agents-public: Curated prompts and skills

## Configuration Best Practices

### Agent Models

- Always use `opencode/glm-4.7-free` exclusively per AGENTS.md mandate
- **NO fallback models allowed** - AGENTS.md mandates exclusive use of `opencode/glm-4.7-free`
- Test in CI before production deployment

### Skill Installation

- Check for existing skills before installation
- Use standardized naming conventions
- Document skill purpose and usage

### Memory Management

- Store knowledge in .opencode/memory/
- Categorize by type (issues, patterns, solutions)
- Update after every significant operation
