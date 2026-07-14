import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppError } from '../models/api-error.model';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  const TEST_URL = '/api/v1/urls';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /** Fires a request, fails it with the given body/status, returns the AppError. */
  function failWith(body: object | null, status: number, statusText = 'Error'): Promise<AppError> {
    return new Promise<AppError>((resolve) => {
      http.get(TEST_URL).subscribe({ error: (e: AppError) => resolve(e) });
      httpMock.expectOne(TEST_URL).flush(body, { status, statusText });
    });
  }

  it('passes a successful response through untouched', async () => {
    const payload = { short_code: 'abc123' };
    const result = await new Promise((resolve) => {
      http.get(TEST_URL).subscribe(resolve);
      httpMock.expectOne(TEST_URL).flush(payload);
    });

    expect(result).toEqual(payload);
  });

  it('maps a network failure (status 0) to a connectivity message', async () => {
    const error = await new Promise<AppError>((resolve) => {
      http.get(TEST_URL).subscribe({ error: (e: AppError) => resolve(e) });
      httpMock.expectOne(TEST_URL).error(new ProgressEvent('error'));
    });

    expect(error.status).toBe(0);
    expect(error.message).toContain('Cannot reach the Trimly server');
    expect(error.notFound).toBe(false);
  });

  it('uses the backend message for a 400', async () => {
    const error = await failWith({ code: 400, message: 'Invalid url' }, 400);

    expect(error.status).toBe(400);
    expect(error.message).toBe('Invalid url');
  });

  it('flags 404 responses as notFound', async () => {
    const error = await failWith({ code: 404, message: 'url not found' }, 404);

    expect(error.notFound).toBe(true);
    expect(error.message).toBe('url not found');
  });

  it('extracts the first field message from a 422 validation body', async () => {
    const body = { code: 422, errors: { json: { url: ['Not a valid URL.'] } } };
    const error = await failWith(body, 422);

    expect(error.status).toBe(422);
    expect(error.message).toBe('Not a valid URL.');
  });

  it('falls back to friendly copy when a 422 has no field errors', async () => {
    const error = await failWith({ code: 422 }, 422);

    expect(error.message).toBe('Please enter a valid URL.');
  });

  it('hides raw server detail behind a friendly message on 500', async () => {
    const error = await failWith({ code: 500, message: 'Traceback: KeyError' }, 500);

    expect(error.message).toBe('The Trimly server had a problem. Please try again in a moment.');
  });

  it('falls back to a generic message for unexpected statuses', async () => {
    const error = await failWith(null, 418, 'I am a teapot');

    expect(error.message).toBe('Something went wrong. Please try again.');
  });
});
