/**
 * External URL Configuration Constants
 *
 * External URLs for project references, all env-config driven.
 *
 * @module config/constants/external
 */

import { getEnvConfig } from "./env";

/**
 * External URLs for project references.
 */
export const EXTERNAL_URLS = {
  get GITHUB(): string {
    return getEnvConfig().GITHUB_URL;
  },
  get PROJECT_HOMEPAGE(): string {
    return getEnvConfig().PROJECT_HOMEPAGE_URL;
  },
};
