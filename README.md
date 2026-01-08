# Blueprint Generator

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
blueprint-generator/
├── packages/
│   └── shared/          # Zod schemas & TypeScript types
├── apps/
│   ├── api/             # Hono backend (Cloudflare Workers)
│   └── web/             # React frontend (Vite + Tailwind)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 8+ (with workspaces support)
- OpenAI API key (or compatible provider)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/blueprint-generator.git
cd blueprint-generator

# Install dependencies
npm install

# Setup environment variables
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Edit .dev.vars with your OpenAI API key
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

### Frontend

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **CodeMirror** - Code editor
- **Framer Motion** - Animations
- **Radix UI** - Accessible components

## 📝 License

MIT © 2024
