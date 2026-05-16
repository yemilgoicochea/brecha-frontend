import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../../features/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { expect, jest } from '@jest/globals';

class MockAuthService {
  currentUser$ = new BehaviorSubject(null);
  isAuthenticated$ = new BehaviorSubject(false);
  getToken = jest.fn<() => string | null>().mockReturnValue(null);
  isLoggedIn = jest.fn<() => boolean>().mockReturnValue(false);
  isAdmin = jest.fn<() => boolean>().mockReturnValue(false);
  logout = jest.fn<() => void>();
}

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: MockAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: AuthService, useClass: MockAuthService },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  afterEach(() => httpMock.verify());

  it('should add Bearer Authorization header when token exists', () => {
    authService.getToken.mockReturnValue('my-jwt-token');

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush({});
  });

  it('should not add Authorization header when no token', () => {
    authService.getToken.mockReturnValue(null);

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should not modify other request headers', () => {
    authService.getToken.mockReturnValue('token-123');

    http.get('/api/test', { headers: { 'X-Custom': 'value' } }).subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('X-Custom')).toBe('value');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({});
  });
});
