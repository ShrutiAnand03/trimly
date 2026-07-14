import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

import { AppError } from '../../core/models/api-error.model';
import { ShortenedUrl } from '../../core/models/url.model';
import { NotificationService } from '../../core/services/notification.service';
import { UrlService } from '../../core/services/url.service';
import { ErrorCardComponent } from '../../shared/components/error-card/error-card.component';
import { UrlFormComponent } from './url-form/url-form.component';
import { UrlResultCardComponent } from './url-result-card/url-result-card.component';

/**
 * Home page — hero + shorten form + result.
 *
 * Acts as the feature's container/smart component: it owns state and talks to
 * services, while the form and result card stay purely presentational.
 * State lives in signals, which is what drives change detection in this
 * zoneless application.
 */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UrlFormComponent, UrlResultCardComponent, ErrorCardComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  private readonly urlService = inject(UrlService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(false);
  protected readonly result = signal<ShortenedUrl | null>(null);
  protected readonly error = signal<string | null>(null);

  /** Remembers the last URL so the error card's "Try again" can retry it. */
  private lastSubmittedUrl = '';

  protected onSubmit(url: string): void {
    this.lastSubmittedUrl = url;
    this.loading.set(true);
    this.error.set(null);

    this.urlService
      .shorten(url)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (shortened) => {
          this.result.set(shortened);
          this.loading.set(false);
          this.notifications.success('Short URL created successfully');
        },
        // The interceptor guarantees an AppError with a display-safe message.
        error: (appError: AppError) => {
          this.loading.set(false);
          this.result.set(null);
          this.error.set(appError.message);
          this.notifications.error(appError.message);
        },
      });
  }

  protected onRetry(): void {
    if (this.lastSubmittedUrl) {
      this.onSubmit(this.lastSubmittedUrl);
    }
  }
}
