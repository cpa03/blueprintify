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
import { API_HEADERS } from "./network";

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
   *
   * SECURITY: `API_HEADERS.CUSTOM.API_KEY` is the credential header `apiKeyAuth` reads by
   * default — dropping it leaks that secret into Workers logs on every authenticated
   * request. It is referenced through `API_HEADERS` rather than as the bare shared name so
   * this list and the authenticator's default read from one definition and cannot drift.
   * `logger.test.ts` asserts that invariant independently.
   *
   * Substring matching is deliberate: it also covers alias forms of the same credential
   * that a gateway or SDK may emit (`Proxy-X-Api-Key`, `x-api-key-id`, ...).
   *
   * CAVEAT: `apiKeyAuth` accepts an `apiKeyHeader` override. A caller that renames the
   * credential header must add that name here too. The sole production call site
   * (`src/index.ts`) does not override it.
   */
  SANITIZED_HEADER_EXCLUDE: [
    HTTP_HEADER_NAMES.AUTHORIZATION_LC,
    HTTP_HEADER_NAMES.COOKIE_LC,
    API_HEADERS.CUSTOM.API_KEY,
  ] as const,
  UNPARSABLE_BODY: UI_STRINGS.UNPARSABLE_BODY,
} as const;
