# Quick Reference Guide

This guide provides essential commands, shortcuts, and workflows for rapid development with Blueprintify. Keep this page bookmarked for daily reference.

## 🚀 Essential Commands

### Development Workflow

```bash
# Start full development environment
npm run dev:all

# Start frontend only (port 3000)
npm run dev

# Start API only (port 8787)
npm run dev:api

# Install dependencies
npm install

# Clean install (remove node_modules first)
rm -rf node_modules package-lock.json && npm install
```

### Build and Deployment

```bash
# Build frontend for production
npm run build

# Preview production build
npm run preview

# Deploy API to Cloudflare Workers
npm run deploy --workspace=apps/api

# Deploy both frontend and API
npm run deploy:all
```

### Quality Assurance

```bash
# Type checking
npm run typecheck

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run API tests only
npm run test:api

# Run frontend tests only
npm run test:web
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Add and commit changes
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Merge to main (after PR approval)
git checkout main
git pull origin main
git merge feature/your-feature-name
git push origin main
```

## ⌨️ Keyboard Shortcuts

### Code Editor (CodeMirror)

| Shortcut       | Action       |
| -------------- | ------------ |
| `Ctrl/Cmd + S` | Save content |
| `Ctrl/Cmd + Z` | Undo         |
| `Ctrl/Cmd + Y` | Redo         |
| `Ctrl/Cmd + F` | Find         |
| `Ctrl/Cmd + H` | Replace      |
| `Ctrl/Cmd + G` | Go to line   |
| `Tab`          | Indent       |
| `Shift + Tab`  | Unindent     |

### Application Navigation

| Shortcut           | Action                 |
| ------------------ | ---------------------- |
| `Ctrl/Cmd + K`     | Quick command palette  |
| `Ctrl/Cmd + /`     | Toggle shortcuts help  |
| `Escape`           | Close modal/dialog     |
| `Enter`            | Confirm action         |
| `Space`            | Select/toggle checkbox |
| `Arrow Keys`       | Navigate lists/menus   |
| `Ctrl/Cmd + Enter` | Generate blueprint     |

### Browser DevTools

| Shortcut                        | Action            |
| ------------------------------- | ----------------- |
| `F12` or `Ctrl/Cmd + Shift + I` | Open DevTools     |
| `Ctrl/Cmd + Shift + C`          | Element inspector |
| `Ctrl/Cmd + Shift + J`          | Console           |
| `Ctrl/Cmd + Shift + K`          | Network tab       |
| `Ctrl/Cmd + R`                  | Normal refresh    |
| `Ctrl/Cmd + Shift + R`          | Hard refresh      |

## 🎯 Common Workflows

### 1. Setting Up New Development Environment

```bash
# 1. Clone repository
git clone https://github.com/cpa03/blueprintify.git
cd blueprintify

# 2. Install dependencies
npm install

# 3. Setup environment variables
echo "OPENAI_API_KEY=your_api_key_here" > apps/api/.dev.vars

# 4. Start development
npm run dev:all
```

### 2. Creating a New Blueprint

1. **Navigate to application**: `http://localhost:3000`
2. **Click "Create Blueprint"** button
3. **Fill project information**:
   - Project name (required)
   - Description (required)
   - Author (optional)
4. **Select features** from available options
5. **Configure settings** for each selected feature
6. **Click "Generate Blueprint"**
7. **Review and edit** in split-pane view
8. **Download** as ZIP or copy to clipboard

### 3. Adding a New Feature to Blueprintify

```bash
# 1. Create feature branch
git checkout -b feature/new-feature-name

# 2. Implement changes
# - Add React components in apps/web/src/components/
# - Add API routes in apps/api/src/routes/
# - Update types in packages/shared/

# 3. Test changes
npm run test
npm run typecheck
npm run lint

# 4. Commit and push
git add .
git commit -m "feat: add new feature description"
git push origin feature/new-feature-name

# 5. Create Pull Request on GitHub
```

### 4. Debugging API Issues

