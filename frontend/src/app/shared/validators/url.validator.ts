import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Client-side URL validation.
 *
 * Mirrors the backend's marshmallow `fields.Url(schemes={'http','https'})` rule so
 * the user gets instant feedback instead of a round-trip 422. The backend remains
 * the source of truth — this is purely a UX shortcut.
 */

/** Returns true when `value` is a syntactically valid http(s) URL with a host. */
export function isValidHttpUrl(value: string): boolean {
  const trimmed = value?.trim();
  if (!trimmed) {
    return false;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  // Only http(s) — rejects mailto:, javascript:, ftp:, etc.
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return false;
  }

  // Require a dotted host ("example.com") or localhost; rejects "https://foo".
  const host = parsed.hostname;
  return host === 'localhost' || /^[^.\s]+(\.[^.\s]+)+$/.test(host);
}

/** Reactive-forms validator emitting `{ invalidUrl: true }` on failure. */
export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;

    // Empty is handled by Validators.required — don't double-report.
    if (!value?.trim()) {
      return null;
    }

    return isValidHttpUrl(value) ? null : { invalidUrl: true };
  };
}
