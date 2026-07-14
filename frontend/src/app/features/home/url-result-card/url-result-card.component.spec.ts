import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { ClipboardService } from '../../../core/services/clipboard.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ShortenedUrl } from '../../../core/models/url.model';
import { UrlResultCardComponent } from './url-result-card.component';

describe('UrlResultCardComponent', () => {
  let fixture: ComponentFixture<UrlResultCardComponent>;
  let clipboard: { copy: ReturnType<typeof vi.fn> };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const result: ShortenedUrl = {
    originalUrl: 'https://example.com/a/very/long/path',
    shortCode: 'abc123',
    shortUrl: 'http://localhost:8004/abc123',
  };

  beforeEach(async () => {
    clipboard = { copy: vi.fn().mockReturnValue(true) };
    notifications = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UrlResultCardComponent],
      providers: [
        provideRouter([]),
        { provide: ClipboardService, useValue: clipboard },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlResultCardComponent);
    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();
  });

  function clickCopy(): void {
    fixture.debugElement.query(By.css('.result__copy')).nativeElement.click();
    fixture.detectChanges();
  }

  it('renders the original and short URLs', () => {
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain(result.originalUrl);
    expect(text).toContain(result.shortUrl);
  });

  it('copies the short URL (not the original) when Copy is clicked', () => {
    clickCopy();

    expect(clipboard.copy).toHaveBeenCalledWith('http://localhost:8004/abc123');
  });

  it('shows "Copied!" feedback after a successful copy', () => {
    clickCopy();

    const button = fixture.debugElement.query(By.css('.result__copy')).nativeElement;
    expect(button.textContent).toContain('Copied!');
    expect(button.classList).toContain('is-copied');
  });

  it('notifies the user on a successful copy', () => {
    clickCopy();

    expect(notifications.success).toHaveBeenCalledWith('Short URL copied to clipboard');
  });

  it('reverts the "Copied!" label after the feedback delay', async () => {
    vi.useFakeTimers();
    clickCopy();

    vi.advanceTimersByTime(2000);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.result__copy')).nativeElement;
    expect(button.textContent).toContain('Copy');
    expect(button.textContent).not.toContain('Copied!');

    vi.useRealTimers();
  });

  it('shows an error and no "Copied!" state when the copy fails', () => {
    clipboard.copy.mockReturnValue(false);

    clickCopy();

    expect(notifications.error).toHaveBeenCalled();
    expect(notifications.success).not.toHaveBeenCalled();

    const button = fixture.debugElement.query(By.css('.result__copy')).nativeElement;
    expect(button.textContent).toContain('Copy');
  });

  it('opens the short URL in a new tab safely', () => {
    const openLink: HTMLAnchorElement = fixture.debugElement.query(
      By.css('.result__open'),
    ).nativeElement;

    expect(openLink.getAttribute('href')).toBe(result.shortUrl);
    expect(openLink.getAttribute('target')).toBe('_blank');
    // rel=noopener prevents the opened page from accessing window.opener.
    expect(openLink.getAttribute('rel')).toContain('noopener');
  });

  it('links to the analytics page for the short code', () => {
    const link: HTMLAnchorElement = fixture.debugElement.query(
      By.css('.result__analytics'),
    ).nativeElement;

    expect(link.getAttribute('href')).toBe('/analytics/abc123');
  });
});
