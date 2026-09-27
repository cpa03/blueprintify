/**
 * Cloudflare Pages Function proxy for /api/* requests.
 * Proxies API calls from blueprintify.pages.dev to the backend Cloudflare Worker.
 */

interface EventContext {
  request: Request;
  params: { path?: string[] };
}

export async function onRequest(context: EventContext): Promise<Response> {
  const url = new URL(context.request.url);
  // Forward /api/... to the worker root
  const subPath = url.pathname.replace(/^\/api/, "");
  const targetUrl = new URL(
    (subPath || "/") + url.search,
    "https://blueprintify.cpa03-cmz.workers.dev"
  );

  const requestInit: RequestInit = {
    method: context.request.method,
    headers: context.request.headers,
  };

  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    requestInit.body = context.request.body;
  }

  return fetch(targetUrl.toString(), requestInit);
}
