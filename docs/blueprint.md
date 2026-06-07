# Blueprint: Architecture & Design

> **Single Source of Truth** - This document defines the architecture, constraints, and design principles for the Blueprintify project.

## Project Overview

**Name**: Blueprintify  
**Repository**: cpa03/blueprintify  
**Description**: AI-powered blueprint generation tool with real-time streaming and collaborative editing

## Architecture

### Core System

```
┌─────────────────┐    HTTP/SSE    ┌─────────────────┐
│   React Web     │◄──────────────►│  Cloudflare     │
│   Frontend      │                │  Workers API    │
│   (Vite)        │                │  (Hono)         │
└─────────────────┘                └─────────────────┘
         │                                   │
         │                                   ▼
         │                          ┌─────────────────┐
         │                          │   AI Services   │
         │                          │ (OpenAI/etc)    │
         │                          └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Local Storage │
│   (Persistence) │
└─────────────────┘
```

### Directory Structure

```
blueprintify/
├── apps/
│   ├── api/          # Cloudflare Workers API (Hono)
│   └── web/          # React frontend (Vite)
├── packages/
│   └── shared/       # Shared types and utilities
├── .opencode/
│   ├── agent/        # Agent definitions
│   ├── skill/        # Reusable skills
│   ├── command/      # Custom commands
│   └── plugin/       # Plugins (hooks)
└── docs/             # Documentation
```

## Technology Stack

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with React hooks)
- **Testing**: Vitest + Testing Library

### Backend

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Language**: TypeScript
- **Validation**: Zod
- **Testing**: Vitest

### Infrastructure

- **Platform**: Cloudflare Workers
- **Environment**: ARM64 (ubuntu-24.04-arm)
- **CI/CD**: GitHub Actions with automated deployment
- **Environments**: Development, Staging, Production with isolation
- **Database**: Cloudflare D1 with environment-specific bindings
- **Security**: Production-ready deployment gates and monitoring

## Design Principles

### 1. AI Agent System

- 28 specialized agents with distinct roles
- Skills-based workflow system
- Branch-based agent operations (`agent/<role>`)

### 2. Type Safety

- Strict TypeScript configuration
- Shared schemas via Zod
- End-to-end type validation

### 3. Performance

- Streaming responses for real-time generation
- Component memoization
- Lazy loading where appropriate

### 4. Security

- Input validation with Zod
- Comprehensive XSS protection via DOMPurify
- LocalStorage security with quota management and validation
- File import/export security with type validation and sanitization
- Real-time input sanitization during editing
- No secrets in code
- Proper error handling without information leakage
- Content Security Policy headers and security headers implemented

## Constraints

### Technical Constraints

- **Model**: Use `opencode/deepseek-v4-flash-free` exclusively for all AI agents
- **Platform**: Must deploy to Cloudflare Workers
- **Environment**: CI runners must use `ubuntu-24.04-arm`

### Code Standards

- **Conventional Commits**: `type(scope): subject`
- **No Any Types**: Use `unknown` when type is uncertain
- **Functional Components**: React hooks only
- **Interface over Type**: For object shapes

### Git Workflow

- Work on `agent` branch for specialized tasks
- Work on `orchestrator` branch for management operations
- PR requires passing CI checks

## API Design

### Core Endpoints

- `POST /generate` - Generate blueprint with streaming
- `POST /refine` - Refine existing blueprint
- `GET /tasks/{id}` - Get task status

### Error Handling

- Standardized error response format
- Proper HTTP status codes
- Validation errors with field details
- Error timestamps and types for debugging

## Frontend Architecture

### Component Structure

- Wizard-based workflow (5 steps: Project Details, Tech Stack, Features, Review, Generate)
- Split-pane editor view
- Real-time markdown rendering
- Responsive design with Tailwind

### State Management

- Local component state with React hooks
- Session persistence via localStorage
- Real-time updates via Server-Sent Events

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-19  
**Last Orchestration Cycle**: 2026-02-18 - Management cycle executed, roadmap aligned, all issues triaged
**Maintainer**: Software Architect (The Orchestrator)
