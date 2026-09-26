---
name: obra-superpowers-systematic-debugging
description: Systematic debugging approach with 4-phase root cause analysis. Use when troubleshooting complex bugs, identifying root causes, or following structured debugging methodology.
---

# Systematic Debugging Skill

## Overview

This skill provides a systematic approach to debugging based on the obra/superpowers framework.

## 4-Phase Root Cause Analysis

### Phase 1: Reproduction

- Create a minimal reproduction case
- Verify the issue is consistent
- Document exact steps to trigger
- Isolate variables

### Phase 2: Hypothesis Generation

- Brainstorm potential causes
- Consider recent changes
- Review error messages and stack traces
- Check configuration drift

### Phase 3: Testing

- Test each hypothesis systematically
- Use binary search to isolate the problem
- Check logs and metrics
- Validate assumptions

### Phase 4: Resolution

- Implement the fix
- Verify the fix resolves the issue
- Check for regressions
- Document the solution

## Defense in Depth

1. **Prevention**: Static analysis, type checking, tests
2. **Detection**: Logging, monitoring, alerting
3. **Containment**: Error boundaries, fallbacks
4. **Recovery**: Auto-restart, retry logic, circuit breakers

## Techniques

### Root Cause Tracing

- Follow the error chain backward
- Identify the first failure point
- Distinguish symptoms from causes

### Condition-Based Waiting

- Wait for specific conditions, not arbitrary time
- Use timeouts to prevent infinite waits
- Verify state before proceeding

## Usage

Apply this skill when:

- Debugging CI/CD failures
- Investigating production issues
- Analyzing test failures
- Troubleshooting configuration problems

## Integration

Works with CMZ self-heal protocol for automated issue detection and resolution.
