/**
 * Tasks Controller
 * Handles business logic for task generation endpoint
 */
import type { TaskGenerationRequest } from "@blueprint/shared";
import type { Context } from "hono";
import type { Env } from "../types";
/**
 * Generates a task breakdown stream based on blueprint
 *
 * @param request - The validated task generation request
 * @param c - Hono context with environment bindings
 * @returns SSE stream response
 */
export declare function generateTasks(request: TaskGenerationRequest, c: Context<{
    Bindings: Env;
}>): Promise<Response>;
/**
 * Controller export for route handler integration
 */
export declare const tasksController: {
    generateTasks: typeof generateTasks;
};
