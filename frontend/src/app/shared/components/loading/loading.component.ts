import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Presentational loading indicator.
 *
 * Announced to screen readers via role="status" so assistive tech reports the
 * pending work instead of silently waiting.
 */
@Component({
  selector: 'app-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
})
export class LoadingComponent {
  /** Visible text under the spinner. */
  readonly message = input<string>('Loading…');
  /** Spinner size in px. */
  readonly diameter = input<number>(40);
}
