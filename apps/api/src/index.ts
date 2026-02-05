import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { prettyJSON } from "hono/pretty-json";

import generateRoute from "./routes/generate";
import tasksRoute from "./routes/tasks";
import refineRoute from "./routes/refine";
import templatesRoute from "./routes/templates";
import projectsRoute from "./routes/projects";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import type { Env } from "./types";
import { initializeDatabase } from "./db";

// ===== Database Initialization =====
await initializeDatabase();

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
      templates: "GET /templates",
      projects: "GET|POST /projects",
    },
  });
});

// ===== Routes =====
app.route("/generate", generateRoute);
app.route("/tasks", tasksRoute);
app.route("/refine", refineRoute);
app.route("/templates", templatesRoute);
app.route("/projects", projectsRoute);

// ===== Error Handler =====
app.onError(errorHandler);

// ===== 404 Handler =====
app.notFound(notFoundHandler);

export default app;
