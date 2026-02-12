import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { prettyJSON } from "hono/pretty-json";

import generateRoute from "./routes/generate";
import tasksRoute from "./routes/tasks";
import refineRoute from "./routes/refine";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { rateLimit, rateLimitConfigs } from "./middleware/rateLimit";
import { apiKeyAuth } from "./middleware/auth";
import { requestLogger } from "./middleware/logger";
import type { Env } from "./types";
import {
  API_METADATA,
  API_ENDPOINTS,
  CORS_CONFIG,
  ROUTE_PATHS,
} from "./config/constants";

const app = new Hono<{ Bindings: Env }>();

app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: CORS_CONFIG.ORIGIN,
    allowMethods: CORS_CONFIG.ALLOW_METHODS,
    allowHeaders: [...CORS_CONFIG.ALLOW_HEADERS, "x-api-key", "x-request-id"],
    credentials: true,
    maxAge: 86400,
  }),
);
app.use("*", prettyJSON());
app.use("*", requestLogger({ excludePaths: ["/"] }));
app.use("*", apiKeyAuth({ excludePaths: ["/"] }));
app.use("*", rateLimit(rateLimitConfigs.standard));

app.get("/", (c) => {
  return c.json({
    name: API_METADATA.NAME,
    version: API_METADATA.VERSION,
    status: API_METADATA.STATUS,
    endpoints: {
      generate: `${API_ENDPOINTS.GENERATE.method} ${API_ENDPOINTS.GENERATE.path}`,
      tasks: `${API_ENDPOINTS.TASKS.method} ${API_ENDPOINTS.TASKS.path}`,
      refine: `${API_ENDPOINTS.REFINE.method} ${API_ENDPOINTS.REFINE.path}`,
    },
  });
});

app.route(ROUTE_PATHS.GENERATE, generateRoute);
app.route(ROUTE_PATHS.TASKS, tasksRoute);
app.route(ROUTE_PATHS.REFINE, refineRoute);

app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
