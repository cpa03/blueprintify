import type { BlueprintRequest, TaskGenerationRequest, RefineRequest } from '@blueprint/shared';
interface StreamEventHandlers {
    onChunk: (content: string) => void;
    onError: (error: string) => void;
    onDone: () => void;
}
/**
 * Generate a blueprint document
 */
export declare function generateBlueprint(request: BlueprintRequest, handlers: StreamEventHandlers): Promise<void>;
/**
 * Generate tasks from a blueprint
 */
export declare function generateTasks(request: TaskGenerationRequest, handlers: StreamEventHandlers): Promise<void>;
/**
 * Refine a section of content
 */
export declare function refineContent(request: RefineRequest, handlers: StreamEventHandlers): Promise<void>;
/**
 * Check API health
 */
export declare function checkHealth(): Promise<boolean>;
export {};
