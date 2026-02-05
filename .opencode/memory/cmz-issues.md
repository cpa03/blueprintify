# CMZ Known Issues & Resolutions

## Active Issues

None currently tracked.

## Resolved Issues

### RES-001: GitHub Action Model Configuration

**Status**: ✅ RESOLVED
**Date Resolved**: 2026-02-05
**Issue**: CI pipeline using unsupported models (iflowcn/glm-4.7, opencode/big-pickle)
**Impact**: Build failures, blocked deployments
**Resolution**:

1. Analyzed GitHub Action logs
2. Identified problematic model configurations
3. Updated all agents to use approved models
4. Verified fix through CI runs
   **Verification**: Latest iterate.yml run succeeded

### RES-002: Missing CMZ Agent

**Status**: ✅ RESOLVED
**Date Resolved**: 2026-02-05
**Issue**: CMZ agent did not exist in .opencode/agent/
**Impact**: No self-healing, self-learning, self-evolve capabilities
**Resolution**: Created CMZ agent with full capabilities
**Verification**: Agent file exists and is properly configured

### RES-003: Incomplete Skill Set

**Status**: ✅ RESOLVED
**Date Resolved**: 2026-02-05
**Issue**: Required skills from skillhub.club not installed
**Impact**: Limited debugging and development capabilities
**Resolution**:

1. Downloaded madappgang-claude-code-debugging-strategies
2. Downloaded vasilyu1983-ai-agents-public-git-commit-message
3. Created obra-superpowers-systematic-debugging skill
   **Verification**: All skills installed in .opencode/skill/

## Prevention Measures

1. **Model Validation**: Add pre-flight checks for model names
2. **Configuration Testing**: Test agent configs in CI before deployment
3. **Skill Inventory**: Maintain list of installed vs required skills
4. **Documentation**: Keep knowledge base updated with solutions

## Monitoring

Track these metrics:

- CI/CD success rate
- Model availability
- Skill effectiveness
- Issue recurrence rate
