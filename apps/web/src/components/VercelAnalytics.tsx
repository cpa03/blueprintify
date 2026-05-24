import { memo, type ReactElement } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

/**
 * Conditionally renders Vercel Speed Insights and Analytics only on actual
 * Vercel deployments. Suppresses 404 console errors from /_vercel/ endpoints
 * that do not exist in local dev/preview mode.
 */
export const VercelAnalytics = memo(function VercelAnalytics(): ReactElement | null {
  if (
    typeof window === "undefined" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return null;
  }

  return (
    <>
      <SpeedInsights />
      <Analytics />
    </>
  );
});
