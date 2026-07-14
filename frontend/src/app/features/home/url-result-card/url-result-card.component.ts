import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ClipboardService } from '../../../core/services/clipboard.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ShortenedUrl } from '../../../core/models/url.model';

/** How long the "Copied!" confirmation stays visible. */
const COPIED_FEEDBACK_MS = 2000;

/**
 * Success card shown after a URL is shortened.
 *
 * Displays the original + short URL and offers copy / open / analytics actions.
 */
@Component({
  selector: 'app-url-result-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './url-result-card.component.html',
  styleUrl: './url-result-card.component.css',
})
export class UrlResultCardComponent {
  readonly result = input.required<ShortenedUrl>();

  private readonly clipboard = inject(ClipboardService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  /** Drives the transient "Copied!" state on the copy button. */
  protected readonly copied = signal(false);

  private timeoutId?: ReturnType<typeof setTimeout>;

  constructor() {
    // Never leave a timer running after the card is destroyed.
    this.destroyRef.onDestroy(() => clearTimeout(this.timeoutId));
  }

  protected copyShortUrl(): void {
    const succeeded = this.clipboard.copy(this.result().shortUrl);

    if (!succeeded) {
      this.notifications.error('Could not copy to clipboard. Please copy it manually.');
      return;
    }

    this.notifications.success('Short URL copied to clipboard');
    this.copied.set(true);

    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.copied.set(false), COPIED_FEEDBACK_MS);
  }
}