```bash
# 1. Check API logs
wrangler tail

# 2. Test API endpoint locally
curl -X POST http://localhost:8787/generate \
     -H "Content-Type: application/json" \
     -d '{"config": {"name": "test"}}'

# 3. Check environment variables
cat apps/api/.dev.vars

# 4. Restart API server
npm run dev:api
```

### 5. Performance Optimization

```bash
# 1. Analyze bundle size
npm run build -- --analyze

# 2. Run performance tests
npm run test:performance

# 3. Check Lighthouse scores
npm run build && npm run preview
# Then run Lighthouse on preview URL

# 4. Profile memory usage
# Open Chrome DevTools > Memory > Record
```

## 📁 File Structure Reference

### Key Directories

```
blueprintify/
├── apps/
│   ├── api/                 # Cloudflare Workers API
│   │   ├── src/
│   │   │   ├── routes/      # API route handlers
│   │   │   ├── services/    # Business logic
│   │   │   └── utils/       # Helper functions
│   │   └── .dev.vars        # Environment variables
│   └── web/                 # React frontend
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── pages/       # Page components
│       │   ├── hooks/       # Custom hooks
│       │   └── utils/       # Helper functions
├── packages/
│   └── shared/              # Shared types and utilities
├── docs/                    # Documentation
└── .github/                 # GitHub workflows
```

### Important Files

| File                           | Purpose                          |
| ------------------------------ | -------------------------------- |
| `package.json`                 | Root package configuration       |
| `apps/web/vite.config.ts`      | Frontend build configuration     |
| `apps/api/wrangler.toml`       | Cloudflare Workers configuration |
| `packages/shared/src/types.ts` | TypeScript type definitions      |
| `docs/user-guide.md`           | Complete user documentation      |
| `README.md`                    | Project overview and setup       |

## 🔧 Configuration Templates

### Environment Variables (.dev.vars)

```bash
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
NODE_ENV=development
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "npm run dev --workspace=apps/web",
    "dev:api": "npm run dev --workspace=apps/api",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:api\"",
    "build": "npm run build --workspace=apps/web",
    "test": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "deploy": "npm run deploy --workspace=apps/api"
  }
}
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ["./apps/web/src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          900: "#1e3a8a",
        },
      },
    },
  },
};
```

## 🐛 Common Error Solutions

### "OPENAI_API_KEY not found"

```bash
# Create environment file
echo "OPENAI_API_KEY=your_key_here" > apps/api/.dev.vars

# Restart API server
npm run dev:api
```

### "Port 3000 already in use"

```bash
# Kill process on port 3000
kill -9 $(lsof -ti:3000)

# Or use different port
npm run dev -- --port 3001
```

### "TypeScript compilation errors"

```bash
# Check types
npm run typecheck

# Fix missing imports
npm run lint:fix

# Update dependencies
npm update
```

### "Vitests failing"

```bash
# Run tests in watch mode
npm run test

# Run specific test file
npm run test BlueprintGenerator.test.ts

# Update snapshots
npm run test -- -u
```

## 📊 Performance Metrics

### Target Performance

| Metric                   | Target  | Measurement     |
| ------------------------ | ------- | --------------- |
| First Contentful Paint   | < 1.5s  | Lighthouse      |
| Largest Contentful Paint | < 2.5s  | Lighthouse      |
| Time to Interactive      | < 3.5s  | Lighthouse      |
| Bundle Size              | < 500KB | Bundle analyzer |
| API Response Time        | < 5s    | Server logs     |

### Monitoring Commands

```bash
# Bundle size analysis
npm run build -- --analyze

# Performance testing
npm run test:performance

# Lighthouse CI
npm run build && npm run lighthouse

# API performance monitoring
wrangler tail --format=json
```

## 🚨 Emergency Commands

### System Recovery

```bash
# Reset to clean state
git clean -fd
git reset --hard HEAD/main
npm install

# Emergency deployment
npm run build
npm run deploy --workspace=apps/api

# Rollback deployment
git revert HEAD
npm run deploy --workspace=apps/api
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev:all

# Verbose API logging
VERBOSE=true npm run dev:api

# Performance profiling
NODE_OPTIONS="--prof" npm run dev
```

---

_Keep this guide handy for daily development. Last updated: 2026-02-09_
