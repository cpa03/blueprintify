import type { Context as HonoContext } from "hono";

declare module "hono" {
  interface ContextVariableMap {
    validatedData: unknown;
  }
}

export type Context = HonoContext;
