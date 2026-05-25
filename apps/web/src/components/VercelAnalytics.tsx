import { memo, type ReactElement } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { VERCEL_DOMAINS } from "../config/constants/api";

/**
 * Conditionally renders Vercel Speed Insights and Analytics only on actual
 * Vercel deployments. Suppresses 404 console errors from /_vercel/ endpoints
 * that do not exist in local dev/preview mode.
 */
export const VercelAnalytics = memo(function VercelAnalytics(): ReactElement | null {
  if (
    typeof window === "undefined" ||
    VERCEL_DOMAINS.LOCAL.includes(window.location.hostname as (typeof VERCEL_DOMAINS.LOCAL)[number])
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
