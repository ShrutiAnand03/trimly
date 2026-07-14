/**
 * URL domain + transport models.
 *
 * The Flask backend speaks snake_case; the Angular app speaks camelCase and uses
 * real `Date` objects. The `*Dto` types describe the wire format exactly, and
 * `UrlService` maps them to the domain models below. Keeping these separate means
 * a backend field rename only ever touches the mapping layer.
 */

/** Request body for POST /api/v1/urls */
export interface CreateUrlRequestDto {
  readonly url: string;
}

/** Response body from POST /api/v1/urls (HTTP 201) */
export interface CreatedUrlDto {
  readonly short_code: string;
  readonly short_url: string;
}

/** Response body from GET /api/v1/urls/:shortCode (HTTP 200) */
export interface UrlStatsDto {
  readonly original_url: string;
  readonly short_code: string;
  readonly click_count: number;
  readonly created_at: string;
}

/** A freshly shortened URL, as used by the UI. */
export interface ShortenedUrl {
  readonly originalUrl: string;
  readonly shortCode: string;
  readonly shortUrl: string;
}

/** Click statistics for a single short code. */
export interface UrlStats {
  readonly originalUrl: string;
  readonly shortCode: string;
  readonly shortUrl: string;
  readonly clickCount: number;
  readonly createdAt: Date;
}
