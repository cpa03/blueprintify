/**
 * Logger Configuration Constants
 *
 * Logger middleware configuration including request ID generation,
 * path exclusion, and header sanitization.
 *
 * @module config/constants/logger
 */

import {
  API_CONFIG_DEFAULTS,
  ROUTE_PATHS as SHARED_ROUTE_PATHS,
  HTTP_HEADER_NAMES,
  UI_STRINGS,
} from "@blueprint/shared";

/**
 * Logger middleware configuration.
 */
export const LOGGER_CONFIG = {
  /** Length of random suffix in request ID (e.g., timestamp-abc1234 -> 4 chars) */
  REQUEST_ID_SUFFIX_LENGTH: API_CONFIG_DEFAULTS.REQUEST_ID_SUFFIX_LENGTH,
  /** Default paths excluded from request logging */
  DEFAULT_EXCLUDE_PATHS: [SHARED_ROUTE_PATHS.ROOT] as const,
  /**
   * Header names redacted from request logs (matched as case-insensitive substrings).
   * SECURITY: X_API_KEY carries the live credential used by apiKeyAuth — dropping it
   * leaks that secret into Workers logs on every authenticated request.
   */
  SANITIZED_HEADER_EXCLUDE: [
    HTTP_HEADER_NAMES.AUTHORIZATION_LC,
    HTTP_HEADER_NAMES.COOKIE_LC,
    HTTP_HEADER_NAMES.X_API_KEY,
  ] as const,
  UNPARSABLE_BODY: UI_STRINGS.UNPARSABLE_BODY,
} as const;
