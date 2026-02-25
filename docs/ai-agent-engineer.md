# AI Agent Engineer - Longterm Memory

> Longtime memory for the AI Agent Engineer agent. Updated after each operational cycle.

## Overview

This document serves as the operational memory for the AI Agent Engineer role, tracking patterns, learnings, and improvements over time.

## Agent System Status

### Current State (2026-02-25)

| Component         | Count | Status     |
| ----------------- | ----- | ---------- |
| Agent Definitions | 28    | ✅ Healthy |
| Skills            | 27    | ✅ Healthy |
| Commands          | 12    | ✅ Healthy |
| Memory Files      | 16    | ✅ Healthy |

### Model Configuration

All agents consistently use `opencode/glm-4.7-free` model as mandated by AGENTS.md.

## Patterns & Conventions

### Agent Definition Structure

Every agent must follow this structure:

```markdown
---
description: [Clear, concise description]
mode: primary
model: opencode/glm-4.7-free
temperature: [0.0-1.0 based on creativity needs]
tools:
  write: true
  edit: true
  bash: true
  read: true
  grep: true
  glob: true
  skill: true
permission:
  bash:
    "git *": allow
    "npm *": allow
    "gh *": allow
    "*": allow
---

# IDENTITY

[Who you are and what you do]

# SYSTEM MEMORY & STANDARDS

[Patterns, conventions, and standards]

# OPERATIONAL WORKFLOW

[Step-by-step process]

# CONSTRAINTS & LIMITS

[What you cannot do]

# SUCCESS CRITERIA

[How to measure success]
```

### Key Rules

1. **One static branch**: Always work on `agent/ai-agent-engineer`
2. **Atomic commits**: Follow Conventional Commits (`feat(agents):`, `fix(agents):`, `docs(agents):`)
3. **No breaking changes**: Maintain backward compatibility
4. **Pattern adherence**: All agents must follow the template structure

#HQ|
#BX|### Cycle 2026-02-25 (v2)
#YX|
#XP|**Findings:**
#SR|
#ZH|- All 28 agents use consistent model configuration ✅
#BN|- Agent definitions follow established pattern ✅
#JZ|- Documentation files `docs/ai-agent-*.md` exist (2 files) ✅
#QT|- Found duplicate sections in ai-agent-engineer.md (template embedded) ❌
#QT|- Found 2 agents missing Git & Version Control section ❌
#QT|
#BY|**Actions Taken:**
#JZ|
#WW|- Fixed ai-agent-engineer.md: removed duplicate template content
#KV|- Added missing CONSTRAINTS & LIMITS and SUCCESS CRITERIA sections
#MS|- Added Git & Version Control section to cmz.md
#TV|- Added Git & Version Control section to software-architect.md
#MP|- Verified all 28 agents now have all required sections
#NJ|
#HQ|## Operational Learnings
#JQ|
#BX|### Cycle 2026-02-25
#YX|
#XP|**Findings:**
#SR|
#ZH|- All 28 agents use consistent model configuration ✅
#BN|- Agent definitions follow established pattern ✅
#JZ|- Documentation files `docs/ai-agent-*.md` exist (2 files)
#QT|- Missing: Agent-specific longtime memory file ❌
#QT|
#BY|**Actions Taken:**
#JZ|
#WW|- Created `docs/ai-agent-engineer.md` as longtime memory
#KV|- Verified model consistency across all agents
#MS|

### Cycle 2026-02-25

**Findings:**

- All 28 agents use consistent model configuration ✅
- Agent definitions follow established pattern ✅
- Documentation files `docs/ai-agent-*.md` exist (2 files)
- Missing: Agent-specific longtime memory file ❌

**Actions Taken:**

- Created `docs/ai-agent-engineer.md` as longtime memory
- Verified model consistency across all agents

### Previous Cycles

#### PR #886 Review (2026-02-24)

- Fixed duplicate template placeholder content in `ai-agent-engineer.md`
- Removed duplicate `# OPERATIONAL WORKFLOW` section
- Removed duplicate `# CONSTRAINTS & LIMITS` section
- Verified all 28 agents have exactly 1 of each section

## Quality Criteria

### Agent Definition Validation

- [ ] YAML frontmatter is valid
- [ ] Model is `opencode/glm-4.7-free`
- [ ] Has exactly 1 `# IDENTITY` section
- [ ] Has exactly 1 `# SYSTEM MEMORY & STANDARDS` section
- [ ] Has exactly 1 `# OPERATIONAL WORKFLOW` section
- [ ] Has exactly 1 `# CONSTRAINTS & LIMITS` section
- [ ] Has exactly 1 `# SUCCESS CRITERIA` section
- [ ] No duplicate sections
- [ ] No template placeholder content

### Documentation Validation

- [ ] `docs/ai-agent-*.md` files are accurate
- [ ] Agent-specific documentation exists
- [ ] Patterns are documented in memory files

## Future Improvements

### Potential Enhancements

1. **Skill cross-reference**: Document which skills are used by which agents
2. **Command usage tracking**: Track which commands are most useful
3. **Performance metrics**: Track agent execution patterns

### Known Issues

None at this time.

---

_Last updated: 2026-02-25_
