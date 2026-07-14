import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Observable, of, throwError } from 'rxjs';

import { AppError } from '../../core/models/api-error.model';
import { ShortenedUrl } from '../../core/models/url.model';
import { NotificationService } from '../../core/services/notification.service';
import { UrlService } from '../../core/services/url.service';
import { HomePageComponent } from './home-page.component';
import { UrlFormComponent } from './url-form/url-form.component';

describe('HomePageComponent', () => {
  let fixture: ComponentFixture<HomePageComponent>;
  let urlService: { shorten: ReturnType<typeof vi.fn> };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const shortened: ShortenedUrl = {
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    shortUrl: 'http://localhost:8004/abc123',
  };

  const notFoundError: AppError = {
    status: 400,
    message: 'Invalid url',
    notFound: false,
  };

  beforeEach(async () => {
    urlService = { shorten: vi.fn() };
    notifications = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        { provide: UrlService, useValue: urlService },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();
  });

  /** Emits a URL from the child form, as a real user submission would. */
  function submitUrl(url = 'https://example.com'): void {
    const form = fixture.debugElement.query(By.directive(UrlFormComponent));
    form.componentInstance.submitted.emit(url);
    fixture.detectChanges();
  }

  it('renders the hero heading and subtitle', () => {
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('Trimly');
    expect(text).toContain('Shorten URLs instantly.');
  });

  it('shows neither result nor error before submitting', () => {
    expect(fixture.debugElement.query(By.css('app-url-result-card'))).toBeNull();
    expect(fixture.debugElement.query(By.css('app-error-card'))).toBeNull();
  });

  it('calls the service with the submitted URL', () => {
    urlService.shorten.mockReturnValue(of(shortened));

    submitUrl('https://example.com/page');

    expect(urlService.shorten).toHaveBeenCalledWith('https://example.com/page');
  });

  it('renders the result card and notifies on success', () => {
    urlService.shorten.mockReturnValue(of(shortened));

    submitUrl();

    expect(fixture.debugElement.query(By.css('app-url-result-card'))).toBeTruthy();
    expect(notifications.success).toHaveBeenCalledWith('Short URL created successfully');
  });

  it('renders the error card and notifies on failure', () => {
    urlService.shorten.mockReturnValue(throwError(() => notFoundError));

    submitUrl();

    const errorCard = fixture.debugElement.query(By.css('app-error-card'));
    expect(errorCard).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Invalid url');
    expect(notifications.error).toHaveBeenCalledWith('Invalid url');
  });

  it('passes the loading state down while the request is in flight', () => {
    // An observable that never emits keeps the page in its loading state.
    urlService.shorten.mockReturnValue(new Observable<ShortenedUrl>());

    submitUrl();

    const form = fixture.debugElement.query(By.directive(UrlFormComponent));
    expect(form.componentInstance.loading()).toBe(true);
  });

  it('clears a previous error when a retry succeeds', () => {
    urlService.shorten.mockReturnValue(throwError(() => notFoundError));
    submitUrl();
    expect(fixture.debugElement.query(By.css('app-error-card'))).toBeTruthy();

    urlService.shorten.mockReturnValue(of(shortened));
    submitUrl();

    expect(fixture.debugElement.query(By.css('app-error-card'))).toBeNull();
    expect(fixture.debugElement.query(By.css('app-url-result-card'))).toBeTruthy();
  });

  it('retries the last URL from the error card', () => {
    urlService.shorten.mockReturnValue(throwError(() => notFoundError));
    submitUrl('https://example.com/retry-me');

    urlService.shorten.mockReturnValue(of(shortened));
    fixture.debugElement.query(By.css('app-error-card')).componentInstance.retry.emit();
    fixture.detectChanges();

    expect(urlService.shorten).toHaveBeenLastCalledWith('https://example.com/retry-me');
  });
});
