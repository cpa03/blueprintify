/**
 * Refine Controller
 * Handles business logic for content refinement endpoint
 */
import type { RefineRequest } from "@blueprint/shared";
import type { Context } from "hono";
import type { Env } from "../types";
/**
 * Refines content based on user instruction using AI
 *
 * @param request - The validated refine request
 * @param c - Hono context with environment bindings
 * @returns SSE stream response
 */
export declare function refineContent(request: RefineRequest, c: Context<{
    Bindings: Env;
}>): Promise<Response>;
/**
 * Controller export for route handler integration
 */
export declare const refineController: {
    refineContent: typeof refineContent;
};
