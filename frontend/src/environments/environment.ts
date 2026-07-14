import { AppEnvironment } from './environment.model';

/**
 * Production environment configuration.
 *
 * Swapped for `environment.development.ts` via `fileReplacements` in angular.json
 * during dev/test builds, so no API URL is ever hardcoded in application code.
 */
export const environment: AppEnvironment = {
  production: true,
  apiBaseUrl: '/', // Same-origin by default; override at deploy time.
};
