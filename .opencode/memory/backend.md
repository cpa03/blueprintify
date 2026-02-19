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
- **2026-02-19**: Added JSDoc documentation to `utils/retry.ts`. This utility module provides exponential backoff retry logic consumed by the OpenAI service and needs proper `@param`, `@returns`, and `@throws` annotations per code-style-guidelines.md.
- **2026-02-19**: Added JSDoc documentation to controllers (`base.controller.ts`, `generate.controller.ts`, `refine.controller.ts`, `tasks.controller.ts`), `services/prompts.ts`, and `di/container.ts`. Controllers are the entry point for API routes and need clear documentation for maintainability.
