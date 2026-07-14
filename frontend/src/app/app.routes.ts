import { Routes } from '@angular/router';

/**
 * Application routes.
 *
 * Feature pages are lazy-loaded with `loadComponent` so each feature ships in its
 * own chunk — the analytics view isn't downloaded until the user navigates to it.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home-page.component').then((m) => m.HomePageComponent),
    title: 'Trimly — Shorten URLs & Track Analytics',
  },
  {
    path: 'analytics/:shortCode',
    loadComponent: () =>
      import('./features/analytics/analytics-page.component').then(
        (m) => m.AnalyticsPageComponent,
      ),
    title: 'Analytics — Trimly',
  },
  // Unknown routes fall back to the home page.
  { path: '**', redirectTo: '' },
];
