import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { AuthService, User } from './features/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { expect, jest } from '@jest/globals';

class MockAuthService {
  currentUser$ = new BehaviorSubject<User | null>(null);
  isAuthenticated$ = new BehaviorSubject<boolean>(false);
  isLoggedIn = jest.fn<() => boolean>().mockReturnValue(false);
  isAdmin = jest.fn<() => boolean>().mockReturnValue(false);
  getToken = jest.fn<() => string | null>().mockReturnValue(null);
  logout = jest.fn<() => void>();
}

describe('AppComponent', () => {
  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have title brecha-frontend', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toBe('brecha-frontend');
  });

  it('should start as not authenticated', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.isAuthenticated).toBe(false);
  });

  it('should start as not admin', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.isAdmin).toBe(false);
  });

  it('should update isAuthenticated when isAuthenticated$ emits', () => {
    const fixture = TestBed.createComponent(AppComponent);
    mockAuthService.isAuthenticated$.next(true);
    expect(fixture.componentInstance.isAuthenticated).toBe(true);
  });

  it('should set isAdmin=true when user has admin role', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const admin: User = { id: '1', email: 'admin@test.com', name: 'Admin', role: 'admin' };
    mockAuthService.currentUser$.next(admin);
    expect(fixture.componentInstance.isAdmin).toBe(true);
  });

  it('should call authService.logout() on logout()', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should toggle mobileMenuOpen', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.mobileMenuOpen).toBe(false);
    app.toggleMobileMenu();
    expect(app.mobileMenuOpen).toBe(true);
    app.toggleMobileMenu();
    expect(app.mobileMenuOpen).toBe(false);
  });
});
