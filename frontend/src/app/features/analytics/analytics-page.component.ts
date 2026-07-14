import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppError } from '../../core/models/api-error.model';
import { UrlStats } from '../../core/models/url.model';
import { UrlService } from '../../core/services/url.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorCardComponent } from '../../shared/components/error-card/error-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';

/**
 * Analytics page for a single short code (/analytics/:shortCode).
 *
 * Container component: resolves the route param, loads stats, and renders exactly
 * one of four mutually exclusive states — loading, not-found, error, or data.
 */
@Component({
  selector: 'app-analytics-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    ErrorCardComponent,
    EmptyStateComponent,
    StatsCardComponent,
  ],
  templateUrl: './analytics-page.component.html',
  styleUrl: './analytics-page.component.css',
})
export class AnalyticsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly urlService = inject(UrlService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly shortCode = signal('');
  protected readonly loading = signal(true);
  protected readonly stats = signal<UrlStats | null>(null);
  protected readonly error = signal<AppError | null>(null);

  constructor() {
    // Re-fetch whenever the :shortCode param changes (component may be reused).
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.shortCode.set(params.get('shortCode') ?? '');
      this.fetchStats();
    });
  }

  protected fetchStats(): void {
    const code = this.shortCode();
    if (!code) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.urlService
      .getStats(code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
          this.loading.set(false);
        },
        error: (appError: AppError) => {
          this.stats.set(null);
          this.error.set(appError);
          this.loading.set(false);
        },
      });
  }
}
