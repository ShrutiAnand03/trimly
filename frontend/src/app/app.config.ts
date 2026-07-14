import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';

/**
 * Root application providers.
 *
 * - Zoneless change detection (Angular 21 default) — UI state flows through signals.
 * - HttpClient with fetch + a functional error interceptor that normalizes every
 *   failure into a user-safe `AppError`.
 * - Router with scroll restoration for natural back/forward behaviour.
 *
 * Note: Angular Material v21 uses CSS-based animations, so no animations
 * provider/package is required.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor])),
  ],
};
