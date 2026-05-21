# AI Agent System Setup Guide

This guide provides comprehensive instructions for setting up and configuring the OpenCode AI agent system used in the Blueprintify project.

## Overview

The OpenCode AI agent system is a sophisticated framework that enables automated development through specialized AI agents, each with specific roles and capabilities. The system handles everything from documentation to code generation, testing, and deployment.

## System Architecture

### Core Components

- **Agents** - Specialized AI workers with specific roles (technical-writer, frontend-engineer, etc.)
- **Skills** - Reusable capability packs that agents can utilize
- **Commands** - Custom instructions for common operations
- **Memory** - Persistent knowledge storage for system learning
- **Plugins** - Extensible hooks for custom functionality

### Agent Roles

| Role                     | Description                                   | Key Responsibilities                                         |
| ------------------------ | --------------------------------------------- | ------------------------------------------------------------ |
| **Technical Writer**     | Documentation maintenance and user guides     | Update docs, create guides, maintain README                  |
| **Frontend Engineer**    | React components and UI development           | Build UI, implement features, ensure responsive design       |
| **Backend Engineer**     | API development and database architecture     | Create endpoints, implement logic, data modeling             |
| **Software Architect**   | System design and architecture decisions      | Design patterns, technical decisions, roadmap planning       |
| **Security Engineer**    | Security audits and vulnerability assessments | Security reviews, vulnerability scans, compliance checks     |
| **DevOps Engineer**      | CI/CD pipelines and deployment automation     | Build pipelines, deployment, infrastructure management       |
| **Quality Assurance**    | Testing and code review processes             | Test creation, code review, quality gates                    |
| **Database Architect**   | Database design and optimization              | Schema design, performance tuning, migrations                |
| **Integration Engineer** | System integration and API coordination       | Integration testing, API coordination, workflow optimization |
| **Performance Engineer** | Performance optimization and monitoring       | Performance analysis, optimization, monitoring setup         |

## Prerequisites

### System Requirements

- **Node.js** 18+
- **npm** 8+ (with workspaces support)
- **Git** - Version control
- **OpenAI API Key** - For AI model access
- **GitHub CLI** (gh) - For repository operations

### Environment Setup

1. **Node.js Installation**

   ```bash
   # Using nvm (recommended)
   nvm install 18
   nvm use 18

   # Or download from nodejs.org
   ```

2. **GitHub CLI Installation**

   ```bash
   # macOS
   brew install gh

   # Ubuntu/Debian
   sudo apt install gh

   # Windows
   # Download from github.com/cli/cli/releases
   ```

3. **Authentication**

   ```bash
   # Login to GitHub
   gh auth login

   # Select GitHub.com, HTTPS, and follow prompts
   ```

## Installation

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/cpa03/blueprintify.git
cd blueprintify

# Install dependencies
npm install
```

### 2. AI Agent Configuration

The AI agent system is configured through the `.opencode/` directory:

```
.opencode/
├── agent/           # Agent definitions and configurations
├── skill/           # Reusable skills library
├── command/         # Custom commands
├── memory/          # Knowledge storage
└── plugin/          # System plugins
```

### 3. Environment Variables

Copy the example file and configure your AI settings:

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Edit apps/api/.dev.vars with your actual values
```

The `.dev.vars` file should contain:

```bash
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional - Custom API endpoint
OPENAI_BASE_URL=https://api.openai.com/v1

# Optional - Model selection
OPENAI_MODEL=gpt-4o-mini
```

## Agent Configuration

### Agent Definition Structure

Each agent is defined in `.opencode/agent/[role-name].md`:

```markdown
---
description: Agent Role Description
mode: primary
model: opencode/deepseek-v4-flash-free
temperature: 0.1
tools:
  write: true
  edit: true
  bash: true
  read: true
  grep: true
  glob: true
  skill: true
permission:
  bash:
    "git *": allow
    "npm *": allow
    "gh *": allow
    "*": allow
---

# AGENT IDENTITY

[Agent description and responsibilities]

# OPERATIONAL WORKFLOW

[Step-by-step process for the agent]

# CONSTRAINTS & LIMITATIONS

[Rules and boundaries for the agent]

# SUCCESS CRITERIA

[Metrics for successful completion]
```

