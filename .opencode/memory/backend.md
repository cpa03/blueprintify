# Backend Patterns & Conventions

## API Standards

- Use proper HTTP status codes.
- Validate inputs using Zod.

## Database Standards

- Use indexes for frequently queried columns.

## Documentation Standards

- All exported functions must have JSDoc documentation per `docs/code-style-guidelines.md`
- Include `@param`, `@returns`, and `@throws` annotations for public APIs
- Document error behavior for functions that can throw

## Lessons Learned

- **2026-02-19**: Added JSDoc documentation to public API functions in `services/openai.ts` and `utils/stream.ts`. These modules are consumed by controllers and routes, so proper documentation is essential for maintainability.
- **2026-02-19**: Removed unused type imports from `db/index.test.ts`. Type-only imports that are not used should be removed to keep code clean and avoid ESLint warnings. PR #577.
