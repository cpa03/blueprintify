# Contributing to Blueprintify

Thank you for your interest in contributing to Blueprintify! This guide will help you get started and ensure your contributions follow our project standards.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 8+ (with workspaces support)
- OpenAI API key (or compatible provider)
- Git

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/blueprintify.git
   cd blueprintify
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Create apps/api/.dev.vars with your OpenAI API key:
   echo "OPENAI_API_KEY=your_openai_api_key_here" > apps/api/.dev.vars
   ```

4. **Start Development**

   ```bash
   # Start both frontend and API
   npm run dev:all

   # Or start separately:
   npm run dev        # Frontend only (port 3000)
   npm run dev:api    # API only (port 8787)
   ```

## 🏗️ Project Structure

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

## 📝 Code Standards

### TypeScript

- **Strict Mode**: Use strict TypeScript (`strict: true` in tsconfig)
- **Types vs Interfaces**:
  - Use `interface` for object shapes
  - Use `type` for unions, intersects, and computed types
- **Return Types**: Always include explicit return types on public functions
- **No `any`**: Use `unknown` when type is uncertain

### React

- **Functional Components**: Use functional components with hooks
- **Composition**: Prefer composition over inheritance
- **Performance**:
  - Use `React.memo` for expensive renders
  - Wrap callbacks with `useCallback`
  - Wrap computed values with `useMemo`

### Cloudflare Workers (API)

- **Framework**: Use Hono framework patterns
- **Validation**: Validate all inputs with Zod
- **Responses**: Return consistent JSON response shapes
- **Error Handling**: Handle errors with proper HTTP status codes

### Code Style

- **ESLint**: Follow ESLint configuration
- **Naming**: Use descriptive variable and function names
- **Comments**: Add comments for complex logic, avoid obvious comments

## 🧪 Testing

### Running Tests

```bash
# Run API tests
npm run test:api

# Type check
npm run typecheck

# Lint code
npm run lint
```

### Test Requirements

- All new features must include tests
- Maintain test coverage above 80%
- Use descriptive test names
- Test both happy path and error cases

## 🔄 Development Workflow

### Branch Strategy

1. **Create Branch**: Work on `agent/role-name` branches (e.g., `agent/technical-writer`)
2. **Commits**: Follow Conventional Commits format: `type(scope): subject`
   - `feat`: New feature
   - `fix`: Bug fix
   - `chore`: Maintenance
   - `docs`: Documentation
   - `refactor`: Code refactoring
   - `test`: Testing
   - `perf`: Performance improvement

### Pull Request Process

1. **Create PR**: From your `agent/role-name` branch to main
2. **Description**: Include clear description of changes
3. **Checks**: Ensure all CI checks pass
4. **Review**: Wait for code review approval
5. **Merge**: Maintain clean commit history

## 🤖 AI Agent System

This project uses the OpenCode AI agent system. When working with agents:

### Agent Roles

- **Technical Writer** - Documentation maintenance and user guides
- **Frontend Engineer** - React components and UI development
- **Backend Engineer** - API development and database architecture
- **Software Architect** - System design and architecture decisions
- **Security Engineer** - Security audits and vulnerability assessments
- **DevOps Engineer** - CI/CD pipelines and deployment automation
- **Quality Assurance** - Testing and code review processes

### Skills Usage

Leverage available skills for common tasks:

- `docs-update` - Standard documentation updates
- `react-component-create` - React component creation
- `api-endpoint-create` - API endpoint development
- `security-audit` - Security vulnerability analysis
- `test-suite-create` - Comprehensive test creation

## 🔒 Security Guidelines

- **NEVER** read or output `.env` files
- **NEVER** log API keys or tokens
- **ALWAYS** validate user inputs
- **ALWAYS** sanitize outputs (especially markdown/HTML)
- Use parameterized queries for database operations

## 📚 Documentation

### Documentation Standards

- Keep documentation up-to-date with code changes
- Use clear, concise language
- Include examples for complex features
- Test documentation by following instructions exactly

### Documentation Updates

- Update README.md for user-facing changes
- Update inline code comments for developers
- Add technical notes to `docs/findings.md` for significant changes

## 🐛 Bug Reports

When reporting bugs:

1. **Search**: Check existing issues first
2. **Describe**: Clear description of the problem
3. **Reproduce**: Steps to reproduce the issue
4. **Environment**: Include OS, Node.js version, browser version
5. **Expected**: What should happen vs. what actually happens

## 💡 Feature Requests

When suggesting features:

1. **Problem**: What problem does this solve?
2. **Solution**: How do you envision the solution?
3. **Alternatives**: What alternatives have you considered?
4. **Context**: Additional context about the request

## 📋 Quality Checklist

Before submitting a PR:

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Type checking succeeds
- [ ] Linting passes
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] Security guidelines are followed
- [ ] Performance considerations are addressed

## 🤝 Community

- Be respectful and inclusive
- Help others learn and grow
- Focus on what is best for the community
- Show empathy towards other community members

## 📞 Getting Help

- **Documentation**: Check existing docs and README
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Maintainers**: Tag maintainers for urgent issues

Thank you for contributing to Blueprintify! 🎉