### Creating Custom Agents

1. **Create Agent Definition**

   ```bash
   # Create new agent file
   touch .opencode/agent/my-custom-agent.md
   ```

2. **Define Agent Properties**

   ```markdown

   ```

---

description: Custom Agent for Specific Task
mode: primary
model: opencode/deepseek-v4-flash-free
temperature: 0.1
tools:
write: true
edit: true
bash: true
read: true

---

````

3. **Configure Permissions**
```yaml
permission:
  bash:
    "git *": allow
    "npm *": allow
    "*": deny
````

## Skill System

### Skill Structure

Skills are reusable capability packs located in `.opencode/skill/`:

```
.opencode/skill/
├── react-component-create/
│   └── SKILL.md
├── api-endpoint-create/
│   └── SKILL.md
├── docs-update/
│   └── SKILL.md
└── [skill-name]/
    └── SKILL.md
```

### Creating Custom Skills

1. **Create Skill Directory**

   ```bash
   mkdir .opencode/skill/my-custom-skill
   touch .opencode/skill/my-custom-skill/SKILL.md
   ```

2. **Define Skill**

   ```markdown
   ---
   description: Custom skill description
   category: utility
   ---

   # Skill Description

   [What the skill does]

   # Usage

   [How to use the skill]

   # Examples

   [Example usage]
   ```

### Using Skills in Agents

Agents can load skills dynamically:

```typescript
// Load multiple skills
skill(["docs-update", "react-component-create"]);

// Use specific skill
skill("api-endpoint-create");
```

## Command System

### Command Structure

Custom commands are defined in `.opencode/command/`:

```
.opencode/command/
├── build.md
├── test.md
├── commit.md
└── [command-name].md
```

### Creating Commands

1. **Create Command File**

   ```bash
   touch .opencode/command/my-command.md
   ```

2. **Define Command**

   ```markdown
   ---
   description: Command description
   usage: my-command [options]
   ---

   # Command Description

   [What the command does]

   # Usage Examples

   [Example commands]

   # Implementation

   [Command logic and parameters]
   ```

## Memory System

### Memory Structure

The memory system stores persistent knowledge:

```
.opencode/memory/
├── backend.md        # Backend-specific knowledge
├── frontend.md       # Frontend-specific knowledge
├── database.md       # Database knowledge
├── security.md       # Security best practices
├── qa.md            # Testing knowledge
├── devops.md        # DevOps knowledge
└── PATTERNS.md      # Architecture patterns
```

### Adding to Memory

1. **Create Memory File**

   ```bash
   touch .opencode/memory/my-domain.md
   ```

2. **Add Knowledge**

   ```markdown
   # Domain Knowledge

   ## Key Concepts

   [Important concepts and definitions]

   ## Best Practices

   [Recommended approaches and patterns]

   ## Common Issues

   [Frequent problems and solutions]

   ## Resources

   [Links to documentation and tools]
   ```

## Workflow Automation

### Agent Workflows

The system supports automated workflows through agent coordination:

1. **Task Dispatch**
   - Architect creates task assignments
   - Dispatcher assigns tasks to appropriate agents
   - Agents work in parallel on their assigned tasks

2. **Quality Gates**
   - QA agent reviews all changes
   - Security agent audits high-priority changes
   - Repository guardian ensures compliance

3. **Integration**
   - Integrator merges approved changes
   - Knowledge steward updates documentation
   - Reliability engineer monitors for issues

### Custom Workflows

Create custom workflows by combining agents and skills:

```typescript
// Example: Documentation update workflow
const workflow = [agent("technical-writer", (task = "Update README")), agent("quality-assurance", (task = "Review docs")), agent("integrator", (task = "Merge changes"))];
```

## Development Workflow

### 1. Agent Development

When developing or modifying agents:

1. **Test in Isolation**

   ```bash
    # Run all tests to verify changes
    npm run test:all
   ```

2. **Validate Configuration**

   ```bash
   # Check TypeScript configuration
   npm run typecheck
   ```

3. **Monitor Quality**
   ```bash
   # Run linting
   npm run lint
   ```

### 2. Skill Development

When creating new skills:

1. **Create Skill Structure**

   ```bash
   # Create skill directory
   mkdir -p .opencode/skill/my-new-skill
   ```

2. **Implement Skill Logic**

   ```bash
   # Edit skill file
   vim .opencode/skill/my-new-skill/SKILL.md
   ```

3. **Test Skill**
   ```bash
   # Run tests to verify skill integration
   npm run test:all
   ```

### 3. Integration Testing

Test the complete system:

```bash
# Run all tests (frontend + API)
npm run test:all

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## Monitoring and Debugging

