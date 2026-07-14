import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Presentational error card.
 *
 * Purely dumb: it renders the message it is given and emits `retry`. It never
 * knows *what* failed, which keeps it reusable across features.
 */
@Component({
  selector: 'app-error-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './error-card.component.html',
  styleUrl: './error-card.component.css',
})
export class ErrorCardComponent {
  /** User-friendly message (already normalized by the error interceptor). */
  readonly message = input.required<string>();
  /** Heading above the message. */
  readonly title = input<string>('Something went wrong');
  /** Hides the retry button when false. */
  readonly retryable = input<boolean>(true);

  /** Emitted when the user asks to try again. */
  readonly retry = output<void>();
}
