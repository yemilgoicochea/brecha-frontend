import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getApiUrl } from '../../config/api.config';

export interface User {
  id: string;
  email: string;
  name: string;
  last_name?: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'auth_token';
  private userKey = 'auth_user';
  
  currentUser$ = new BehaviorSubject<User | null>(this.loadUser());
  isAuthenticated$ = new BehaviorSubject<boolean>(!!this.getToken());

  constructor(private http: HttpClient) {
    // Check token on service initialization
    if (this.getToken()) {
      this.isAuthenticated$.next(true);
    }
  }

  register(email: string, name: string, lastName: string, password: string): Observable<AuthResponse> {
    const url = getApiUrl('/api/v1/auth/register');
    return this.http.post<AuthResponse>(url, {
      email,
      name,
      last_name: lastName,
      password,
    }).pipe(
      map(response => {
        this.setToken(response.access_token);
        this.setUser(response.user);
        this.currentUser$.next(response.user);
        this.isAuthenticated$.next(true);
        return response;
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const url = getApiUrl('/api/v1/auth/login');
    return this.http.post<AuthResponse>(url, { email, password }).pipe(
      map(response => {
        this.setToken(response.access_token);
        this.setUser(response.user);
        this.currentUser$.next(response.user);
        this.isAuthenticated$.next(true);
        return response;
      })
    );
  }

  logout(): void {
    this.removeToken();
    this.removeUser();
    this.currentUser$.next(null);
    this.isAuthenticated$.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.storageKey, token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.storageKey);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private removeUser(): void {
    localStorage.removeItem(this.userKey);
  }

  private loadUser(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.currentUser$.value?.role === 'admin';
  }
}
