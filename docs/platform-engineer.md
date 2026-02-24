# Platform Engineer - Long-term Memory

## Overview

This document tracks platform-engineer domain work for the blueprintify project.

## Domain Scope

- GitHub Actions workflows maintenance
- CI/CD infrastructure improvements
- DevOps and developer tooling
- Repository configuration

## Active Issue

- **#885**: Standardize actions/checkout to v5 across all workflows

## History

- 2026-02-24: Initial setup - Issue #885 identified (standardize checkout actions to v5)

## Workflow Files Status

| File              | Status                           |
| ----------------- | -------------------------------- |
| main.yml          | ✅ v5 (OK)                       |
| iterate.yml       | ✅ v5 (OK)                       |
| pr-gatekeeper.yml | ✅ v5 (Upgraded)                 |
| on-pull.yml       | ✅ v5 (Upgraded)                 |
| parallel.yml      | ✅ v5 (Upgraded - 4 occurrences) |

## Notes

- Use `platform-engineer` label for PRs in this domain
- Always verify CI/CD runs after workflow changes
- Keep changes atomic and focused
