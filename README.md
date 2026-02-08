# Blueprintify

> **AI-Powered Project Architecture Documentation**

Generate production-ready `blueprint.md` and `task.md` files for your projects in seconds. Built with Cloudflare Workers + React.

![Blueprint Generator Demo](https://via.placeholder.com/800x400?text=Blueprint+Generator)

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
└── docs/                # Project documentation
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
# Create apps/api/.dev.vars with your OpenAI API key:
# OPENAI_API_KEY=your_openai_api_key_here
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
# Type check TypeScript
npm run typecheck

# Lint Code
npm run lint

# Run API Tests
npm run test:api
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

- **Technical Writer** - Documentation maintenance and user guides
- **Frontend Engineer** - React components and UI development
- **Backend Engineer** - API development and database architecture
- **Software Architect** - System design and architecture decisions
- **Security Engineer** - Security audits and vulnerability assessments
- **DevOps Engineer** - CI/CD pipelines and deployment automation
- **Quality Assurance** - Testing and code review processes

### Available Skills

The system includes reusable skills for common tasks:

- `docs-update` - Standard documentation updates
- `react-component-create` - React component creation
- `api-endpoint-create` - API endpoint development
- `security-audit` - Security vulnerability analysis
- `test-suite-create` - Comprehensive test creation
- `dependency-audit` - Package dependency analysis
- And many more specialized skills

## 🔧 Configuration

### API Environment Variables

| Variable          | Required | Description                         |
| ----------------- | -------- | ----------------------------------- |
| `OPENAI_API_KEY`  | Yes      | Your OpenAI API key                 |
| `OPENAI_BASE_URL` | No       | Custom API base URL                 |
| `OPENAI_MODEL`    | No       | Model to use (default: gpt-4o-mini) |

## 📡 API Endpoints

| Method | Endpoint    | Description                                |
| ------ | ----------- | ------------------------------------------ |
| GET    | `/`         | Health check                               |
| POST   | `/generate` | Generate blueprint (SSE stream)            |
| POST   | `/tasks`    | Generate tasks from blueprint (SSE stream) |
| POST   | `/refine`   | Refine content section (SSE stream)        |

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
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project

### 🛠️ Development Resources

- **[Development Workflow](./docs/development-workflow.md)** - Complete development process overview
- **[Code Style Guidelines](./docs/code-style-guidelines.md)** - Coding standards and best practices
- **[Testing Procedures](./docs/testing-procedures.md)** - Testing standards, tools, and guidelines
- **[Release Process](./docs/release-process.md)** - Release and deployment procedures

### 🤖 AI Agent System

- **[AI Agent Usage Guide](./docs/ai-agent-usage-guide.md)** - Working with the AI agent system
- **[Technical Writer Agent](./.opencode/agent/technical-writer.md)** - Documentation agent configuration and workflow

### 📋 Project Documentation

- **[Technical Findings](./docs/findings.md)** - Technical feedback and improvement logs
- **[Project Blueprint](./docs/blueprint.md)** - System architecture and design decisions
- **[Task Management](./docs/task.md)** - Current development tasks and priorities
- **[Feature Specifications](./docs/features.md)** - Detailed feature documentation and status

## 📝 License

MIT © 2024
