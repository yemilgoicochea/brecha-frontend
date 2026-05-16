import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { expect, jest } from '@jest/globals';

const mockAuthResponse = {
  access_token: 'test-token-abc123',
  token_type: 'bearer',
  user: { id: 'u1', email: 'user@test.com', name: 'Test', last_name: 'User', role: 'user' },
};

const mockAdminResponse = {
  ...mockAuthResponse,
  user: { ...mockAuthResponse.user, role: 'admin' },
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('login()', () => {
    it('should store token in localStorage', (done) => {
      service.login('user@test.com', 'pass').subscribe(() => {
        expect(service.getToken()).toBe('test-token-abc123');
        done();
      });
      httpMock.expectOne((r) => r.url.includes('/api/v1/auth/login')).flush(mockAuthResponse);
    });

    it('should set isAuthenticated$ to true', (done) => {
      service.login('user@test.com', 'pass').subscribe(() => {
        expect(service.isAuthenticated$.value).toBe(true);
        done();
      });
      httpMock.expectOne((r) => r.url.includes('/api/v1/auth/login')).flush(mockAuthResponse);
    });

    it('should emit user via currentUser$', (done) => {
      service.login('user@test.com', 'pass').subscribe(() => {
        expect(service.currentUser$.value?.email).toBe('user@test.com');
        done();
      });
      httpMock.expectOne((r) => r.url.includes('/api/v1/auth/login')).flush(mockAuthResponse);
    });

    it('should set isLoggedIn() to true after login', (done) => {
      service.login('user@test.com', 'pass').subscribe(() => {
        expect(service.isLoggedIn()).toBe(true);
        done();
      });
      httpMock.expectOne((r) => r.url.includes('/api/v1/auth/login')).flush(mockAuthResponse);
    });
  });

  describe('register()', () => {
    it('should store token on success', (done) => {
      service.register('new@test.com', 'New', 'User', 'Pass123!').subscribe(() => {
        expect(service.getToken()).toBe('test-token-abc123');
        expect(service.isLoggedIn()).toBe(true);
        done();
      });
      httpMock.expectOne((r) => r.url.includes('/api/v1/auth/register')).flush(mockAuthResponse);
    });

    it('should send email, name, last_name and password in request body', () => {
      service.register('new@test.com', 'Juan', 'Perez', 'Pass123!').subscribe();
      const req = httpMock.expectOne((r) => r.url.includes('/api/v1/auth/register'));
      expect(req.request.body).toEqual({
        email: 'new@test.com',
        name: 'Juan',
        last_name: 'Perez',
        password: 'Pass123!',
      });
      req.flush(mockAuthResponse);
    });
  });

  describe('logout()', () => {
    it('should clear token, user and subjects', (done) => {
      service.login('user@test.com', 'pass').subscribe(() => {
        service.logout();
        expect(service.getToken()).toBeNull();
        expect(service.isLoggedIn()).toBe(false);
        expect(service.currentUser$.value).toBeNull();
        expect(service.isAuthenticated$.value).toBe(false);
        done();
      });
      httpMock.expectOne((r) => r.url.includes('/api/v1/auth/login')).flush(mockAuthResponse);
    });
  });

  describe('isAdmin()', () => {
    it('should return false for regular user', (done) => {
      service.login('user@test.com', 'pass').subscribe(() => {
        expect(service.isAdmin()).toBe(false);
        done();
      });
      httpMock.expectOne((r) => r.url.includes('/api/v1/auth/login')).flush(mockAuthResponse);
    });

    it('should return true for admin user', (done) => {
      service.login('admin@test.com', 'pass').subscribe(() => {
        expect(service.isAdmin()).toBe(true);
        done();
      });
      httpMock.expectOne((r) => r.url.includes('/api/v1/auth/login')).flush(mockAdminResponse);
    });

    it('should return false when not logged in', () => {
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('getToken()', () => {
    it('should return null when not authenticated', () => {
      expect(service.getToken()).toBeNull();
    });
  });
});
