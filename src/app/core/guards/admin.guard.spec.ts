import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../../features/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { expect, jest } from '@jest/globals';

class MockAuthService {
  currentUser$ = new BehaviorSubject(null);
  isAuthenticated$ = new BehaviorSubject(false);
  isLoggedIn = jest.fn<() => boolean>().mockReturnValue(true);
  isAdmin = jest.fn<() => boolean>().mockReturnValue(false);
  getToken = jest.fn<() => string | null>().mockReturnValue(null);
  logout = jest.fn<() => void>();
}

class MockRouter {
  navigate = jest.fn<() => void>();
}

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
      ],
    });
    guard = TestBed.inject(AdminGuard);
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router) as unknown as MockRouter;
  });

  it('should allow admin users', () => {
    authService.isAdmin.mockReturnValue(true);
    expect(guard.canActivate()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny and redirect to /dashboard for non-admin', () => {
    authService.isAdmin.mockReturnValue(false);
    expect(guard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
