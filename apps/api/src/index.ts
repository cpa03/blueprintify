/**
 * Blueprint Generator API
 *
 * Main entry point for the Cloudflare Workers API.
 * Configures Hono app with middleware, routes, and error handling.
 *
 * @module index
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { prettyJSON } from "hono/pretty-json";
import { etag } from "hono/etag";

import generateRoute from "./routes/generate";
import tasksRoute from "./routes/tasks";
import refineRoute from "./routes/refine";
import exportRoute from "./routes/export";
import importRoute from "./routes/import";
import storageRoute from "./routes/storage";
import shareRoute from "./routes/share";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { rateLimit, rateLimitConfigs } from "./middleware/rateLimit";
import { apiKeyAuth } from "./middleware/auth";
import { requestLogger } from "./middleware/logger";
import { bodyLimit, bodyLimitConfigs } from "./middleware/bodyLimit";
import type { Env, AppVariables } from "./types";
import { loadConfig } from "./config/env";
import {
  API_METADATA,
  API_ENDPOINTS,
  API_HEADERS,
  CORS_CONFIG,
  ROUTE_PATHS,
  CACHE_CONFIG,
  ERROR_MESSAGES,
  setEnvConfig,
} from "./config/constants";
import { initializeContainer } from "./di";

initializeContainer();

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

app.use("*", secureHeaders());
app.use("*", etag());
app.use("*", async (c, next) => {
  await next();
  c.res.headers.set(
    API_HEADERS.SECURITY.CROSS_ORIGIN_OPENER_POLICY,
    API_HEADERS.SECURITY.SAME_ORIGIN
  );
  c.res.headers.set(
    API_HEADERS.SECURITY.CROSS_ORIGIN_RESOURCE_POLICY,
    API_HEADERS.SECURITY.SAME_ORIGIN
  );
});
app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowedOrigin = CORS_CONFIG.ORIGIN;
      if (!allowedOrigin || allowedOrigin === "*") return origin || "*";
      return allowedOrigin;
    },
    allowMethods: CORS_CONFIG.ALLOW_METHODS,
    allowHeaders: [
      ...CORS_CONFIG.ALLOW_HEADERS,
      API_HEADERS.CUSTOM.API_KEY,
      API_HEADERS.CUSTOM.REQUEST_ID,
    ],
    credentials: true,
    maxAge: CORS_CONFIG.MAX_AGE,
  })
);
app.use("*", prettyJSON());
app.use("*", bodyLimit(bodyLimitConfigs.standard));
app.use("*", requestLogger({ excludePaths: [ROUTE_PATHS.ROOT] }));
app.use("*", apiKeyAuth({ excludePaths: [ROUTE_PATHS.ROOT] }));
app.use("*", rateLimit(rateLimitConfigs.standard));

app.get(ROUTE_PATHS.ROOT, (c) => {
  c.header(
    API_HEADERS.CACHE_CONTROL.HEADER_NAME,
    API_HEADERS.CACHE_CONTROL.PUBLIC_WITH_REVALIDATE(
      CACHE_CONFIG.ROOT_MAX_AGE,
      CACHE_CONFIG.ROOT_STALE_WHILE_REVALIDATE
    )
  );
  c.header(
    API_HEADERS.SERVER_TIMING.HEADER,
    API_HEADERS.SERVER_TIMING.ENTRY("app", API_METADATA.NAME, 0)
  );
  c.header(API_HEADERS.CDN.CDN_CACHE_CONTROL, `public, max-age=${CACHE_CONFIG.ROOT_MAX_AGE}`);
  c.header(
    API_HEADERS.CDN.CLOUDFLARE_CACHE_CONTROL,
    `public, max-age=${CACHE_CONFIG.ROOT_MAX_AGE}`
  );
  return c.json({
    name: API_METADATA.NAME,
    version: API_METADATA.VERSION,
    status: API_METADATA.STATUS,
    runtime: {
      platform: ERROR_MESSAGES.PLATFORM_RUNTIME,
      region: c.req.header(API_HEADERS.CF_PROPERTIES.IP_COUNTRY) || ERROR_MESSAGES.PLATFORM_UNKNOWN,
    },
    endpoints: {
      generate: `${API_ENDPOINTS.GENERATE.method} ${API_ENDPOINTS.GENERATE.path}`,
      tasks: `${API_ENDPOINTS.TASKS.method} ${API_ENDPOINTS.TASKS.path}`,
      refine: `${API_ENDPOINTS.REFINE.method} ${API_ENDPOINTS.REFINE.path}`,
      export: `${API_ENDPOINTS.EXPORT.method} ${API_ENDPOINTS.EXPORT.path}`,
      import: `${API_ENDPOINTS.IMPORT.method} ${API_ENDPOINTS.IMPORT.path}`,
      storageQuota: `${API_ENDPOINTS.STORAGE_QUOTA.method} ${API_ENDPOINTS.STORAGE_QUOTA.path}`,
      storageClear: `${API_ENDPOINTS.STORAGE_CLEAR.method} ${API_ENDPOINTS.STORAGE_CLEAR.path}`,
      shareCreate: `${API_ENDPOINTS.SHARE_CREATE.method} ${API_ENDPOINTS.SHARE_CREATE.path}`,
      shareGet: `${API_ENDPOINTS.SHARE_GET.method} ${API_ENDPOINTS.SHARE_GET.path}`,
      shareDelete: `${API_ENDPOINTS.SHARE_DELETE.method} ${API_ENDPOINTS.SHARE_DELETE.path}`,
    },
  });
});

app.route(ROUTE_PATHS.GENERATE, generateRoute);
app.route(ROUTE_PATHS.TASKS, tasksRoute);
app.route(ROUTE_PATHS.REFINE, refineRoute);
app.route(ROUTE_PATHS.EXPORT, exportRoute);
app.route(ROUTE_PATHS.IMPORT, importRoute);
app.route(ROUTE_PATHS.STORAGE, storageRoute);
app.route(ROUTE_PATHS.SHARE, shareRoute);

app.onError(errorHandler);
app.notFound(notFoundHandler);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const config = loadConfig(env as unknown as Record<string, string | undefined>);
    setEnvConfig(config);

    if (env.ANALYTICS) {
      ctx.waitUntil(
        Promise.resolve(
          env.ANALYTICS.writeDataPoint({
            blobs: [request.url, request.method, new Date().toISOString()],
          })
        )
      );
    }

    return app.fetch(request, env, ctx);
  },
};
