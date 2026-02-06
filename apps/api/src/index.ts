import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { prettyJSON } from "hono/pretty-json";

import generateRoute from "./routes/generate";
import tasksRoute from "./routes/tasks";
import refineRoute from "./routes/refine";
import apiKeysRoute from "./routes/api-keys";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import {
  rateLimit,
  strictRateLimit,
  lenientRateLimit,
} from "./middleware/rateLimit";
import { authenticateApiKey, optionalApiKeyAuth } from "./middleware/auth";
import {
  securityHeaders,
  requestSanitizer,
  validateOrigin,
} from "./middleware/security";
import { requestLogger, auditLogger } from "./middleware/logging";
import type { Env } from "./types";

// ===== App Initialization =====
const app = new Hono<{ Bindings: Env }>();

// ===== Security Middleware =====
app.use("*", securityHeaders);
app.use("*", requestSanitizer);
app.use("*", requestLogger);

// ===== CORS Configuration =====
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://blueprintify.pages.dev",
  "https://blueprintify.workers.dev",
];

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use("*", validateOrigin(allowedOrigins));
app.use("*", prettyJSON());

// ===== Rate Limiting =====
app.get("/", rateLimit({ maxRequests: 1000 }));
app.use("/generate", rateLimit({ maxRequests: 10 }));
app.use("/tasks", rateLimit({ maxRequests: 10 }));
app.use("/refine", rateLimit({ maxRequests: 10 }));
app.use("*", rateLimit());

// ===== Health Check =====
app.get("/", (c) => {
  return c.json({
    name: "Blueprint Generator API",
    version: "1.0.0",
    status: "healthy",
    endpoints: {
      generate: "POST /generate",
      tasks: "POST /tasks",
      refine: "POST /refine",
    },
  });
});

// ===== Routes =====
app.route("/generate", generateRoute);
app.route("/tasks", tasksRoute);
app.route("/refine", refineRoute);
app.route("/api-keys", apiKeysRoute);

// ===== Error Handler =====
app.onError(errorHandler);

// ===== 404 Handler =====
app.notFound(notFoundHandler);

export default app;
