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

- **2026-02-20**: Added JSDoc documentation to `db/index.ts` utility functions and error classes. The `generateId`, `serializeJSON`, `deserializeJSON`, and `getDatabaseService` functions now have proper documentation with `@param`, `@returns`, and `@throws` annotations. Error classes (`DatabaseError`, `ValidationError`, `NotFoundError`) are documented with `@extends` and constructor parameter documentation.
- **2026-02-20**: Added JSDoc documentation to `types.ts`. This module defines all TypeScript types and interfaces for the API including environment bindings, context types, and validated request contexts. Proper documentation is essential for developers to understand the type system and how to use context types correctly.
- **2026-02-20**: Added JSDoc documentation to `middleware/logger.ts` and `middleware/auth.ts`. These middleware modules handle request logging and API key authentication respectively, and require proper documentation for maintainability and security awareness.
- **2026-02-20**: Added JSDoc documentation to `config/constants.ts`. This module provides centralized configuration constants and requires documentation for the exported getter functions.
- **2026-02-20**: Added comprehensive JSDoc documentation to `utils/secureLog.ts`. This security utility module handles sensitive data sanitization and requires proper documentation for maintainability and to help developers understand the security implications of logging errors.
- **2026-02-19**: Added JSDoc documentation to public API functions in `services/openai.ts` and `utils/stream.ts`. These modules are consumed by controllers and routes, so proper documentation is essential for maintainability.
- **2026-02-19**: Added JSDoc documentation to `utils/retry.ts`. This utility module provides exponential backoff retry logic consumed by the OpenAI service and needs proper `@param`, `@returns`, and `@throws` annotations per code-style-guidelines.md.
- **2026-02-19**: Added JSDoc documentation to controllers (`base.controller.ts`, `generate.controller.ts`, `refine.controller.ts`, `tasks.controller.ts`), `services/prompts.ts`, and `di/container.ts`. Controllers are the entry point for API routes and need clear documentation for maintainability.
