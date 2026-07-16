/**
 * API Endpoints Configuration
 *
 * Centralized endpoint definitions using shared route paths and HTTP methods.
 * Flexy says: no hardcoded method strings!
 *
 * @module config/constants/endpoints
 */

import {
  ROUTE_PATHS as SHARED_ROUTE_PATHS,
  HTTP_METHODS as SHARED_HTTP_METHODS,
} from "@blueprint/shared";

export const ROUTE_SUB_PATHS = {
  QUOTA: "/quota",
  CLEAR: "/clear",
  ID_PARAM: "/:id",
  VERIFY: "/verify",
  ROOT: "/",
} as const;

/**
 * API endpoint definitions with path, method, and description.
 * Uses shared ROUTE_PATHS as the single source of truth for paths.
 * Uses shared HTTP_METHODS for method constants.
 */
export const API_ENDPOINTS = {
  GENERATE: {
    path: SHARED_ROUTE_PATHS.GENERATE,
    method: SHARED_HTTP_METHODS.POST,
    description: "Generate blueprint",
  },
  TASKS: {
    path: SHARED_ROUTE_PATHS.TASKS,
    method: SHARED_HTTP_METHODS.POST,
    description: "Generate tasks",
  },
  REFINE: {
    path: SHARED_ROUTE_PATHS.REFINE,
    method: SHARED_HTTP_METHODS.POST,
    description: "Refine content",
  },
  EXPORT: {
    path: SHARED_ROUTE_PATHS.EXPORT,
    method: SHARED_HTTP_METHODS.POST,
    description: "Export project",
  },
  IMPORT: {
    path: SHARED_ROUTE_PATHS.IMPORT,
    method: SHARED_HTTP_METHODS.POST,
    description: "Import project",
  },
  STORAGE_QUOTA: {
    path: `${SHARED_ROUTE_PATHS.STORAGE}${ROUTE_SUB_PATHS.QUOTA}`,
    method: SHARED_HTTP_METHODS.GET,
    description: "Get storage quota",
  },
  STORAGE_CLEAR: {
    path: `${SHARED_ROUTE_PATHS.STORAGE}${ROUTE_SUB_PATHS.CLEAR}`,
    method: SHARED_HTTP_METHODS.DELETE,
    description: "Clear storage",
  },
  SHARE_CREATE: {
    path: SHARED_ROUTE_PATHS.SHARE,
    method: SHARED_HTTP_METHODS.POST,
    description: "Create shareable blueprint link",
  },
  SHARE_GET: {
    path: `${SHARED_ROUTE_PATHS.SHARE}${ROUTE_SUB_PATHS.ID_PARAM}`,
    method: SHARED_HTTP_METHODS.GET,
    description: "Get shared blueprint by ID",
  },
  SHARE_DELETE: {
    path: `${SHARED_ROUTE_PATHS.SHARE}${ROUTE_SUB_PATHS.ID_PARAM}`,
    method: SHARED_HTTP_METHODS.DELETE,
    description: "Delete shared blueprint",
  },
} as const;

// Route paths - re-exported from shared package as single source of truth
export { SHARED_ROUTE_PATHS as ROUTE_PATHS };
