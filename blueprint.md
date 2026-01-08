# Blueprint Generator: System Architecture & Design

**Status**: Version 1.0.0 (Initial)  
**Last Updated**: 2026-01-07  
**Guarded By**: Agent 00 (System Guardian)

---

## 1. System Coordinates

### 1.1 Vision

To provide a friction-less "Day 1" experience for autonomous software development. The **Blueprint Generator** acts as an intelligent bridge between raw human intent and the structured documentation (`blueprint.md`, `task.md`) required by autonomous agents.

### 1.2 Core Functionality

- **Input**: User Intent (Project Name, Stack Preference, Description).
- **Processing**: AI-driven architectural synthesis using "Senior Architect" personas.
- **Output**: Structured Markdown Artifacts (`blueprint.md`, `task.md`, `roadmap.md`) via real-time streaming.
- **Experience**: Split-pane interface (Wizard + Live Editor).

### 1.3 System Boundaries

- **Hosted**: Cloudflare Global Edge Network.
- **Persistence**: LocalStorage (Ephemeral), optional Cloudflare KV/D1 (Future).
- **External Integration**: OpenAI Compatible APIs (ChatGPT, Claude, Gemini) for intelligence.

---

## 2. Architecture & Tech Stack

### 2.1 Monorepo Structure

The system utilizes **NPM Workspaces** for strict boundary enforcement and code sharing.

| Scope        | Directory         | Tech Stack                      | Purpose                                              |
| :----------- | :---------------- | :------------------------------ | :--------------------------------------------------- |
| **Frontend** | `apps/web`        | React, Vite, Tailwind, Radix UI | User Interface, Wizard State, Markdown Preview.      |
| **Backend**  | `apps/api`        | Cloudflare Workers, Hono        | API Gateway, Prompt Engineering, Streaming Response. |
| **Shared**   | `packages/shared` | TypeScript, Zod                 | Shared Types, Schemas, Validation Contracts.         |

### 2.2 Application Layers

#### Frontend Layer (`apps/web`)

- **State Management**: Zustand (Global Store for Wizard Data).
- **Routing**: Client-side routing (React Router or simple State Router).
- **Styling**: Tailwind CSS for utility-first design, Radix UI for accessible primitives.
- **Editor**: Monaco Editor / CodeMirror for "Refinement Loop".

#### API Layer (`apps/api`)

- **Runtime**: Cloudflare Workers (Edge).
- **Framework**: Hono (Lightweight, Web Standards compatible).
- **Validation**: Zod Middleware (Strict Input/Output validation).
- **Streaming**: Server-Sent Events (SSE) for real-time LLM feedback.

### 2.3 Data Flow

1.  **User Input** -> Zod Validation (Client) -> `POST /generate` (API).
2.  **API** -> Zod Validation (Server) -> Prompt Construction.
3.  **Prompt** -> AI Provider (OpenAI/Gemini).
4.  **AI Stream** -> Hono Stream -> SSE -> React Client.
5.  **Client** -> Markdown Renderer -> Live Preview.

---

## 3. Directory Structure (Canonical)

```text
blueprint-generator/
├── apps/
│   ├── api/                  # Backend Service
│   │   ├── src/
│   │   │   ├── index.ts      # Hono Entry
│   │   │   ├── routes/       # API Routes
│   │   │   ├── services/     # AI & Prompt Services
│   │   │   └── lib/          # Utilities
│   │   └── wrangler.toml     # Cloudflare Config
│   └── web/                  # Frontend Application
│       ├── src/
│       │   ├── components/   # UI Components
│       │   ├── hooks/        # Custom Hooks (useBlueprintStream)
│       │   ├── store/        # Zustand Stores
│       │   └── lib/          # API Client
│       └── vite.config.ts
├── packages/
│   └── shared/               # Shared Logic
│       ├── src/
│       │   ├── schema.ts     # Zod Schemas
│       │   └── types.ts      # TypeScript Definitions
│       └── package.json
├── blueprint.md              # THIS FILE
├── task.md                   # Task Tracking
├── plan.md                   # Product Plan
├── feature.md                # Feature Specifications
└── roadmap.md                # Strategic Roadmap
```

---

## 4. Key Design Decisions

### 4.1 Edge-First Infrastructure

**Why Cloudflare Workers?**

- **0ms Cold Start**: Critical for user perception of "instant" generation.
- **Cost**: High request volume free tier, cheap scaling.
- **Simplicity**: No distinct "Deployment Ops" needed beyond `wrangler deploy`.

### 4.2 Strict Schemas (Zod)

We define the API contract in `packages/shared` first. Both Frontend and Backend import the same Zod schema.

- **Benefit**: Impossible to have type mismatches between client and server.
- **Pillar**: **Standardization** & **Stability**.

### 4.3 Streaming Architecture

We do not wait for the full blueprint generation (which can take 30s+). We stream tokens immediately.

- **Benefit**: Perceived latency drops to <500ms.
- **Pillar**: **UX/DX** & **Performance**.

---

## 5. Security & Pillars

- **Security**: No permanent storage of user prompts on backend (Privacy Preserving). API Input Validation via Zod. Standard Security Headers (HSTS, X-Frame-Options, etc.).
- **Modularity**: Prompt templates are isolated from the executing logic.
- **Dynamic Coding**: All AI configurations (Models, Temperatures) are environment variables.

---

## 6. Development Standards

- **Linting**: ESLint + Prettier.
- **Testing**: Vitest for Unit/Integration tests.
- **CI/CD**: GitHub Actions (Lint, Typecheck, Test, Build) on every push/PR.
- **Commands**:
  - `npm run dev`: Starts concurrently.
  - `npm run deploy`: Deploys to Cloudflare.
- **Commit**: Conventional Commits.

---
