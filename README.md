# Blueprintify

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
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
│   ├── user-guide.md    # Complete user documentation
│   ├── api-documentation.md  # API reference
│   ├── m2-technical-approach.md  # M2 implementation details
│   ├── refinement-workflow.md  # Refinement system architecture
│   ├── localstorage-schema.md  # Storage schema documentation
│   └── export-import-specs.md  # Data portability specifications
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

- Node.js 18+
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

- **API Specialist** - API design, implementation, and optimization
- **Backend Engineer** - API development and database architecture
- **CMZ** - Code modularization and refactoring specialist
- **Code Reviewer** - Code quality assessment and review
- **Coder** - General coding and implementation tasks
- **Database Architect** - Database design and schema architecture
- **Debugger** - Debugging and troubleshooting specialist
- **DevOps Engineer** - CI/CD pipelines and deployment automation
- **Frontend Engineer** - React components and UI development
- **Integration Engineer** - System integration and API connectivity
- **Integrator** - Cross-system integration specialist
- **Janitor** - Code cleanup and repository maintenance
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

| Method | Endpoint         | Description                                |
| ------ | ---------------- | ------------------------------------------ |
| GET    | `/`              | Health check                               |
| POST   | `/generate`      | Generate blueprint (SSE stream)            |
| POST   | `/tasks`         | Generate tasks from blueprint (SSE stream) |
| POST   | `/refine`        | Refine content section (SSE stream)        |
| POST   | `/export`        | Export project as ZIP/JSON/Markdown        |
| POST   | `/import`        | Import project with validation             |
| GET    | `/storage/quota` | Check localStorage usage                   |
| DELETE | `/storage/clear` | Clear stored data                          |
| POST   | `/share`         | Create shareable blueprint link            |
| GET    | `/share/:id`     | Retrieve shared blueprint                  |
| DELETE | `/share/:id`     | Delete shared blueprint                    |

## 🛠️ Tech Stack

### Backend

- **Hono** - Ultra-lightweight web framework
- **Cloudflare Workers** - Edge runtime
- **Zod** - Schema validation
- **OpenAI SDK** - AI completions
- **Vitest** - Testing framework

### Frontend

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **CodeMirror** - Code editor (via @uiw/react-codemirror)
- **Framer Motion** - Animations
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

### 🤖 AI Agent System

- **[AI Agent Usage Guide](./docs/ai-agent-usage-guide.md)** - Working with the AI agent system
- **[Technical Writer Agent](./.opencode/agent/technical-writer.md)** - Documentation agent configuration and workflow

### 📋 Project Documentation

- **[Project Blueprint](./docs/blueprint.md)** - System architecture and design decisions
- **[Task Management](./docs/task.md)** - Current development tasks and priorities
- **[Feature Specifications](./docs/features.md)** - Detailed feature documentation and status
- **[Roadmap](./docs/roadmap.md)** - Project roadmap and future plans

### 📚 M2 Documentation

- **[M2 Technical Approach](./docs/m2-technical-approach.md)** - Complete M2 implementation strategy
- **[Refinement Workflow](./docs/refinement-workflow.md)** - AI refinement system architecture
- **[LocalStorage Schema](./docs/localstorage-schema.md)** - Storage persistence specifications
- **[Export/Import Specs](./docs/export-import-specs.md)** - Data portability implementation details

## 📝 License

MIT © 2026
