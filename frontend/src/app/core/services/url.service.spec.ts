import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { CreatedUrlDto, UrlStatsDto } from '../models/url.model';
import { UrlService } from './url.service';

describe('UrlService', () => {
  let service: UrlService;
  let httpMock: HttpTestingController;

  /** Mirrors the trailing-slash trimming the service performs. */
  const base = environment.apiBaseUrl.replace(/\/+$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UrlService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Fails the test if any request went unmatched.
    httpMock.verify();
  });

  describe('shorten', () => {
    it('POSTs the URL and maps the response to a ShortenedUrl', () => {
      const dto: CreatedUrlDto = {
        short_code: 'abc123',
        short_url: 'http://localhost:8004/abc123',
      };

      let result: unknown;
      service.shorten('https://example.com/page').subscribe((r) => (result = r));

      const req = httpMock.expectOne(`${base}/api/v1/urls`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ url: 'https://example.com/page' });
      req.flush(dto);

      // originalUrl is folded back in from the caller's input.
      expect(result).toEqual({
        originalUrl: 'https://example.com/page',
        shortCode: 'abc123',
        shortUrl: 'http://localhost:8004/abc123',
      });
    });
  });

  describe('getStats', () => {
    it('GETs stats and maps snake_case DTO to the domain model', () => {
      const dto: UrlStatsDto = {
        original_url: 'https://example.com',
        short_code: 'abc123',
        click_count: 5,
        created_at: '2026-07-01T12:00:00',
      };

      let result: { createdAt: Date; clickCount: number; shortUrl: string } | undefined;
      service.getStats('abc123').subscribe((r) => (result = r));

      const req = httpMock.expectOne(`${base}/api/v1/urls/abc123`);
      expect(req.request.method).toBe('GET');
      req.flush(dto);

      expect(result?.clickCount).toBe(5);
      expect(result?.shortUrl).toBe(`${base}/abc123`);
      // created_at must become a real Date, not a string.
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.createdAt.getFullYear()).toBe(2026);
    });

    it('URL-encodes the short code to avoid path injection', () => {
      service.getStats('a/b c').subscribe();

      const req = httpMock.expectOne(`${base}/api/v1/urls/${encodeURIComponent('a/b c')}`);
      req.flush({
        original_url: 'https://example.com',
        short_code: 'a/b c',
        click_count: 0,
        created_at: '2026-07-01T12:00:00',
      } satisfies UrlStatsDto);
    });
  });
});
