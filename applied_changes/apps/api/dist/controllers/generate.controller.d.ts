/**
 * Generate Controller
 * Handles business logic for blueprint generation endpoint
 */
import type { BlueprintRequest } from "@blueprint/shared";
import type { Context } from "hono";
import type { Env } from "../types";
/**
 * Generates a blueprint stream based on user request
 *
 * @param request - The validated blueprint request
 * @param c - Hono context with environment bindings
 * @returns SSE stream response
 */
export declare function generateBlueprint(request: BlueprintRequest, c: Context<{
    Bindings: Env;
}>): Promise<Response>;
/**
 * Controller export for route handler integration
 */
export declare const generateController: {
    generateBlueprint: typeof generateBlueprint;
};
