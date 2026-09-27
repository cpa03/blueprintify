---
# Universal Command Template
# Compatible with: OpenCode, Claude Code, Cursor, Continue, Custom agents
# Usage: Copy this template, fill in fields, save as {name}.command.yaml

name: "" # Required: unique identifier (kebab-case)
display_name: "" # Required: human-readable name
description: "" # Required: one-line description
version: "1.0.0" # Semantic version
author: "" # Author/organization
license: "MIT" # License

# Command type
type: "shell" # "shell", "script", "builtin", "alias"

# Execution
entrypoint: "" # Path to script, or shell command
working_dir: "{project_root}" # Working directory (supports {project_root}, {workspace}, {home})
shell: "bash" # Shell to use: "bash", "zsh", "sh", "powershell"

# Arguments
arguments:
  - name: "" # Argument name
    type: "string" # "string", "number", "boolean", "array"
    description: ""
    required: false
    default: null
    position: 0 # Position for positional args (0-indexed)

# Environment variables
env:
  # VAR_NAME: "default_value"
  # Supports: {project_root}, {workspace}, {home}, {agent_dir}

# Permissions
permissions:
  bash:
    allow: []
    deny: []

# Output
output:
  format: "text" # "text", "json", "yaml", "markdown"
  capture: true # Capture stdout/stderr

# Documentation
usage: |
  # Usage

  ```bash
  command-name [options] <arguments>
  ```

  ## Options

  - `--option` - Description

  ## Examples

  ```bash
  command-name --option value arg1 arg2
  ```
---

#!/usr/bin/env bash

# {display_name} - {description}

# Auto-generated from universal command template

set -euo pipefail

# Script implementation here

echo "Command not implemented"
