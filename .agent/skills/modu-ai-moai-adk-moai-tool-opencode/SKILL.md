---
name: modu-ai-moai-adk-moai-tool-opencode
description: Multi-agent orchestration using MoAI framework for complex task coordination. Use when orchestrating multiple agents or building multi-agent workflows.
---

# MoAI ADK - Multi-agent Orchestration Interface

## Purpose

Orchestrate multiple AI agents for complex tasks using the MoAI framework.

## Core Concepts

### Agent Roles

- **Planner**: Breaks down complex tasks
- **Executor**: Performs specific actions
- **Reviewer**: Validates outputs
- **Integrator**: Combines results

### Workflow Orchestration

1. Task decomposition
2. Agent assignment
3. Parallel execution
4. Result aggregation
5. Quality verification

## MoAI Tool Integration

### Tools Available

- Task dispatch
- Context sharing
- Result aggregation
- Conflict resolution

### Usage Patterns

#### Pattern 1: Sequential Pipeline

```
Input → Agent A → Agent B → Agent C → Output
```

#### Pattern 2: Parallel Processing

```
        ┌→ Agent A →┐
Input → ├→ Agent B →┼→ Integrator → Output
        └→ Agent C →┘
```

#### Pattern 3: Review Loop

```
Input → Executor → Reviewer → (Approved → Output)
                          └→ (Rejected → Executor)
```

## Best Practices

1. **Clear Interfaces**: Define inputs/outputs for each agent
2. **Context Management**: Share relevant context between agents
3. **Error Handling**: Plan for agent failures
4. **Progress Tracking**: Monitor multi-agent workflows
5. **Result Verification**: Validate final outputs

## OpenCode Integration

Works seamlessly with OpenCode's subagent system:

- Use `subagent` tool for agent dispatch
- Leverage `skill` tool for capability loading
- Monitor with `todo` tool for task tracking

## Usage

Activate for:

- Complex feature development
- Multi-step refactoring
- Cross-domain tasks
- Quality assurance workflows
