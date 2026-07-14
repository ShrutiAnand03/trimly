import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * A single statistic tile (label + value).
 *
 * `emphasis` switches to the oversized treatment used for the headline metric
 * (click count) — one component covers both cases instead of two near-duplicates.
 */
@Component({
  selector: 'app-stats-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.css',
  host: { '[class.stats-card--emphasis]': 'emphasis()' },
})
export class StatsCardComponent {
  readonly label = input.required<string>();
  /** Rendered as text; callers format numbers/dates before passing them in. */
  readonly value = input.required<string>();
  readonly icon = input<string>('');
  /** Renders the large, headline variant. */
  readonly emphasis = input<boolean>(false);
}
