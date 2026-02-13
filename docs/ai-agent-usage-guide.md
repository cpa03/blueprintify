# AI Agent System Usage Guide

This comprehensive guide explains how to effectively use the OpenCode AI agent system for the Blueprintify project. The AI agent system automates development workflows while maintaining quality and consistency.

## 🤖 System Overview

The Blueprintify project uses an advanced AI-driven development system that combines multiple specialized agents with automated workflows. The system handles everything from code development to documentation maintenance.

### Core Architecture

```
GitHub Actions Workflow
├── Architect (Decision Maker)
├── Dispatcher (Task Assignment)
├── Engineers (Implementation)
├── QA Gate (Quality Assurance)
├── Security Gate (Security Review)
├── Repo Guardian (Compliance)
├── Integrator (Merge Management)
├── Knowledge Steward (Documentation)
└── Reliability Engineer (Monitoring)
```

## 🎭 Agent Roles and Responsibilities

### 1. Architect

**Purpose**: Single source of decision-making for project priorities and task assignments.

**Responsibilities**:

- Evaluates project documentation (`docs/blueprint.md`, `docs/roadmap.md`, `docs/bugs.md`, `docs/features.md`)
- Sets task priorities (HIGH, MEDIUM, LOW)
- Creates and updates `docs/task.md` with role assignments
- Ensures tasks are properly scoped
- Maintains architectural consistency

**When Runs**: Every 6 hours via scheduled GitHub Actions

**Key Outputs**:

- Updated `docs/task.md` with task assignments
- Priority evaluations
- Scope definitions

### 2. Dispatcher

**Purpose**: Maps tasks to appropriate agent roles without conflicts.

**Responsibilities**:

- Reads `docs/task.md` for available tasks
- Selects OPEN tasks with HIGH/MEDIUM priority
- Creates `docs/dispatch.json` with unique role assignments
- Ensures no duplicate role assignments
- Optimizes task distribution

**When Runs**: After Architect completes

**Key Outputs**:

- `docs/dispatch.json` with role assignments
- Task distribution matrix

### 3. Engineer Agents

**Specialized Roles**:

- **Technical Writer**: Documentation, user guides, technical docs
- **Frontend Engineer**: React components, UI development, user experience
- **Backend Engineer**: API development, database architecture, server logic
- **Software Architect**: System design, technical decisions, architecture patterns
- **Security Engineer**: Security audits, vulnerability assessments
- **DevOps Engineer**: CI/CD pipelines, deployment automation
- **Quality Assurance**: Testing, code review, quality gates

**Common Workflow**:

1. Takes ONE assigned task matching their role
2. Works within defined scope (no feature creep)
3. Creates feature branch (`agent/[role-name]`)
4. Implements solution following project standards
5. Creates pull request with task ID reference
6. Updates task status to DONE in `docs/task.md`

### 4. QA Engineer

**Purpose**: Ensures code quality and functionality.

**Responsibilities**:

- Reviews PRs against `task.md` and `blueprint.md`
- Adds tests if needed
- Validates functionality
- Updates task with QA PASS/FAIL status

**Quality Criteria**:

- Code follows project standards
- Tests are comprehensive
- Functionality matches requirements
- Performance is acceptable

### 5. Security Engineer

**Purpose**: Ensures security standards are met.

**Responsibilities**:

- Audits HIGH/CRITICAL priority PRs
- Validates against `blueprint.md` security requirements
- Checks for vulnerabilities
- Updates task with SECURITY PASS/FAIL status

**Security Checks**:

- Input validation
- Authentication/authorization
- Data handling
- API security

### 6. Repo Guardian

**Purpose**: Enforces repository governance rules.

**Responsibilities**:

- Reviews all PRs for compliance
- Blocks PRs that violate rules
- Provides feedback on violations

**Rejection Criteria**:

- Files outside task scope
- Added files/folders without task
- Documentation added without Architect permission
- Violation of project standards

### 7. Integrator

**Purpose**: Manages final merge process.

**Responsibilities**:

- Reviews PR approval status
- Merges PRs one by one
- Validates all gates passed
- Comments on failed merges

**Merge Requirements**:

- Has Task ID referenced
- QA PASS status
- SECURITY PASS (if applicable)
- Repo Guardian approval

### 8. Knowledge Steward

**Purpose**: Maintains documentation consistency.

**Responsibilities**:

- Reviews documentation consistency
- Identifies knowledge gaps
- Documents drift in `docs/knowledge-review.md`
- Ensures documentation matches reality

### 9. Reliability Engineer

