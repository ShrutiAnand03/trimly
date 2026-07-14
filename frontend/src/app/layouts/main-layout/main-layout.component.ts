import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

/**
 * Main application layout: persistent navbar + routed content + footer.
 *
 * Isolating page chrome here means feature pages only render their own content,
 * and a future alternate layout (e.g. a bare auth screen) is just another
 * component rather than a rewrite of the root.
 */
@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  protected readonly year = new Date().getFullYear();
}
