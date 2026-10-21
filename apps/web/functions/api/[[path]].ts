/**
 * Cloudflare Pages Function proxy for /api/* requests.
 * Proxies API calls from blueprintify.pages.dev to the backend Cloudflare Worker.
 */

interface EventContext {
  request: Request;
  params: { path?: string[] };
}

// Flexy: mirrors DEPLOYMENT_ORIGINS + PROXY_CONFIG + HTTP_METHODS in @blueprint/shared
// (Pages Functions run outside the workspace bundle, so values are duplicated
// here as the single local source of truth with shared-config parity comments).
const PROXY_TARGET_ORIGIN = "https://blueprintify.cpa03-cmz.workers.dev";
const API_STRIP_PATTERN = /^\/api/;
const ROOT_FALLBACK = "/";
const SAFE_METHOD_GET = "GET";
const SAFE_METHOD_HEAD = "HEAD";

export async function onRequest(context: EventContext): Promise<Response> {
  const url = new URL(context.request.url);
  // Forward /api/... to the worker root
  const subPath = url.pathname.replace(API_STRIP_PATTERN, "");
  const targetUrl = new URL((subPath || ROOT_FALLBACK) + url.search, PROXY_TARGET_ORIGIN);

  const requestInit: RequestInit = {
    method: context.request.method,
    headers: context.request.headers,
  };

  if (context.request.method !== SAFE_METHOD_GET && context.request.method !== SAFE_METHOD_HEAD) {
    requestInit.body = context.request.body;
  }

  return fetch(targetUrl.toString(), requestInit);
}
