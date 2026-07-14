import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { urlValidator } from '../../../shared/validators/url.validator';

/**
 * URL entry form.
 *
 * Owns validation only — it never calls the API. It emits the validated URL and
 * lets the page decide what to do, which keeps the form reusable and easy to test.
 */
@Component({
  selector: 'app-url-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './url-form.component.html',
  styleUrl: './url-form.component.css',
})
export class UrlFormComponent {
  /** Drives the spinner and prevents duplicate submissions. */
  readonly loading = input<boolean>(false);

  /** Emits the trimmed, validated URL. */
  readonly submitted = output<string>();

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    url: this.fb.control('', [Validators.required, urlValidator()]),
  });

  protected get urlControl(): FormControl<string> {
    return this.form.controls.url;
  }

  /** Validation copy for the current control state, or null when valid. */
  protected get errorMessage(): string | null {
    const control = this.urlControl;
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Please enter a URL to shorten.';
    }
    if (control.hasError('invalidUrl')) {
      return 'Enter a valid URL starting with http:// or https://';
    }
    return null;
  }

  protected onSubmit(): void {
    // Guard against double-submit while a request is in flight.
    if (this.loading()) {
      return;
    }

    if (this.form.invalid) {
      // Surface validation messages for a user who submitted an untouched form.
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.urlControl.value.trim());
  }
}
