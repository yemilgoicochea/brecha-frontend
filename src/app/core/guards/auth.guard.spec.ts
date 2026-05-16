import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../../features/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { expect, jest } from '@jest/globals';

class MockAuthService {
  currentUser$ = new BehaviorSubject(null);
  isAuthenticated$ = new BehaviorSubject(false);
  isLoggedIn = jest.fn<() => boolean>().mockReturnValue(false);
  isAdmin = jest.fn<() => boolean>().mockReturnValue(false);
  getToken = jest.fn<() => string | null>().mockReturnValue(null);
  logout = jest.fn<() => void>();
}

class MockRouter {
  navigate = jest.fn<() => void>();
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
      ],
    });
    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router) as unknown as MockRouter;
  });

  it('should allow access when authenticated', () => {
    authService.isLoggedIn.mockReturnValue(true);
    expect(guard.canActivate()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect to /login when not authenticated', () => {
    authService.isLoggedIn.mockReturnValue(false);
    expect(guard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
