# AI Agent Engineering Knowledge Base

This document stores persistent knowledge for the AI Agent Engineer role.

## Key Concepts

### Agent Definition Structure

All agents in `.opencode/agent/` follow this structure:

```markdown
---
description: Agent Role Description
mode: primary
model: opencode/glm-4.7-free
temperature: 0.0-0.2
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

[Agent description and responsibilities]

# SYSTEM MEMORY & STANDARDS

[Planning, skill usage, and universal standards]

# OPERATIONAL WORKFLOW

[Step-by-step process for the agent]

# CONSTRAINTS & LIMITS

[Rules and boundaries for the agent]

# SUCCESS CRITERIA

[Metrics for successful completion]
```

### Skill Definition Structure

Skills in `.opencode/skill/` follow this structure:

```markdown
---
name: skill-name
description: Skill description
---

## Procedure

[Step-by-step instructions]

## Usage

[How to use the skill]
```

## Best Practices

### Agent Design

1. **Single Responsibility**: Each agent should have a clear, focused role
2. **Consistent Structure**: Follow the standard agent template
3. **Explicit Permissions**: Define what tools the agent can use
4. **Temperature Settings**: Use 0.0-0.2 for deterministic outputs, higher for creative tasks
5. **Model Mandate**: Always use `opencode/glm-4.7-free` as specified in AGENTS.md

### Skill Development

1. **Reusable**: Design skills to be used across multiple agents
2. **Well-Documented**: Provide clear usage instructions
3. **Atomic**: Each skill should do one thing well
4. **Composable**: Skills can be combined for complex workflows

### Documentation

1. **Keep Updated**: Update usage guides when adding new agents/skills
2. **Examples**: Include practical examples in documentation
3. **Cross-Reference**: Link related agents and skills

## Common Issues

### Missing YAML Front Matter

All agent files must have valid YAML front matter. Missing fields will cause errors.

### Inconsistent Model Configuration

All agents must use `opencode/glm-4.7-free`. Check AGENTS.md for the current model mandate.

### Branch Naming

Agents work on dedicated branches named `agent/[role-name]`. Always sync with main before starting.

## Resources

- Agent Definitions: `.opencode/agent/`
- Skill Definitions: `.opencode/skill/`
- Memory Files: `.opencode/memory/`
- Usage Guide: `docs/ai-agent-usage-guide.md`
- Setup Guide: `docs/ai-agent-setup-guide.md`
- Project Rules: `AGENTS.md`
