/**
 * Cloudflare Pages Function proxy for /api/* requests.
 * Proxies API calls from blueprintify.pages.dev to the backend Cloudflare Worker.
 */

// Flexy single source of truth mirror: see DEPLOYMENT_DOMAINS.WORKERS_DEV,
// PROXY_PATHS.STRIP_PATTERN and HTTP_METHODS in packages/shared/src/config.
const WORKER_TARGET_ORIGIN = "https://blueprintify.cpa03-cmz.workers.dev";
const PROXY_STRIP_PATTERN = /^\/api/;
const HTTP_METHOD_GET = "GET";
const HTTP_METHOD_HEAD = "HEAD";

interface EventContext {
  request: Request;
  params: { path?: string[] };
}

export async function onRequest(context: EventContext): Promise<Response> {
  const url = new URL(context.request.url);
  // Forward /api/... to the worker root
  const subPath = url.pathname.replace(PROXY_STRIP_PATTERN, "");
  const targetUrl = new URL((subPath || "/") + url.search, WORKER_TARGET_ORIGIN);

  const requestInit: RequestInit = {
    method: context.request.method,
    headers: context.request.headers,
  };

  if (context.request.method !== HTTP_METHOD_GET && context.request.method !== HTTP_METHOD_HEAD) {
    requestInit.body = context.request.body;
  }

  return fetch(targetUrl.toString(), requestInit);
}
