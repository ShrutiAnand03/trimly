import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateUrlRequestDto,
  CreatedUrlDto,
  ShortenedUrl,
  UrlStats,
  UrlStatsDto,
} from '../models/url.model';

/**
 * Single source of truth for Trimly's URL API.
 *
 * Responsibilities (SRP): build requests against the configured base URL and map
 * wire DTOs to domain models. Error handling is deliberately NOT here — the
 * `errorInterceptor` normalizes failures app-wide, so this stays focused.
 */
@Injectable({ providedIn: 'root' })
export class UrlService {
  private readonly http = inject(HttpClient);

  /** Base URL comes from the environment — never hardcoded. Trailing slash trimmed. */
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  /**
   * Shortens a URL. The API only returns the code + short URL, so we fold the
   * caller's original URL back in to produce a complete view model.
   */
  shorten(originalUrl: string): Observable<ShortenedUrl> {
    const body: CreateUrlRequestDto = { url: originalUrl };

    return this.http
      .post<CreatedUrlDto>(`${this.baseUrl}/api/v1/urls`, body)
      .pipe(
        map((dto) => ({
          originalUrl,
          shortCode: dto.short_code,
          shortUrl: dto.short_url,
        })),
      );
  }

  /** Fetches click statistics for a short code. */
  getStats(shortCode: string): Observable<UrlStats> {
    const encoded = encodeURIComponent(shortCode);

    return this.http
      .get<UrlStatsDto>(`${this.baseUrl}/api/v1/urls/${encoded}`)
      .pipe(
        map((dto) => ({
          originalUrl: dto.original_url,
          shortCode: dto.short_code,
          shortUrl: `${this.baseUrl}/${dto.short_code}`,
          clickCount: dto.click_count,
          createdAt: new Date(dto.created_at),
        })),
      );
  }
}
