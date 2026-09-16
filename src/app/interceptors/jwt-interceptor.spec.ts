import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { jwtInterceptor } from './jwt-interceptor';
import { AuthService } from '../services/auth';

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor]), withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => httpTesting.verify());

  it('should add Authorization header when a token exists', () => {
    vi.spyOn(authService, 'getToken').mockReturnValue('fake-token');

    http.get('/api/test').subscribe();

    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush({});
  });

  it('should not add Authorization header without a token', () => {
    vi.spyOn(authService, 'getToken').mockReturnValue(null);

    http.get('/api/test').subscribe();

    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalsy();
    req.flush({});
  });

  it('should retry with the refreshed token after a 401', () => {
    vi.spyOn(authService, 'getToken').mockReturnValue('old-token');
    vi.spyOn(authService, 'getRefreshToken').mockReturnValue('refresh-token');
    vi.spyOn(authService, 'refreshToken').mockReturnValue(of('new-token'));

    let result: unknown;
    http.get('/api/test').subscribe((response) => (result = response));

    const first = httpTesting.expectOne('/api/test');
    expect(first.request.headers.get('Authorization')).toBe('Bearer old-token');
    first.flush({}, { status: 401, statusText: 'Unauthorized' });

    const retried = httpTesting.expectOne('/api/test');
    expect(retried.request.headers.get('Authorization')).toBe('Bearer new-token');
    retried.flush({ ok: true });

    expect(result).toEqual({ ok: true });
  });

  it('should not retry when refresh yields no token', () => {
    vi.spyOn(authService, 'getToken').mockReturnValue('old-token');
    vi.spyOn(authService, 'getRefreshToken').mockReturnValue('refresh-token');
    vi.spyOn(authService, 'refreshToken').mockReturnValue(of(''));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    let errored = false;
    http.get('/api/test').subscribe({ error: () => (errored = true) });

    httpTesting.expectOne('/api/test').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(errored).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/login']);
    httpTesting.expectNone('/api/test');
  });

  it('should log out and redirect when the retried request also returns 401', () => {
    vi.spyOn(authService, 'getToken').mockReturnValue('old-token');
    vi.spyOn(authService, 'getRefreshToken').mockReturnValue('refresh-token');
    vi.spyOn(authService, 'refreshToken').mockReturnValue(of('new-token'));
    const logout = vi.spyOn(authService, 'logout').mockImplementation(() => undefined);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    let errored = false;
    http.get('/api/test').subscribe({ error: () => (errored = true) });

    httpTesting.expectOne('/api/test').flush({}, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne('/api/test').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(errored).toBe(true);
    expect(logout).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should not refresh when the refresh endpoint itself returns 401', () => {
    vi.spyOn(authService, 'getToken').mockReturnValue(null);
    vi.spyOn(authService, 'getRefreshToken').mockReturnValue('refresh-token');
    vi.spyOn(authService, 'logout').mockImplementation(() => undefined);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const refresh = vi.spyOn(authService, 'refreshToken');

    http.get('/api/auth/refresh/').subscribe({ error: () => undefined });

    httpTesting
      .expectOne('/api/auth/refresh/')
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(refresh).not.toHaveBeenCalled();
  });
});