### Log Analysis

Monitor agent activities:

```bash
# View git log for recent changes
git log --oneline -10

# Check branch status
git status
```

### Performance Monitoring

Track system performance:

```bash
# Run all quality checks
npm run check

# Build the project
npm run build
```

### Debug Mode

Enable detailed debugging:

```bash
# Enable debug mode for API
DEBUG=* npm run dev:api

# Run frontend with debug logs
VITE_DEBUG=true npm run dev
```

## Best Practices

### Agent Design

1. **Single Responsibility** - Each agent should have a clear, focused role
2. **Idempotent Operations** - Agent operations should be repeatable
3. **Error Handling** - Implement robust error handling and recovery
4. **Resource Management** - Manage memory and computational resources efficiently

### Skill Development

1. **Reusable** - Design skills to be used across multiple agents
2. **Well-Documented** - Provide clear usage instructions and examples
3. **Tested** - Include comprehensive test coverage
4. **Versioned** - Use semantic versioning for skill updates

### Memory Management

1. **Organized** - Structure knowledge logically
2. **Current** - Keep information up-to-date
3. **Accessible** - Make information easy to find and use
4. **Validated** - Regularly review and validate stored knowledge

## Troubleshooting

### Common Issues

#### Agent Not Responding

```bash
# Check agent status
npm run status:agents

# Restart agent service
npm run restart:agents

# Check configuration
npm run validate:config
```

#### Skill Loading Failures

```bash
# Check skill availability
npm run list:skills

# Validate skill syntax
npm run validate:skills

# Rebuild skill index
npm run rebuild:skills
```

#### Memory Corruption

```bash
# Check memory integrity
npm run check:memory

# Repair memory files
npm run repair:memory

# Reset memory (last resort)
npm run reset:memory
```

#### Permission Issues

```bash
# Check permissions
npm run check:permissions

# Fix permission errors
npm run fix:permissions

# Reset permissions
npm run reset:permissions
```

### Getting Help

1. **System Documentation** - Check `.opencode/` documentation files
2. **Agent Logs** - Review agent execution logs
3. **Community Forums** - Post questions to community forums
4. **Issue Tracking** - Create issues for system problems

## Advanced Configuration

### Custom Models

Configure alternative AI models:

```bash
# Set custom model
export OPENAI_MODEL="gpt-4"

# Use custom endpoint
export OPENAI_BASE_URL="https://custom-api.example.com"

# Configure model-specific settings
export MODEL_TEMPERATURE="0.7"
export MODEL_MAX_TOKENS="4096"
```

### Plugin System

Extend functionality with plugins:

```bash
# Install plugin
npm install @opencode/plugin-my-plugin

# Configure plugin
echo "my-plugin.enabled=true" >> .opencode/config/plugins.conf

# Load plugin
npm run plugin:load my-plugin
```

### Resource Limits

Configure system resource limits:

```bash
# Set memory limits
export AGENT_MEMORY_LIMIT="512MB"

# Set timeout limits
export AGENT_TIMEOUT="300s"

# Set concurrency limits
export MAX_CONCURRENT_AGENTS="5"
```

## Security Considerations

### Access Control

1. **API Keys** - Store securely, never commit to repository
2. **Permissions** - Limit agent permissions to minimum required
3. **Network Access** - Restrict external API access as needed
4. **Data Privacy** - Ensure sensitive data is not logged or stored

### Audit Trail

Enable comprehensive audit logging:

```bash
# Enable audit logging
export AUDIT_ENABLED=true

# Set log retention
export AUDIT_RETENTION="90d"

# Configure audit scope
export AUDIT_SCOPE="all"
```

---

For additional support or questions about the AI agent system, please refer to the [AI Agent Usage Guide](./ai-agent-usage-guide.md) or create an issue in the repository.
