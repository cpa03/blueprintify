import { Hono } from "hono";
import { AnalyticsController } from "../controllers/analytics.controller";
import type { Env, AppVariables } from "../types";

const analytics = new Hono<{ Bindings: Env; Variables: AppVariables }>();
const controller = new AnalyticsController();

analytics.get("/", (c) => controller.getAnalytics(c));

export default analytics;
