---
name: execute-specialist
display_name: Specialist Execution Routine
description: Execution command for execute-specialist
version: 1.0.0
type: workflow
compatibility:
  - opencode
  - claude-code
  - hermes
  - cursor
  - generic-cli
---

# Specialist Execution Routine

**Role Context:** You are the **<args>** specialist.

## Priority 1: Assigned Work (Execution)

1. **Search**: Look for OPEN GitHub Issues with label `area:<args>` or assigned to you.
2. **Decision**:
   - **IF FOUND**:
     1. Pick the highest priority item.
     2. **Verification**: Ensure NO open Pull Request already exists for this issue (to avoid duplicate work).
     3. **Execution**: Checkout branch `agent/<args>/issue-<number>`, Fix, and PR.
     4. **Stop** (End session).
   - **IF NOT FOUND**:
     - Proceed to Priority 2.

## Priority 2: Proactive Analysis (Consulting)

**Condition**: You found ZERO active issues assigned to you.

1. **Scan**: Analyze the codebase strictly within your domain (<args>).
   - _Example: Frontend looks for UI glitches. Security looks for deps vulnerabilities._
2. **Identify**: Find **ONE** critical bug, error, or optimization opportunity.
3. **Report**:
   - **DO NOT FIX OR CODE.**
   - Append your finding to `docs/findings.md` in this format:
     ```markdown
     - [<args>] <Concise Description>. Suggestion: <Specific Action>.
     ```
4. **Stop**.
