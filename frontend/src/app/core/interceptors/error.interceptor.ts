import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import {
  AppError,
  SmorestValidationErrorDto,
} from '../models/api-error.model';

/** Fallback copy shown when the backend gives us nothing useful. */
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

/**
 * Pulls the first validation message out of a flask-smorest 422 body:
 * `{ errors: { json: { url: ['Not a valid URL.'] } } }`
 */
function firstValidationMessage(body: SmorestValidationErrorDto | null): string | null {
  const fields = body?.errors?.json;
  if (!fields) {
    return null;
  }
  for (const messages of Object.values(fields)) {
    if (messages?.length) {
      return messages[0];
    }
  }
  return null;
}

/**
 * Translates an HttpErrorResponse into a user-friendly message, covering the
 * cases called out in the spec: network failure, backend down, 404, 422, 500.
 */
function toMessage(error: HttpErrorResponse): string {
  // status 0 => request never completed (offline, CORS, backend unavailable).
  if (error.status === 0) {
    return 'Cannot reach the Trimly server. Please check your connection and try again.';
  }

  const body = error.error as SmorestValidationErrorDto | null;

  switch (error.status) {
    case 400:
      return body?.message ?? 'That URL could not be shortened. Please check it and try again.';
    case 404:
      return body?.message ?? 'We could not find that short link.';
    case 422:
      return firstValidationMessage(body) ?? 'Please enter a valid URL.';
    case 429:
      return 'Too many requests. Please slow down and try again shortly.';
    case 500:
    case 502:
    case 503:
      return 'The Trimly server had a problem. Please try again in a moment.';
    default:
      return body?.message ?? GENERIC_MESSAGE;
  }
}

/**
 * Functional HTTP interceptor that normalizes all errors into `AppError`.
 * Registered in app.config.ts.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        // Non-HTTP failure (e.g. a bug in an operator) — don't swallow it.
        return throwError(() => error);
      }

      const appError: AppError = {
        status: error.status,
        message: toMessage(error),
        notFound: error.status === 404,
      };

      return throwError(() => appError);
    }),
  );