**Purpose**: Monitors system health and reliability.

**Responsibilities**:

- Scans logs, PRs, issues
- Documents new bugs in `docs/bug.md`
- Identifies patterns and trends
- Does not fix bugs (only documents)

## 🔧 Agent Configuration

### Agent Definitions

Agent definitions are stored in `.opencode/agent/` directory:

```markdown
---
agent: technical-writer
category: writing
model: opencode/minimax-m2.1-free
---

# Technical Writer Agent Configuration

## Role

Documentation maintenance and user guides

## Skills

- docs-update
- technical-writing
- user-guide-creation

## Constraints

- Cannot add code without documentation task
- Must follow project documentation standards
- Cannot change core functionality
```

### Skill System

Skills are reusable capabilities that agents can use:

```markdown
---
skill: docs-update
category: writing
---

# Documentation Update Skill

## Purpose

Standard documentation updates and maintenance

## Usage

- Update existing documentation
- Create new documentation files
- Ensure consistency and quality

## Tools Available

- File reading/writing
- Markdown formatting
- Link validation
```

### Available Skills

1. **docs-update**: Standard documentation updates
2. **react-component-create**: React component creation
3. **api-endpoint-create**: API endpoint development
4. **security-audit**: Security vulnerability analysis
5. **test-suite-create**: Comprehensive test creation
6. **dependency-audit**: Package dependency analysis
7. **performance-analysis**: Performance optimization
8. **accessibility-audit**: Accessibility compliance

## 📋 Task Management

### Task Format

Tasks in `docs/task.md` follow this structure:

```yaml
---
# OPEN Tasks
- id: TASK-001
  title: "Add user authentication documentation"
  priority: HIGH
  role: technical-writer
  scope: "Update docs/auth.md with comprehensive guide"
  status: OPEN
  assigned_to: ""
  created_at: "2026-02-06T10:00:00Z"

# IN_PROGRESS Tasks
- id: TASK-002
  title: "Create login component"
  priority: MEDIUM
  role: frontend-engineer
  scope: "Implement React login form with validation"
  status: IN_PROGRESS
  assigned_to: "agent/frontend-engineer"
  created_at: "2026-02-06T09:00:00Z"
  started_at: "2026-02-06T11:00:00Z"

# DONE Tasks
- id: TASK-003
  title: "Set up API validation"
  priority: HIGH
  role: backend-engineer
  scope: "Add Zod validation to all API endpoints"
  status: DONE
  assigned_to: "agent/backend-engineer"
  created_at: "2026-02-05T14:00:00Z"
  completed_at: "2026-02-05T18:00:00Z"
  qa_status: PASS
  security_status: PASS
---
```

### Priority Levels

- **CRITICAL**: Security issues, production outages
- **HIGH**: Important features, user-impacting bugs
- **MEDIUM**: Feature improvements, minor bugs
- **LOW**: Documentation updates, minor enhancements

### Status Flow

```
OPEN → ASSIGNED → IN_PROGRESS → REVIEW → DONE
              ↓              ↓
           CANCELLED    REJECTED
```

## 🔄 Workflow Integration

### GitHub Actions Workflow

The complete workflow runs every 6 hours:

```yaml
name: ai-software-company

on:
  workflow_dispatch:
  schedule:
    - cron: "0 */6 * * *"

permissions:
  contents: write
  pull-requests: write
  issues: write

concurrency:
  group: ai-company-${{ github.ref }}
  cancel-in-progress: false
```

### Workflow Phases

1. **Architect**: Creates/updates task plan
2. **Dispatcher**: Assigns tasks to agents
3. **Engineers**: Implement solutions (parallel)
4. **QA Gate**: Quality validation
5. **Security Gate**: Security validation
6. **Repo Guardian**: Compliance check
7. **Integrator**: Merge management
8. **Knowledge Steward**: Documentation review
9. **Reliability Engineer**: Monitoring

## 🎯 Using the System

### For Developers

#### Creating Tasks

1. **Manual Task Creation**:

   ```markdown
   # Add to docs/task.md

   - id: TASK-004
     title: "Your task title"
     priority: MEDIUM
     role: appropriate-role
     scope: "Detailed description of what needs to be done"
     status: OPEN
   ```

2. **Issue-to-Task Conversion**:
   - Create GitHub issue with appropriate labels
   - Architect will convert to task in next cycle

#### Working with Agent PRs

1. **Review Agent PRs**:
   - Check if scope matches task requirements
   - Verify code quality
   - Test functionality
   - Provide constructive feedback

