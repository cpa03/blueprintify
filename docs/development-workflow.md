# Development Workflow

This document outlines the complete development workflow for the Blueprintify project, from idea to deployment.

## 🚀 Overview

The Blueprintify project follows an AI-driven development workflow that combines automated agent processes with human oversight. The workflow is designed to ensure consistency, quality, and rapid iteration.

## 📋 Workflow Phases

### 1. Planning & Architecture

#### Daily Architect Review (Every 6 hours)

- **Trigger**: Scheduled GitHub Actions workflow
- **Agent**: Architect
- **Process**:
  - Reviews `docs/blueprint.md`, `docs/roadmap.md`, `docs/bug.md`, `docs/feature.md`
  - Evaluates task priorities
  - Updates `docs/task.md` with OPEN/PRIORITY/ROLE/SCOPE
  - Creates/updates task assignments

#### Task Dispatch

- **Trigger**: After architect review
- **Agent**: Dispatcher
- **Process**:
  - Reads `docs/task.md`
  - Selects OPEN tasks with HIGH/MEDIUM priority
  - Creates `docs/dispatch.json` with unique role assignments
  - Ensures no duplicate role assignments

### 2. Development Execution

#### Parallel Development

- **Trigger**: After dispatch
- **Agents**: Various (based on role assignments)
- **Process**:
  - Each agent takes ONE OPEN task matching their role
  - Works within defined scope
  - Creates feature branch
  - Implements solution
  - Creates pull request
  - Updates task status to DONE
  - **Constraint**: Cannot add files/scope beyond task requirements

### 3. Quality Assurance

#### QA Gate

- **Trigger**: After development completion
- **Agent**: QA Engineer
- **Process**:
  - Reviews PR against `task.md` & `blueprint.md`
  - Adds tests if needed
  - Updates task with QA PASS/FAIL status

#### Security Gate

- **Trigger**: After development completion
- **Agent**: Security Engineer
- **Process**:
  - Audits HIGH/CRITICAL priority PRs
  - Validates against `blueprint.md`
  - Updates task with SECURITY PASS/FAIL status

#### Repository Guardian

- **Trigger**: After QA and Security
- **Agent**: Repo Guardian
- **Process**:
  - Reviews all PRs for compliance
  - **Rejects if**:
    - Files outside task scope
    - Added files/folders without task
    - Documentation added without Architect permission
  - Comments on rejections

### 4. Integration & Deployment

#### Merge Gate

- **Trigger**: After Repo Guardian approval
- **Agent**: Integrator
- **Process**:
  - Merges PRs one by one if all criteria met:
    - Has Task ID
    - QA PASS
    - SECURITY PASS (if applicable)
    - Repo Guardian OK
  - Comments on failed merges

#### Knowledge Review

- **Trigger**: After integration
- **Agent**: Knowledge Steward
- **Process**:
  - Reviews consistency of documentation with merged changes
  - Documents drift/recommendations in `docs/knowledge-review.md`
  - Does not make code changes

### 5. Monitoring & Maintenance

#### Reliability Scan

- **Trigger**: After knowledge review
- **Agent**: Reliability Engineer
- **Process**:
  - Scans logs, PRs, issues
  - Documents new bugs in `docs/bug.md`
  - Does not fix bugs (only documents)

## 🔧 Branch Strategy

### Branch Naming Conventions

```bash
# Feature branches for agent work
agent/[role-name]           # e.g., agent/technical-writer
docs/[documentation-name]   # e.g., docs/contributor-guide
fix/[issue-description]     # e.g., docs/ci-auth-issue

# Human contributors should use:
feature/[feature-name]      # e.g., feature/blueprint-wizard
bugfix/[issue-description]  # e.g., bugfix/api-timeout-fix
```

### Branch Protection Rules

- **Main branch**: Protected, requires PR review
- **Agent branches**: Auto-generated, managed by AI agents
- **Feature branches**: Require PR, must pass all checks

## 📝 Commit Standards

### Conventional Commits Format

```
type(scope): subject

body (optional)

footer(s) (optional)
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance changes
- `docs`: Documentation updates
- `refactor`: Code refactoring
- `test`: Testing changes
- `perf`: Performance improvements

#### Examples

```bash
feat(api): add blueprint generation endpoint
fix(web): resolve wizard step navigation issue
docs(contributing): update development workflow
test(api): add unit tests for validation middleware
```

## 🤖 Agent-Specific Workflows

### Technical Writer

1. Receives documentation task from dispatcher
2. Creates branch `agent/technical-writer`
3. Writes/updates documentation
4. Ensures documentation follows project standards
5. Creates PR with documentation changes
6. Updates task status to DONE

### Frontend Engineer

1. Receives UI/feature task from dispatcher
2. Creates branch `agent/frontend-engineer`
3. Implements React components
4. Ensures responsive design
5. Adds tests as needed
6. Creates PR with frontend changes
7. Updates task status to DONE

### Backend Engineer

1. Receives API/backend task from dispatcher
2. Creates branch `agent/backend-engineer`
3. Implements Hono endpoints
4. Adds input validation with Zod
5. Handles errors appropriately
6. Creates PR with backend changes
7. Updates task status to DONE

## 🔄 Pull Request Process

### PR Creation Checklist

- [ ] Branch created from main
- [ ] Descriptive title with conventional commit format
- [ ] Clear description of changes
- [ ] Task ID referenced in description
- [ ] All CI checks passing
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No merge conflicts

### PR Review Process

1. **Automated Checks**: CI/CD pipeline runs
2. **QA Review**: QA engineer validates functionality
3. **Security Review**: Security engineer audits if needed
4. **Repo Guardian**: Validates scope and compliance
5. **Integration Review**: Final merge approval

## 🚨 Emergency Procedures

### Critical Bug Response

1. **Immediate**: Create issue with `critical` label
2. **Architect**: Prioritizes in next planning cycle
3. **Dispatcher**: Assigns appropriate agent
4. **Fast Track**: Bypasses normal queue if severity warrants
5. **Hotfix**: Deployed outside normal release cycle

### Rollback Procedures

1. **Identify**: Determine problematic commit
2. **Revert**: Create revert commit
3. **Test**: Validate fix
4. **Deploy**: Hotfix deployment
5. **Post-mortem**: Document in `docs/bug.md`

## 📊 Workflow Metrics

### Success Indicators

- **Cycle Time**: Average time from task creation to merge
- **PR Success Rate**: Percentage of PRs that pass all gates
- **Quality Score**: Average QA and Security pass rates
- **Documentation Coverage**: Percentage of features with documentation

### Monitoring

- Daily workflow execution reports
- Weekly performance metrics
- Monthly process optimization reviews

## 🔄 Continuous Improvement

### Workflow Updates

1. **Knowledge Steward**: Identifies workflow inefficiencies
2. **Architect**: Reviews and approves workflow changes
3. **Documentation**: Updates workflow documentation
4. **Training**: Agents updated on new processes

### Feedback Loops

- Agent performance metrics
- Code quality trends
- Documentation effectiveness
- Developer satisfaction surveys

---

_This workflow is continuously evolving based on project needs and team feedback. Last updated: 2026-02-19_
