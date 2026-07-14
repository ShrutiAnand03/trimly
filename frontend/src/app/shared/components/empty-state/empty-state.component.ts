import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Generic empty state.
 *
 * `<ng-content>` lets callers project an optional action (button/link) without
 * this component needing to know about any specific feature.
 */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
})
export class EmptyStateComponent {
  /** Material icon ligature name. */
  readonly icon = input<string>('link');
  readonly title = input.required<string>();
  readonly description = input<string>('');
}
