import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

import { AppError } from '../../core/models/api-error.model';
import { UrlStats } from '../../core/models/url.model';
import { UrlService } from '../../core/services/url.service';
import { AnalyticsPageComponent } from './analytics-page.component';

describe('AnalyticsPageComponent', () => {
  let fixture: ComponentFixture<AnalyticsPageComponent>;
  let urlService: { getStats: ReturnType<typeof vi.fn> };
  let paramMap: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const stats: UrlStats = {
    originalUrl: 'https://example.com/page',
    shortCode: 'abc123',
    shortUrl: 'http://localhost:8004/abc123',
    clickCount: 42,
    createdAt: new Date('2026-07-01T12:00:00'),
  };

  const serverError: AppError = { status: 500, message: 'Server had a problem', notFound: false };
  const notFoundError: AppError = { status: 404, message: 'url not found', notFound: true };

  /**
   * Configures the TestBed only. The component fetches in its constructor, so
   * each test stubs `getStats` *before* calling `create()`.
   */
  async function configure(shortCode = 'abc123'): Promise<void> {
    paramMap = new BehaviorSubject(convertToParamMap({ shortCode }));
    urlService = { getStats: vi.fn().mockReturnValue(of(stats)) };

    await TestBed.configureTestingModule({
      imports: [AnalyticsPageComponent],
      providers: [
        provideRouter([]),
        { provide: UrlService, useValue: urlService },
        { provide: ActivatedRoute, useValue: { paramMap: paramMap.asObservable() } },
      ],
    }).compileComponents();
  }

  function create(): void {
    fixture = TestBed.createComponent(AnalyticsPageComponent);
    fixture.detectChanges();
  }

  it('requests stats for the short code in the route', async () => {
    await configure('xyz789');
    create();

    expect(urlService.getStats).toHaveBeenCalledWith('xyz789');
  });

  it('shows the loading state while the request is pending', async () => {
    await configure();
    // An observable that never emits keeps the page in its loading state.
    urlService.getStats.mockReturnValue(new Observable<UrlStats>());
    create();

    expect(fixture.debugElement.query(By.css('app-loading'))).toBeTruthy();
  });

  it('renders the click count and URLs once loaded', async () => {
    await configure();
    create();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('42');
    expect(text).toContain('https://example.com/page');
    expect(text).toContain('http://localhost:8004/abc123');
    expect(fixture.debugElement.query(By.css('app-loading'))).toBeNull();
  });

  it('shows an empty state (not an error) when the link does not exist', async () => {
    await configure('missing');
    urlService.getStats.mockReturnValue(throwError(() => notFoundError));
    create();

    expect(fixture.debugElement.query(By.css('app-empty-state'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-error-card'))).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Link not found');
  });

  it('shows an error card for non-404 failures', async () => {
    await configure();
    urlService.getStats.mockReturnValue(throwError(() => serverError));
    create();

    expect(fixture.debugElement.query(By.css('app-error-card'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-empty-state'))).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Server had a problem');
  });

  it('refetches when the route short code changes', async () => {
    await configure('abc123');
    create();

    paramMap.next(convertToParamMap({ shortCode: 'new456' }));
    fixture.detectChanges();

    expect(urlService.getStats).toHaveBeenLastCalledWith('new456');
  });

  it('retries loading from the error card', async () => {
    await configure();
    urlService.getStats.mockReturnValue(throwError(() => serverError));
    create();

    // Recover, then ask the error card to retry.
    urlService.getStats.mockReturnValue(of(stats));
    fixture.debugElement.query(By.css('app-error-card')).componentInstance.retry.emit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('42');
    expect(fixture.debugElement.query(By.css('app-error-card'))).toBeNull();
  });
});
