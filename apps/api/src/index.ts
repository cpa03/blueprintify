import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { prettyJSON } from "hono/pretty-json";

import generateRoute from "./routes/generate";
import tasksRoute from "./routes/tasks";
import refineRoute from "./routes/refine";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import type { Env } from "./types";

// ===== App Initialization =====
const app = new Hono<{ Bindings: Env }>();

// ===== Middleware =====
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("*", prettyJSON());

// ===== Health Check =====
app.get("/", (c) => {
  const startTime = Date.now();
  return c.json({
    name: "Blueprint Generator API",
    version: "1.0.0",
    status: "healthy",
    environment: c.env.ENVIRONMENT || "development",
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
    endpoints: {
      generate: "POST /generate",
      tasks: "POST /tasks",
      refine: "POST /refine",
      health: "GET /health",
    },
  });
});

// ===== Detailed Health Check =====
app.get("/health", async (c) => {
  const startTime = Date.now();
  type HealthStatus = "healthy" | "degraded" | "unhealthy";
  type CheckStatus = "healthy" | "warning" | "unhealthy" | "unknown";

  const checks = {
    status: "healthy" as HealthStatus,
    environment: c.env.ENVIRONMENT || "development",
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
    checks: {
      openai_api: {
        status: "unknown" as CheckStatus,
        message: "Not checked",
      },
      memory: {
        status: "healthy" as CheckStatus,
        usage: "N/A",
      },
    },
  };

  // Check OpenAI API connectivity (optional, only if API key is available)
  try {
    if (c.env.OPENAI_API_KEY) {
      // Simple connectivity check - we could make a real API call here
      checks.checks.openai_api = {
        status: "healthy",
        message: "API key configured",
      };
    } else {
      checks.checks.openai_api = {
        status: "warning",
        message: "API key not configured",
      };
    }
  } catch (error) {
    checks.checks.openai_api = {
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Unknown error",
    };
    checks.status = "degraded";
  }

  // Overall status determination
  const hasUnhealthy = Object.values(checks.checks).some(
    (check) => check.status === "unhealthy",
  );
  const hasWarning = Object.values(checks.checks).some(
    (check) => check.status === "warning",
  );

  if (hasUnhealthy) {
    checks.status = "unhealthy";
  } else if (hasWarning) {
    checks.status = "degraded";
  }

  const statusCode =
    checks.status === "healthy"
      ? 200
      : checks.status === "degraded"
        ? 200
        : 503;

  return c.json(checks, statusCode);
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
