# AI Agent Engineer - Long-term Memory

> My personal knowledge base and learnings from agent infrastructure maintenance.

## Overview

I am the **AI Agent System Engineer** responsible for maintaining and improving the AI agent infrastructure within `.opencode/`. My domain includes agent definitions, skills, commands, and the overall agent ecosystem.

## Key Responsibilities

1. **Agent Definition Maintenance**: Create, update, and improve agent definitions in `.opencode/agent/`
2. **Skill Development**: Design and implement reusable skills in `.opencode/skill/`
3. **System Consistency**: Ensure all agents follow established patterns and conventions
4. **Documentation**: Update agent-related documentation in `docs/ai-agent-*.md`
5. **Quality Assurance**: Verify agent configurations are valid and follow best practices

## Standards & Requirements

### Model Mandate (CRITICAL)

- **ALL** agents MUST use `opencode/glm-4.7-free` exclusively
- This applies to:
  - Agent definitions (`.opencode/agent/*.md`)
  - GitHub Actions workflows (`.github/workflows/*.yml`)
  - opencode.json configuration
- Any deviation from this standard is a violation and must be fixed

### Git Workflow

- Work on branch: `agent/ai-agent-engineer`
- Commit messages follow Conventional Commits: `feat(agents):`, `fix(agents):`, `docs(agents):`

### Agent Definition Structure

All agents must include:

- YAML frontmatter with: description, mode, model, temperature, tools, permission
- IDENTITY section
- SYSTEM MEMORY & STANDARDS section with "Planning & Skill Usage (MANDATORY)"
- OPERATIONAL WORKFLOW section
- CONSTRAINTS & LIMITS section
- SUCCESS CRITERIA section

### 2026-02-26 - Section Heading Standardization

**Issue**: Agent definitions had inconsistent section headings:

| File               | Issue                                    | Corrected To              |
| ------------------ | ---------------------------------------- | ------------------------ |
| software-architect.md | `# HARD CONSTRAINTS` (non-standard)    | `# CONSTRAINTS & LIMITS` |
| cmz.md             | `#RH|# SYSTEM MEMORY & STANDARDS` (prefix) | `# SYSTEM MEMORY & STANDARDS` |
| cmz.md             | `#RQ|# CONSTRAINTS & LIMITS` (prefix)   | `# CONSTRAINTS & LIMITS` |

**Action Taken**: Removed non-standard prefixes and fixed heading names to match PATTERNS.md.

**Verification**:

- All 28 agents now have consistent `# CONSTRAINTS & LIMITS`
- All 28 agents now have consistent `# SYSTEM MEMORY & STANDARDS`
- Pattern: Agents must use exact heading names per PATTERNS.md (no custom prefixes)
### 2026-02-26 - Workflow Model Re-standardization + CMZ Agent Fix

**Issue**: GitHub Actions workflow files and cmz.md agent had inconsistencies:

| File             | Previous Model(s)                               | Corrected To            |
| ---------------- | ----------------------------------------------- | ----------------------- |
| main.yml         | `iflowcn/glm-4.6`, `opencode/minimax-m2.1-free` | `opencode/glm-4.7-free` |
| iterate.yml      | `opencode/kimi-k2.5-free`                       | `opencode/glm-4.7-free` |
| pr-gatekeeper.yml | `opencode/big-pickle`                           | `opencode/glm-4.7-free` |
| on-pull.yml      | `opencode/kimi-k2.5-free`                       | `opencode/glm-4.7-free` |
| parallel.yml     | `opencode/minimax-m2.5-free`                    | `opencode/glm-4.7-free` |
| cmz.md           | `#BQ|---` (broken YAML prefix), `#TQ|##` headings | Fixed proper YAML and headings |

**Action Taken**: 
1. Updated all workflow files to use `opencode/glm-4.7-free` consistently (22 references across 5 files)
2. Fixed cmz.md YAML frontmatter - removed `#BQ|` prefix from `---` delimiters
3. Fixed cmz.md section headings - removed `#XX|#` prefixes from headings like `## Planning & Skill Usage`

**Verification**:

- All 22 model references across 5 workflow files now use `opencode/glm-4.7-free`
- cmz.md YAML frontmatter is valid (no malformed prefixes)
- cmz.md section headings follow PATTERNS.md standard (no `#XX|#` prefixes)
- All 28 agents have consistent structure

---


## Historical Findings

### 2026-02-25 - Workflow Model Standardization

**Issue**: GitHub Actions workflow files used inconsistent models not matching the AGENTS.md mandate:

| Workflow          | Previous Model(s)                               | Corrected To            |
| ----------------- | ----------------------------------------------- | ----------------------- |
| main.yml          | `iflowcn/glm-4.6`, `opencode/minimax-m2.1-free` | `opencode/glm-4.7-free` |
| iterate.yml       | `opencode/kimi-k2.5-free`                       | `opencode/glm-4.7-free` |
| pr-gatekeeper.yml | `opencode/big-pickle`                           | `opencode/glm-4.7-free` |
| on-pull.yml       | `opencode/kimi-k2.5-free`                       | `opencode/glm-4.7-free` |
| parallel.yml      | `opencode/minimax-m2.5-free`                    | `opencode/glm-4.7-free` |

**Action Taken**: Updated all workflow files to use `opencode/glm-4.7-free` consistently.

**Verification**:

- All 22 model references across 5 workflow files now use `opencode/glm-4.7-free`

### 2026-02-20 - CMZ Agent Standardization

**Issue**: CMZ agent definition was missing the "Planning & Skill Usage (MANDATORY)" section.

**Action Taken**: Added the required section to ensure consistency with other agents.

## Agent Inventory

Total agents: **28**

All agents verified to use `opencode/glm-4.7-free` model:

1. ai-agent-engineer (self)
2. api-specialist
3. backend-engineer
4. code-reviewer
5. coder
6. cmz
7. database-architect
8. debugger
9. devops-engineer
10. dx-engineer
11. frontend-engineer
12. integration-engineer
13. integrator
14. janitor
15. modularity-engineer
16. performance-engineer
17. planner
18. product-strategist
19. quality-assurance
20. reliability-engineer
21. researcher
22. security-engineer
23. software-architect
24. synthesizer
25. system-improver
26. technical-writer
27. ui-ux-engineer
28. user-story-engineer

## Validation Checklist

When reviewing agent definitions, verify:

- [ ] Model is `opencode/glm-4.7-free`
- [ ] Temperature is in range 0.0-1.0
- [ ] Has "Planning & Skill Usage (MANDATORY)" section
- [ ] Has IDENTITY section
- [ ] Has OPERATIONAL WORKFLOW section
- [ ] Has CONSTRAINTS & LIMITS section
- [ ] Has SUCCESS CRITERIA section
- [ ] YAML frontmatter is valid

When reviewing workflow files, verify:

- [ ] All `--model` flags use `opencode/glm-4.7-free`
- [ ] Runner is `ubuntu-24.04-arm`
- [ ] Uses actions/checkout@v5

## Common Issues to Watch For

1. **Model Inconsistency**: Workflow files may use different models than agent definitions
2. **Missing Sections**: New agents may be missing required sections
3. **Temperature Values**: Some agents may have invalid temperature values
4. **Permission Issues**: Bash permissions may be misconfigured

## Notes

- I run on a 6-hour schedule via GitHub Actions (workflow_dispatch also available)
- I focus on small, atomic improvements to the agent infrastructure
- I do NOT implement user-facing features - only agent infrastructure
- I maintain backward compatibility with existing configurations

---

Last updated: 2026-02-26
