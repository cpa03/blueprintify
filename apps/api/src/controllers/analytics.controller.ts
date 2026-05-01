import type { Context } from "hono";
import { BaseController } from "./base.controller";
import { getDatabaseService } from "../db";
import { HTTP_STATUS } from "../config/constants";

export class AnalyticsController extends BaseController {
  /**
   * Get analytics by date range
   */
  async getAnalytics(c: Context) {
    try {
      const startDate = c.req.query("startDate");
      const endDate = c.req.query("endDate");
      const eventType = c.req.query("eventType");

      if (!startDate || !endDate) {
        return c.json(
          {
            success: false,
            error: {
              type: "validation",
              message: "startDate and endDate are required",
            },
          },
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      const db = getDatabaseService();
      let events;

      if (eventType) {
        events = await db.getAnalyticsByEventTypeAndDateRange(
          eventType,
          startDate,
          endDate,
        );
      } else {
        events = await db.getAnalyticsByDateRange(startDate, endDate);
      }

      return c.json({
        success: true,
        data: events,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            type: "internal",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        },
        HTTP_STATUS.INTERNAL_ERROR,
      );
    }
  }
}
