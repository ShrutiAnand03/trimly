import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * Thin wrapper around MatSnackBar.
 *
 * Components depend on this small intention-revealing API (`success` / `error`)
 * rather than on Material's config object, which keeps snackbar styling and
 * durations consistent in one place.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly baseConfig: MatSnackBarConfig = {
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  };

  /** Green confirmation toast. */
  success(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      ...this.baseConfig,
      duration: 3000,
      panelClass: 'snackbar-success',
    });
  }

  /** Red error toast — stays a little longer so it can be read. */
  error(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      ...this.baseConfig,
      duration: 5000,
      panelClass: 'snackbar-error',
    });
  }
}
