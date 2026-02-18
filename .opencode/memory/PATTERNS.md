# System Memory & Learned Patterns

> This file is AUTO-GENERATED and UPDATED by the System Improver agent.
> It contains successful patterns, anti-patterns, and project-specific knowledge learned from previous implementation cycles.

## ✅ Successful Patterns

- [Init] Use `opencode/glm-4.7-free` for all agent models.
- [Init] Use `ubuntu-24.04-arm` for CI runners.

## ⚠️ Anti-Patterns (Do Not Repeat)

- [Workflow] Do not use `ask` permission in CI environments (causes timeouts).
- [Workflow] Do not rely on `cat` for reading prompts; use `--agent` flag.
- [Agent] Do not use inconsistent model references in agent definitions. All agents MUST use `opencode/glm-4.7-free` per AGENTS.md mandate.

## 🏗️ Architectural Decisions

- Centralized configuration in `.opencode/`.
- Headless "Act, Don't Ask" protocol for all agents.
