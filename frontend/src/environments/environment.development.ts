import { AppEnvironment } from './environment.model';

/**
 * Development environment configuration.
 * Points at the local Flask backend (see backend/.env — BASE_URL / port 8004).
 */
export const environment: AppEnvironment = {
  production: false,
  apiBaseUrl: 'http://localhost:8004',
};
