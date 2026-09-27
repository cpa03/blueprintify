---
name: build
display_name: Build Command
description: Execution command for build
version: 1.0.0
type: workflow
compatibility:
  - opencode
  - claude-code
  - hermes
  - cursor
  - generic-cli
---

# Build Command

Build the project and verify output.

## Usage

```
/build
```

## Execution

```bash
npm run build
```

## Context

`blueprint.md`

## Instructions

1. Run the build command
2. Check for any errors or warnings
3. Report bundle size if available
4. Suggest optimizations if build is large
