import { Hono } from "hono";
import { z } from "zod";
import { validateJson } from "../middleware/validator";
import { authenticateApiKey } from "../middleware/auth";
import { auditLogger } from "../middleware/logging";
import { ApiKeyCreateSchema } from "../schemas/validation";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

app.post(
  "/keys",
  auditLogger("api_key_create"),
  validateJson(ApiKeyCreateSchema),
  async (c) => {
    const validatedData = (c as any).get("validatedData");
    const { name, permissions, expiresAt } = validatedData;

    const apiKey = `bp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    const keyData = {
      name,
      permissions,
      createdAt: Date.now(),
      expiresAt,
      lastUsed: null,
      usageCount: 0,
      disabled: false,
    };

    try {
      await c.env.API_KEY_KV?.put(`api_key:${apiKey}`, JSON.stringify(keyData));

      return c.json({
        success: true,
        data: {
          apiKey,
          name: keyData.name,
          permissions: keyData.permissions,
          expiresAt: keyData.expiresAt
            ? new Date(keyData.expiresAt).toISOString()
            : null,
        },
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            type: "storage_error",
            message: "Failed to create API key",
            code: "STORAGE_ERROR",
            timestamp: new Date().toISOString(),
          },
        },
        500,
      );
    }
  },
);

app.delete(
  "/keys/:key",
  auditLogger("api_key_delete"),
  authenticateApiKey,
  async (c) => {
    const keyToDelete = c.req.param("key");

    try {
      const existingKey = await c.env.API_KEY_KV?.get(`api_key:${keyToDelete}`);

      if (!existingKey) {
        return c.json(
          {
            success: false,
            error: {
              type: "not_found",
              message: "API key not found",
              code: "KEY_NOT_FOUND",
              timestamp: new Date().toISOString(),
            },
          },
          404,
        );
      }

      await c.env.API_KEY_KV?.delete(`api_key:${keyToDelete}`);

      return c.json({
        success: true,
        message: "API key deleted successfully",
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            type: "storage_error",
            message: "Failed to delete API key",
            code: "STORAGE_ERROR",
            timestamp: new Date().toISOString(),
          },
        },
        500,
      );
    }
  },
);

app.get("/keys", authenticateApiKey, async (c) => {
  const list = await c.env.API_KEY_KV?.list({
    prefix: "api_key:",
  });

  if (!list) {
    return c.json({ success: true, data: [] });
  }

  const keys = [];
  for (const key of list.keys) {
    const keyData = await c.env.API_KEY_KV?.get(key.name);
    if (keyData) {
      const parsed = JSON.parse(keyData);
      keys.push({
        name: parsed.name,
        permissions: parsed.permissions,
        createdAt: new Date(parsed.createdAt).toISOString(),
        expiresAt: parsed.expiresAt
          ? new Date(parsed.expiresAt).toISOString()
          : null,
        lastUsed: parsed.lastUsed
          ? new Date(parsed.lastUsed).toISOString()
          : null,
        usageCount: parsed.usageCount,
        disabled: parsed.disabled,
        keyPrefix: key.name.replace("api_key:", "").substring(0, 8) + "...",
      });
    }
  }

  return c.json({
    success: true,
    data: keys,
  });
});

export default app;
