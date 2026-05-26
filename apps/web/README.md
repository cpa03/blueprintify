# Blueprint Generator Web

> React frontend for the Blueprint Generator application with split-pane editor and real-time AI generation.

## Overview

The web application is a React 19 SPA built with Vite. It provides a wizard interface for configuring project details, generates blueprints using AI, and offers a split-pane editor for viewing and editing generated content.

## Tech Stack

- **Framework**: [React](https://react.dev/) 19
- **Build Tool**: [Vite](https://vitejs.dev/) 7
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 3
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Code Editor**: [CodeMirror](https://codemirror.net/) (via @uiw/react-codemirror)
- **Markdown**: [React Markdown](https://remarkjs.github.io/react-markdown/) + [rehype](https://github.com/rehypejs/rehype)
- **Animations**: CSS spring/transition utility classes
- **Components**: [Radix UI](https://www.radix-ui.com/) (accessible primitives)
- **Testing**: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) + [Speed Insights](https://vercel.com/speed-insights)

## Quick Start

### Prerequisites

- Node.js 22+
- npm 8+

### Installation

```bash
# Install dependencies from root
npm install
```

### Development

```bash
# Start frontend development server (port 3000)
npm run dev

# Or from this directory
cd apps/web
npm run dev
```

### Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Type checking
npm run typecheck
```

### Build

```bash
# Production build
npm run build

# Build with bundle analysis
npm run analyze
```

## Project Structure

```
apps/web/
├── src/
│   ├── components/         # React components
│   │   ├── editor/         # Editor-related components
│   │   │   ├── Editor.tsx         # Split-pane markdown editor
│   │   │   ├── EditorHeader.tsx  # Editor toolbar
│   │   │   └── EditorToolbar.tsx # Editor actions
│   │   ├── wizard/         # Wizard step components
│   │   │   ├── Wizard.tsx        # Main wizard container
│   │   │   ├── StepInfo.tsx      # Project info step
│   │   │   ├── StepStack.tsx     # Tech stack selection
│   │   │   ├── StepFeatures.tsx  # Features selection
│   │   │   ├── StepReview.tsx    # Review step
│   │   │   └── StepGenerating.tsx # Generation in progress
│   │   ├── Header.tsx
│   │   ├── StepIndicator.tsx
│   │   ├── TemplateGrid.tsx
│   │   ├── Toast.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ... (40+ components)
│   ├── config/            # Configuration
│   │   ├── constants.ts    # UI strings and constants
│   │   ├── env.ts         # Environment variables
│   │   ├── icons.ts       # SVG icon components
│   │   ├── keys.ts        # Keyboard shortcut definitions
│   │   └── theme.ts       # Theme configuration
│   ├── context/           # React contexts
│   │   └── ReducedMotionContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useBlueprintStream.ts   # SSE streaming handler
│   │   ├── useAutoSaveToast.ts     # Auto-save notifications
│   │   ├── useFocusTrap.ts         # Keyboard focus trap
│   │   ├── useLastSaved.ts         # Last saved timestamp
│   │   └── ... (10+ hooks)
│   ├── integration/       # Integration tests
│   ├── lib/               # Utility libraries
│   │   ├── api.ts              # API client
│   │   ├── export.ts           # Export utilities
│   │   ├── security.ts         # XSS protection (DOMPurify)
│   │   ├── storage.ts          # LocalStorage wrapper
│   │   └── storageAdapter.ts   # Storage quota management
│   ├── store/             # Zustand stores
│   │   ├── wizard.ts      # Wizard state
│   │   ├── editor.ts      # Editor state
│   │   ├── persistence.ts # LocalStorage persistence
│   │   ├── toast.ts       # Toast notifications
│   │   └── index.ts
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── tailwind.config.js
├── vite.config.ts
├── vitest.config.ts
└── package.json
```

## Key Features

### Wizard Flow

1. **Project Info** - Name, description, target audience
2. **Tech Stack** - Select frontend, backend, database, and tools
3. **Features** - Choose required features (auth, API, testing, etc.)
4. **Review** - Verify configuration
5. **Generating** - AI generates blueprint and tasks

### Split-Pane Editor

The editor provides a live preview of generated content:

- **Blueprint Tab** - Architecture documentation
- **Tasks Tab** - Actionable task list
- CodeMirror integration with syntax highlighting
- Markdown preview with GFM support
- Copy to clipboard functionality

### Auto-Save

Session state is automatically persisted to localStorage:

- Wizard form data
- Generated content
- Last saved timestamp

### Export Options

- **ZIP** - Download complete `.docs/` folder
- **JSON** - Machine-readable format
- **Markdown** - Plain markdown files

## State Management

The application uses Zustand for state management:

```typescript
// Wizard store
import { useWizardStore } from "./store";
const { currentStep, projectName, setProjectName } = useWizardStore();

// Editor store
import { useEditorStore } from "./store";
const { blueprintContent, isGenerating, setBlueprintContent } = useEditorStore();
```

## API Integration

The frontend communicates with the API via fetch:

```typescript
// Streaming generation
const response = await fetch("/generate", {
  method: "POST",
  body: JSON.stringify(wizardState),
});

// Handle SSE stream
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Process chunk...
}
```

## Security

- **XSS Protection**: All markdown is sanitized with DOMPurify before rendering
- **Input Validation**: Zod schemas validate all API requests
- **API Key Storage**: Keys stored server-side only

## Testing

Tests are co-located with source files:

```bash
# Component tests
npm run test -- src/components/Editor.test.tsx

# Store tests
npm run test -- src/store/editor.test.ts

# Integration tests
npm run test -- src/integration/
```

## Keyboard Shortcuts

| Shortcut           | Action                        |
| ------------------ | ----------------------------- |
| `?`                | Show keyboard shortcuts modal |
| `Cmd/Ctrl + E`     | Toggle editor panel           |
| `Escape`           | Cancel generation             |
| `Cmd/Ctrl + Enter` | Submit wizard                 |

## Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
npm run build
vercel deploy
```

### Static Hosting

The build output is a static SPA in the `dist/` folder:

```bash
# Preview locally
npm run preview
```

## Related Documentation

- [Main README](../../README.md)
- [User Guide](../../docs/user-guide.md)
- [LocalStorage Schema](../../docs/localstorage-schema.md)
- [Export/Import Specs](../../docs/export-import-specs.md)
