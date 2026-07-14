import { FormControl } from '@angular/forms';

import { isValidHttpUrl, urlValidator } from './url.validator';

describe('isValidHttpUrl', () => {
  it.each([
    'https://example.com',
    'http://example.com',
    'https://example.com/very/long/path?query=1#hash',
    'https://sub.domain.example.co.uk',
    'http://localhost:8004',
    'https://example.com:8080/path',
  ])('accepts valid http(s) URL: %s', (url) => {
    expect(isValidHttpUrl(url)).toBe(true);
  });

  it.each([
    ['empty string', ''],
    ['whitespace only', '   '],
    ['plain text', 'not-valid'],
    ['missing scheme', 'example.com'],
    ['unsupported scheme (ftp)', 'ftp://example.com'],
    ['unsupported scheme (mailto)', 'mailto:someone@example.com'],
    ['dangerous scheme (javascript)', 'javascript:alert(1)'],
    ['host without a dot', 'https://foo'],
  ])('rejects %s', (_label, url) => {
    expect(isValidHttpUrl(url)).toBe(false);
  });

  it('ignores surrounding whitespace', () => {
    expect(isValidHttpUrl('  https://example.com  ')).toBe(true);
  });
});

describe('urlValidator', () => {
  const validate = (value: string) => urlValidator()(new FormControl(value));

  it('returns null for a valid URL', () => {
    expect(validate('https://example.com')).toBeNull();
  });

  it('returns an invalidUrl error for a malformed URL', () => {
    expect(validate('not-valid')).toEqual({ invalidUrl: true });
  });

  it('defers empty values to Validators.required', () => {
    // Empty must not report invalidUrl, otherwise the user sees two errors.
    expect(validate('')).toBeNull();
    expect(validate('   ')).toBeNull();
  });
});
