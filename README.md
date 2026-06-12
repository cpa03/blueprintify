# Blueprintify

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020.svg)](https://workers.cloudflare.com/)

> **AI-Powered Project Architecture Documentation**

Generate production-ready `blueprint.md` and `task.md` files for your projects in seconds. Built with Cloudflare Workers + React.

<!-- Blueprint Generator Demo - Screenshot placeholder for actual demo image -->

## ✨ Features

- **🧙 Wizard Interface** - Step-by-step project configuration
- **📚 Template Library** - Quick-start with pre-configured templates
- **⚡ Real-time Streaming** - Watch your blueprint generate live via SSE
- **✏️ Split-Pane Editor** - CodeMirror editor with live markdown preview
- **📦 One-Click Export** - Download `.docs/` folder as a ZIP
- **💾 Auto-Save** - Session persistence with localStorage
- **🌙 Dark Mode** - Premium dark UI with glassmorphism effects

## 🏗️ Architecture

```
blueprintify/
├── .opencode/           # AI agent system and skills
│   ├── agent/           # Agent definitions (technical-writer, etc.)
│   ├── skill/           # Reusable skills (docs-update, etc.)
│   ├── command/         # Custom commands
│   └── plugin/          # Plugins and hooks
├── packages/
│   └── shared/          # Zod schemas & TypeScript types
├── apps/
│   ├── api/             # Hono backend (Cloudflare Workers)
│   └── web/             # React frontend (Vite + Tailwind)
├── docs/                # Project documentation
│   ├── archive/          # Archived/outdated docs (historical reference)
│   ├── audits/
│   │   ├── README.md     # Audit file index
│   │   ├── archive/      # Historical audit runs (consolidated)
│   │   ├── brocula-hunt-2026-06-09-run2.md
│   │   ├── brocula-hunt-2026-06-09-run3.md
│   │   ├── brocula-hunt-2026-06-09-run4.md
│   │   ├── brocula-hunt-2026-06-10.md
│   │   ├── brocula-hunt-2026-06-10-run2.md
│   │   ├── brocula-hunt-2026-06-10-run3.md
│   │   ├── brocula-hunt-2026-06-10-run4.md
│   │   ├── brocula-hunt-2026-06-10-run5.md
│   │   ├── brocula-hunt-2026-06-11.md
│   │   ├── brocula-hunt-2026-06-11-run2.md
│   │   ├── brocula-hunt-2026-06-11-run3.md
│   │   └── brocula-hunt-2026-06-12.md
│   ├── blueprint.md
│   ├── bugs.md
│   ├── ci-configuration.md
│   ├── ci-workflow-fixes.md
│   ├── code-style-guidelines.md
│   ├── completed-tasks-2026-Q1.md
│   ├── development-workflow.md
│   ├── environment-variables.md
│   ├── export-import-specs.md
│   ├── features.md
│   ├── findings.md
│   ├── flexy-plan.md
│   ├── issue-audit-report-2026-06-05.md
│   ├── issue-audit-report-2026-06-07.md
│   ├── issue-audit-report-2026-06-08.md
│   ├── knowledge-review.md
│   ├── localstorage-schema.md
│   ├── m2-technical-approach.md
│   ├── refinement-workflow.md
│   ├── release-process.md
│   ├── repo-rules.md
│   ├── roadmap-m3-proposal.md
│   ├── roadmap.md
│   ├── security/
│   ├── testing-procedures.md
│   ├── troubleshooting.md
│   └── user-guide.md
└── scripts/             # Build and deployment scripts
```

### M2 Architecture Enhancements

The M2 release adds significant architectural improvements:

**Frontend Enhancements**

- **Split-Pane Editor**: CodeMirror integration with live markdown preview
- **LocalStorage Persistence**: 5MB storage with intelligent quota management
- **Refinement Engine**: Section-based AI content refinement
- **Export/Import System**: Multi-format data portability (JSON, ZIP, Markdown)
- **Security Layer**: DOMPurify-based XSS protection and input validation

**Backend Extensions**

- **Refinement Endpoint**: `/refine` for selective content enhancement
- **Export Endpoint**: `/export` for multi-format file generation
- **Import Endpoint**: `/import` with validation and conflict resolution
- **Storage API**: Quota management and storage operations
- **Enhanced Security**: Comprehensive input sanitization and validation

**Data Flow**

```
Wizard Generation → Split-Pane Editor → Refinement Workflow → Export/Import
       ↓                ↓                    ↓                ↓
  Session State → LocalStorage → Refinement API → File Generation
       ↓                ↓                    ↓                ↓
  Auto-Save     ←   Quota Management  ←   Edit Preservation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- npm 8+ (with workspaces support)
- OpenAI API key (or compatible provider)

### Installation

```bash
# Clone the repository
git clone https://github.com/cpa03/blueprintify.git
cd blueprintify

# Install dependencies
npm install

# Setup environment variables
# Copy the example file and fill in your OpenAI API key:
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Then edit apps/api/.dev.vars and replace 'your_openai_api_key_here' with your actual key
```

### Development

```bash
# Start both frontend and API
npm run dev:all

# Or start separately:
npm run dev        # Frontend only (port 3000)
npm run dev:api    # API only (port 8787)
```

### Quality Assurance

```bash
# Run all quality checks (typecheck + lint + test)
npm run check

# Or run individually:
npm run typecheck
npm run lint
npm run test:all
```

### Build

```bash
# Build frontend
npm run build

# Deploy API to Cloudflare
npm run deploy --workspace=apps/api
```

## 🤖 AI Agent System

This project uses the OpenCode AI agent system with specialized roles for different development tasks.

### Available Agent Roles

- **AI Agent Engineer** - AI agent infrastructure maintenance and improvement
- **API Specialist** - API design, implementation, and optimization
- **Backend Engineer** - API development and database architecture
- **CMZ** - Code modularization and refactoring specialist
- **Code Reviewer** - Code quality assessment and review
- **Coder** - General coding and implementation tasks
- **Database Architect** - Database design and schema architecture
- **Debugger** - Debugging and troubleshooting specialist
- **DevOps Engineer** - CI/CD pipelines and deployment automation
- **DX Engineer** - Developer experience and tooling improvements
- **Frontend Engineer** - React components and UI development
- **Integration Engineer** - System integration and API connectivity
- **Integrator** - Cross-system integration specialist
- **Janitor** - Code cleanup and repository maintenance
- **Modularity Engineer** - Code structure and architecture improvement
- **Performance Engineer** - Performance optimization and analysis
- **Planner** - Project planning and task organization
- **Product Strategist** - Product vision and strategy planning
- **Quality Assurance** - Testing and code review processes
- **Reliability Engineer** - System reliability and stability
- **Researcher** - Technical research and analysis
- **Security Engineer** - Security audits and vulnerability assessments
- **Software Architect** - System design and architecture decisions
- **Synthesizer** - Code synthesis and pattern recognition
- **System Improver** - System-wide improvements and optimization
- **Technical Writer** - Documentation maintenance and user guides
- **UI/UX Engineer** - User interface and experience design
- **User Story Engineer** - Small, incremental improvements from issues

### Available Skills

The system includes 25+ reusable skills for common tasks:

**Core Development Skills:**

- `api-endpoint-create` - API endpoint development
- `react-component-create` - React component creation
- `database-migration-create` - Database migration scripts
- `typescript-refactor` - TypeScript code refactoring
- `pattern-extraction` - Extract and document code patterns

**Quality & Testing Skills:**

- `test-suite-create` - Comprehensive test creation
- `security-audit` - Security vulnerability analysis
- `dependency-audit` - Package dependency analysis
- `code-review-checklist` - Systematic code review process
- `resilience-check` - System resilience validation

**Documentation & Planning Skills:**

- `docs-update` - Standard documentation updates
- `planning-with-files` - File-based planning workflow
- `git-commit-standard` - Standardized commit message formatting
- `ci-pipeline-update` - CI/CD pipeline modifications

**Advanced Skills:**

- Systematic debugging strategies
- Test-driven development workflows
- Git worktree management
- Context engineering and memory systems
- Brainstorming and idea generation
- Agentic QE skill building

_See `.opencode/skill/` directory for complete skill definitions._

## 🔧 Configuration

### API Environment Variables

| Variable          | Required | Description                         |
| ----------------- | -------- | ----------------------------------- |
| `OPENAI_API_KEY`  | Yes      | Your OpenAI API key                 |
| `OPENAI_BASE_URL` | No       | Custom API base URL                 |
| `OPENAI_MODEL`    | No       | Model to use (default: gpt-4o-mini) |

## 📡 API Endpoints

| Method | Endpoint          | Description                                    |
| ------ | ----------------- | ---------------------------------------------- |
| GET    | `/`               | Health check                                   |
| POST   | `/generate`       | Generate blueprint (SSE stream)                |
| POST   | `/tasks`          | Generate tasks from blueprint (SSE stream)     |
| POST   | `/refine`         | Refine content section (SSE stream)            |
| POST   | `/export`         | Export project as ZIP/JSON/Markdown            |
| POST   | `/import`         | Import project with validation                 |
| GET    | `/storage/quota`  | Check storage usage                            |
| POST   | `/storage/report` | Report client storage usage for quota tracking |
| DELETE | `/storage/clear`  | Clear stored data                              |
| POST   | `/share`          | Create shareable blueprint link                |
| GET    | `/share/:id`      | Retrieve shared blueprint                      |
| DELETE | `/share/:id`      | Delete shared blueprint                        |

## 🛠️ Tech Stack

### Backend

- **Hono** - Ultra-lightweight web framework
- **Cloudflare Workers** - Edge runtime
- **Zod** - Schema validation
- **OpenAI SDK** - AI completions
- **Vitest** - Testing framework

### Frontend

- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **CodeMirror** - Code editor (via @uiw/react-codemirror)
- **CSS Animations** - Animations (spring, transition)
- **Radix UI** - Accessible components
- **React Markdown** - Markdown rendering
- **JSZip** - File compression for exports

### Development Tools

- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Concurrently** - Parallel script execution
- **Wrangler** - Cloudflare Workers deployment

## 📚 Documentation

### 🚀 Getting Started

- **[User Guide](./docs/user-guide.md)** - Complete guide for using the blueprint generation workflow
- **[API Documentation](./docs/api-documentation.md)** - Comprehensive API reference and examples

### 🛠️ Development Resources

- **[Development Workflow](./docs/development-workflow.md)** - Complete development process overview
- **[Code Style Guidelines](./docs/code-style-guidelines.md)** - Coding standards and best practices
- **[Testing Procedures](./docs/testing-procedures.md)** - Testing standards, tools, and guidelines
- **[Release Process](./docs/release-process.md)** - Release and deployment procedures
- **[Troubleshooting Guide](./docs/troubleshooting.md)** - Common issues and solutions
- **[Environment Variables](./docs/environment-variables.md)** - Configuration reference for API, frontend, and Cloudflare
- **[CI Configuration](./docs/ci-configuration.md)** - CI/CD configuration and Node.js version requirements
- **[CI Workflow Fixes](./docs/ci-workflow-fixes.md)** - CI workflow fix instructions and status
- **[Repository Rules](./docs/repo-rules.md)** - Repository governance and contribution rules
- **[Security Assessment](./docs/security/assessment-ajv-vulnerabilities.md)** - AJV dependency vulnerability analysis

### 🤖 AI Agent System

- **[AI Agent Usage Guide](./docs/ai-agent-usage-guide.md)** - Working with the AI agent system
- **[Knowledge Review](./docs/knowledge-review.md)** - Document drift tracking and consistency checks
- **[Technical Writer Agent](./.opencode/agent/technical-writer.md)** - Documentation agent configuration and workflow

### 📋 Project Documentation

- **[Active Tasks](./docs/active-tasks.md)** - Current development tasks and priorities
- **[Completed Tasks (Q1 2026)](./docs/completed-tasks-2026-Q1.md)** - Archived completed work from Q1 2026
- **[Feature Specifications](./docs/features.md)** - Detailed feature documentation and status
- **[Findings](./docs/findings.md)** - RepoKeeper observation and cleanup log
- **[Flexy Plan](./docs/flexy-plan.md)** - Hardcoded value elimination and modularization plan
- **[Known Bugs](./docs/bugs.md)** - Active bug tracking and known defects
- **[Project Blueprint](./docs/blueprint.md)** - System architecture and design decisions
- **[Issue Audit Report (Jun 5)](./docs/issue-audit-report-2026-06-05.md)** - Issue label normalization and duplicate detection report
- **[Issue Audit Report (Jun 7)](./docs/issue-audit-report-2026-06-07.md)** - ULW Loop issue audit with fix status tracking
- **[Issue Audit Report (Jun 8)](./docs/issue-audit-report-2026-06-08.md)** - ULW Loop issue audit with fix status tracking
- **[BroCula Audits](./docs/audits/README.md)** - Current audit reports (Jun 9–Jun 12 Run 1)
- **[Roadmap](./docs/roadmap.md)** - Project roadmap and future plans
- **[Roadmap M3 Proposal](./docs/roadmap-m3-proposal.md)** - M3 strategic expansion proposal

### 📚 M2 Documentation

- **[M2 Technical Approach](./docs/m2-technical-approach.md)** - Complete M2 implementation strategy
- **[Refinement Workflow](./docs/refinement-workflow.md)** - AI refinement system architecture
- **[LocalStorage Schema](./docs/localstorage-schema.md)** - Storage persistence specifications
- **[Export/Import Specs](./docs/export-import-specs.md)** - Data portability implementation details

## 📝 License

MIT © 2026
