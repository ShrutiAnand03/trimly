import { Clipboard } from '@angular/cdk/clipboard';
import { TestBed } from '@angular/core/testing';

import { ClipboardService } from './clipboard.service';

describe('ClipboardService', () => {
  let service: ClipboardService;
  let cdkClipboard: { copy: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    // Stub the CDK so tests never touch the real browser clipboard.
    cdkClipboard = { copy: vi.fn().mockReturnValue(true) };

    TestBed.configureTestingModule({
      providers: [{ provide: Clipboard, useValue: cdkClipboard }],
    });

    service = TestBed.inject(ClipboardService);
  });

  it('delegates the copy to the CDK clipboard', () => {
    service.copy('http://localhost:8004/abc123');

    expect(cdkClipboard.copy).toHaveBeenCalledWith('http://localhost:8004/abc123');
  });

  it('returns true when the copy succeeds', () => {
    expect(service.copy('text')).toBe(true);
  });

  it('returns false when the copy fails', () => {
    cdkClipboard.copy.mockReturnValue(false);

    expect(service.copy('text')).toBe(false);
  });
});
