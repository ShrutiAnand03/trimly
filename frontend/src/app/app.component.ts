import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

/**
 * Root shell. Delegates all page chrome to MainLayoutComponent, which hosts the
 * router outlet — so this stays a one-liner.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MainLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