2. **Merge Approval**:
   - Integrator handles merges automatically
   - Manual approval only needed if gates fail

#### Debugging Agent Issues

1. **Check Workflow Logs**:
   - GitHub Actions → workflow run → job logs
   - Look for error messages or failures

2. **Review Agent Output**:
   - Check PR descriptions for agent reasoning
   - Review commit messages for context

3. **Manual Intervention**:
   - If agent fails, create issue with details
   - Architect will address in next cycle

### For Maintainers

#### System Configuration

1. **Agent Updates**:
   - Edit agent definitions in `.opencode/agent/`
   - Update skill configurations in `.opencode/skill/`
   - Test changes in development environment

2. **Workflow Modifications**:
   - Update `.github/workflows/main.yml`
   - Test with workflow_dispatch trigger
   - Monitor for unintended consequences

#### Quality Assurance

1. **Monitor Agent Performance**:
   - Review PR quality regularly
   - Check task completion rates
   - Identify pattern issues

2. **System Maintenance**:
   - Update models as needed
   - Refine prompts and instructions
   - Monitor token usage and costs

## 📊 Monitoring and Metrics

### Agent Performance Metrics

1. **Task Completion Rate**:
   - Percentage of tasks completed successfully
   - Time from assignment to completion
   - Quality of completed work

2. **PR Quality Metrics**:
   - PR approval rate
   - Time to merge
   - Issues found during review

3. **System Health**:
   - Workflow success rate
   - Agent error rates
   - Resource usage

### Monitoring Dashboard

Key metrics to track:

```typescript
interface AgentMetrics {
  totalTasks: number;
  completedTasks: number;
  averageCompletionTime: number;
  errorRate: number;
  prApprovalRate: number;
  averagePRTime: number;
}

interface SystemHealth {
  workflowSuccessRate: number;
  agentAvailability: number;
  tokenUsage: number;
  costTracking: number;
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Agent Won't Complete Task

**Symptoms**:

- Task remains in IN_PROGRESS status
- No PR created
- Workflow errors in GitHub Actions

**Solutions**:

1. Check workflow logs for specific errors
2. Verify task scope is clear and achievable
3. Ensure agent role is appropriate
4. Check for missing dependencies or permissions

#### 2. PR Fails QA Gate

**Symptoms**:

- PR created but fails QA review
- QA status remains FAIL

**Solutions**:

1. Review QA comments for specific issues
2. Check if code meets quality standards
3. Verify tests are comprehensive
4. Ensure functionality matches requirements

#### 3. Security Gate Failures

**Symptoms**:

- SECURITY FAIL status
- Security vulnerabilities identified

**Solutions**:

1. Review security feedback
2. Fix identified vulnerabilities
3. Update security practices
4. Request re-review after fixes

#### 4. Repo Guardian Rejections

**Symptoms**:

- PR rejected by Repo Guardian
- Comments about scope violations

**Solutions**:

1. Review rejection comments
2. Ensure PR stays within task scope
3. Remove unauthorized files/folders
4. Get Architect approval for documentation changes

### Emergency Procedures

#### Manual Override

If the system fails completely:

1. **Disable Automated Workflows**:

   ```bash
   # Pause GitHub Actions
   gh workflow disable main.yml
   ```

2. **Manual Task Management**:
   - Manually assign tasks to team members
   - Track progress in project management tool
   - Create PRs manually

3. **System Recovery**:
   - Identify and fix root cause
   - Test with small batch of tasks
   - Gradually re-enable automation

#### Hotfix Process

For urgent production issues:

1. **Bypass Agent System**:
   - Create hotfix branch manually
   - Implement fix directly
   - Deploy with manual approval

2. **Post-Incident**:
   - Document what went wrong
   - Update agent configurations
   - Add safeguards for similar issues

## 🔮 Future Enhancements

### Planned Improvements

1. **Advanced Agent Capabilities**:
   - Cross-agent collaboration
   - Dynamic skill assignment
   - Learning from past interactions

2. **Enhanced Monitoring**:
   - Real-time agent performance dashboard
   - Predictive failure detection
   - Automated performance optimization

3. **Integration Improvements**:
   - Better integration with project management tools
   - Enhanced notification systems
   - Improved human-AI collaboration

### Experimental Features

1. **Multi-Agent Tasks**:
   - Complex tasks requiring multiple agents
   - Collaborative problem-solving
   - Shared context and coordination

2. **Self-Improving System**:
   - Agents learn from feedback
   - Automatic prompt optimization
   - Performance-based model selection

---

_The AI agent system is continuously evolving. Last updated: 2026-02-06_
