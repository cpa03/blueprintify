import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { prettyJSON } from "hono/pretty-json";

import generateRoute from "./routes/generate";
import tasksRoute from "./routes/tasks";
import refineRoute from "./routes/refine";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { rateLimit } from "./middleware/rateLimit";
import { apiKeyAuth } from "./middleware/auth";
import { enhancedSecurityHeaders } from "./middleware/security";
import { requestLogger, securityLogger } from "./middleware/logger";
import type { Env } from "./types";
import { API_METADATA, API_ENDPOINTS, CORS_CONFIG } from "./config/constants";

// ===== App Initialization =====
const app = new Hono<{ Bindings: Env }>();

// ===== Middleware =====
app.use("*", requestLogger());
app.use("*", securityLogger());
app.use("*", enhancedSecurityHeaders());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: CORS_CONFIG.ORIGIN,
    allowMethods: CORS_CONFIG.ALLOW_METHODS,
    allowHeaders: CORS_CONFIG.ALLOW_HEADERS,
    credentials: CORS_CONFIG.CREDENTIALS,
    maxAge: CORS_CONFIG.MAX_AGE,
  }),
);
app.use("*", rateLimit());
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
const protectedGenerate = new Hono<{ Bindings: Env }>();
protectedGenerate.use("*", apiKeyAuth());
protectedGenerate.route("/", generateRoute);

const protectedTasks = new Hono<{ Bindings: Env }>();
protectedTasks.use("*", apiKeyAuth());
protectedTasks.route("/", tasksRoute);

const protectedRefine = new Hono<{ Bindings: Env }>();
protectedRefine.use("*", apiKeyAuth());
protectedRefine.route("/", refineRoute);

app.route("/generate", protectedGenerate);
app.route("/tasks", protectedTasks);
app.route("/refine", protectedRefine);

// ===== Error Handler =====
app.onError(errorHandler);

// ===== 404 Handler =====
app.notFound(notFoundHandler);

export default app;
