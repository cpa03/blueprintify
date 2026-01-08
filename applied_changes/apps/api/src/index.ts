import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { prettyJSON } from "hono/pretty-json";

import generateRoute from "./routes/generate";
import tasksRoute from "./routes/tasks";
import refineRoute from "./routes/refine";
import {
  handleControllerError,
  createErrorResponse,
  createSuccessResponse,
} from "./utils/errors";
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
  const response = createSuccessResponse(
    {
      name: "Blueprint Generator API",
      version: "1.0.0",
      status: "healthy",
      endpoints: {
        generate: "POST /generate",
        tasks: "POST /tasks",
        refine: "POST /refine",
      },
    },
    "API is healthy",
    200,
  );
  return c.json(response, response.status as any);
});

// ===== Routes =====
app.route("/generate", generateRoute);
app.route("/tasks", tasksRoute);
app.route("/refine", refineRoute);

// ===== Error Handler =====
app.onError((err, c) => {
  return handleControllerError(err, c);
});

// ===== 404 Handler =====
app.notFound((c) => {
  const response = createErrorResponse("Not found", 404, {
    availableEndpoints: ["/", "/generate", "/tasks", "/refine"],
  });
  return c.json(response, response.status as any);
});

export default app;
