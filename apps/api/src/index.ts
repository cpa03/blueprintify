import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { prettyJSON } from "hono/pretty-json";

import generateRoute from "./routes/generate";
import tasksRoute from "./routes/tasks";
import refineRoute from "./routes/refine";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import type { Env } from "./types";
import { API_METADATA, API_ENDPOINTS, CORS_CONFIG } from "./config/constants";

// ===== App Initialization =====
const app = new Hono<{ Bindings: Env }>();

// ===== Middleware =====
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: CORS_CONFIG.ORIGIN,
    allowMethods: CORS_CONFIG.ALLOW_METHODS,
    allowHeaders: CORS_CONFIG.ALLOW_HEADERS,
  }),
);
app.use("*", prettyJSON());

// ===== Health Check =====
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

// ===== Routes =====
app.route("/generate", generateRoute);
app.route("/tasks", tasksRoute);
app.route("/refine", refineRoute);

// ===== Error Handler =====
app.onError(errorHandler);

// ===== 404 Handler =====
app.notFound(notFoundHandler);

export default app;
