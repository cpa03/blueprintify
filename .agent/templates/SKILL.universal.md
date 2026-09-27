---
# Universal Skill Template
# Compatible with: OpenCode, Claude Code, Cursor, Continue, Custom agents
# Usage: Copy this template, fill in fields, save as SKILL.md in a skill directory

name: "" # Required: unique identifier (kebab-case)
display_name: "" # Required: human-readable name
description: "" # Required: trigger-oriented description
version: "1.0.0" # Semantic version
author: "" # Author/organization
license: "MIT" # License

# When should this skill be activated?
trigger:
  keywords: [] # Trigger keywords/phrases
  file_patterns: [] # Activate when touching these files
  task_types: [] # "debugging", "feature", "refactor", "review"
  auto_load: false # Load automatically or on-demand

# Prerequisites
requirements:
  tools: [] # Tools needed: ["bash", "write", "edit", "read"]
  binaries: [] # CLI tools needed: ["git", "npm", "gh"]
  language: "" # Target programming language (optional)
  framework: "" # Target framework (optional)

# Inputs/Parameters
parameters:
  - name: "" # Parameter name
    type: "string" # "string", "number", "boolean", "array", "object"
    description: ""
    required: false
    default: null

# Outputs
outputs:
  - name: "" # Output name
    type: ""
    description: ""

# Skill-specific configuration
config: {}
---

# {display_name}

{description}

## When to Use

Describe the exact scenarios when this skill should be applied.

## Prerequisites

What needs to be in place before using this skill.

## Procedure / Workflow

Step-by-step instructions.

1. Step 1...
2. Step 2...

## Best Practices

Key principles to follow.

## Anti-Patterns

What NOT to do.

## Examples

Concrete examples of using this skill.
