/**
 * Normalized application error.
 *
 * The error interceptor converts every failure — network, 4xx, 5xx, validation —
 * into this single shape, so components never touch `HttpErrorResponse` directly
 * and always have a user-safe `message` to render.
 */
export interface AppError {
  /** HTTP status code (0 when the request never reached the server). */
  readonly status: number;
  /** User-friendly, display-safe message. */
  readonly message: string;
  /** True when the short code / resource simply doesn't exist. */
  readonly notFound: boolean;
}

/** Error body returned by flask-smorest's `abort()` (400/404/500). */
export interface SmorestErrorDto {
  readonly code?: number;
  readonly status?: string;
  readonly message?: string;
}

/** Error body returned by flask-smorest schema validation (422). */
export interface SmorestValidationErrorDto extends SmorestErrorDto {
  readonly errors?: {
    readonly json?: Readonly<Record<string, readonly string[]>>;
  };
}
