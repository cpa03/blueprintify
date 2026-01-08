import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { prettyJSON } from "hono/pretty-json";
import { isAPIError, errorToResponse } from "./lib/errors";

import generateRoute from "./routes/generate";
import tasksRoute from "./routes/tasks";
import refineRoute from "./routes/refine";
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

// ===== Error Handler =====
app.onError((err, c) => {
  console.error("API Error:", err);

  // Handle APIError instances with standardized responses
  if (isAPIError(err)) {
    const errorResponse = errorToResponse(err);
    return c.json(errorResponse, err.statusCode);
  }

  // Handle generic errors
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: err.message || "Internal server error",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    },
    500,
  );
});

// ===== 404 Handler =====
app.notFound((c) => {
  return c.json(
    {
      error: "Not found",
      availableEndpoints: ["/", "/generate", "/tasks", "/refine"],
    },
    404,
  );
});

export default app;
