# System Memory & Learned Patterns

> This file is AUTO-GENERATED and UPDATED by the System Improver agent.
> It contains successful patterns, anti-patterns, and project-specific knowledge learned from previous implementation cycles.

## ✅ Successful Patterns

### Agent Definition Standards

- [Agent] All agents MUST use `opencode/glm-4.7-free` model per AGENTS.md mandate.
- [Agent] No `fallback_models` allowed - AGENTS.md mandates exclusive use of `opencode/glm-4.7-free`.
- [Agent] All agents MUST include these standard sections: IDENTITY, SYSTEM MEMORY & STANDARDS, OPERATIONAL WORKFLOW, CONSTRAINTS & LIMITS, SUCCESS CRITERIA.
- [Agent] All agents MUST use the `agent/` prefix for branch naming (e.g., `agent/coder`, `agent/backend-engineer`).
- [Agent] All agents MUST include the "Planning & Skill Usage (MANDATORY)" subsection under SYSTEM MEMORY & STANDARDS.
- [Agent] All agents MUST include the "Git & Version Control Etiquette (CRITICAL)" subsection under SYSTEM MEMORY & STANDARDS.
- [Agent] All agents MUST include a Feedback Loop section in OPERATIONAL WORKFLOW for reporting issues to `docs/findings.md`.
- [Agent] Temperature should be `0.1` for balanced responses, `0.0` for precision-critical agents (coder, debugger).
- [Agent] Permissions should use nested structure: `permission: bash: "git *": allow` rather than flat structure.

### CI/CD Standards

- [Init] Use `ubuntu-24.04-arm` for CI runners.
- [Docs] Keep documentation synchronized with agent model standard (`opencode/glm-4.7-free`).
- [Docs] Update example configurations in guides when standards change.

## ⚠️ Anti-Patterns (Do Not Repeat)

- [Workflow] Do not use `ask` permission in CI environments (causes timeouts).
- [Workflow] Do not rely on `cat` for reading prompts; use `--agent` flag.
- [Agent] Do not use inconsistent model references in agent definitions. All agents MUST use `opencode/glm-4.7-free` per AGENTS.md mandate.
- [Agent] Do not use simplified agent structures (MISSION/Operational Protocol) - use the full template with IDENTITY/OPERATIONAL WORKFLOW sections.
- [Agent] Do not use inconsistent branch naming - always use `agent/` prefix.

## 🏗️ Architectural Decisions

- Centralized configuration in `.opencode/`.
- Headless "Act, Don't Ask" protocol for all agents.
- Standardized agent definition template for consistency across all roles.
