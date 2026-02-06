import type { Context, Next } from "hono";
import type { Env } from "../types";

export const authenticateApiKey = async (
  c: Context<{ Bindings: Env }>,
  next: Next,
) => {
  const authHeader = c.req.header("Authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (!apiKey) {
    return c.json(
      {
        success: false,
        error: {
          type: "authentication_error",
          message: "API key required for this endpoint",
          code: "API_KEY_REQUIRED",
          timestamp: new Date().toISOString(),
        },
      },
      401,
    );
  }

  try {
    const storedKeyData = await c.env.API_KEY_KV?.get(`api_key:${apiKey}`);

    if (!storedKeyData) {
      return c.json(
        {
          success: false,
          error: {
            type: "authentication_error",
            message: "Invalid API key",
            code: "INVALID_API_KEY",
            timestamp: new Date().toISOString(),
          },
        },
        401,
      );
    }

    const keyData = JSON.parse(storedKeyData);

    if (
      keyData.disabled ||
      (keyData.expiresAt && Date.now() > keyData.expiresAt)
    ) {
      return c.json(
        {
          success: false,
          error: {
            type: "authentication_error",
            message: "API key is disabled or expired",
            code: "API_KEY_DISABLED",
            timestamp: new Date().toISOString(),
          },
        },
        401,
      );
    }

    (c as any).set("apiKey", {
      key: apiKey,
      name: keyData.name,
      permissions: keyData.permissions || [],
    });

    await next();
  } catch (error) {
    console.error("[API Key Auth Error]", error);
    return c.json(
      {
        success: false,
        error: {
          type: "authentication_error",
          message: "Authentication service unavailable",
          code: "AUTH_SERVICE_ERROR",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
};

export const optionalApiKeyAuth = async (
  c: Context<{ Bindings: Env }>,
  next: Next,
) => {
  const authHeader = c.req.header("Authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (apiKey) {
    try {
      const storedKeyData = await c.env.API_KEY_KV?.get(`api_key:${apiKey}`);

      if (storedKeyData) {
        const keyData = JSON.parse(storedKeyData);

        if (
          !keyData.disabled &&
          (!keyData.expiresAt || Date.now() <= keyData.expiresAt)
        ) {
          (c as any).set("apiKey", {
            key: apiKey,
            name: keyData.name,
            permissions: keyData.permissions || [],
          });
        }
      }
    } catch (error) {
      console.error("[Optional API Key Auth Error]", error);
    }
  }

  await next();
};
