import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <!-- Logo/Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-extrabold text-white mb-2">Brecha</h1>
          <p class="text-gray-300">Identificador de Brechas de Infraestructura</p>
        </div>

        <!-- Login Form -->
        <div class="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-8">
          <h2 class="text-2xl font-bold text-white mb-6">Iniciar Sesión</h2>

          <!-- Error Message -->
          <div *ngIf="error" class="mb-4 p-4 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
            {{ error }}
          </div>

          <!-- Email Field -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <!-- Password Field -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <!-- Login Button -->
          <button
            (click)="login()"
            [disabled]="loading"
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-4"
          >
            <span *ngIf="!loading">Iniciar Sesión</span>
            <span *ngIf="loading" class="flex items-center justify-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
                <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
              </svg>
              Procesando...
            </span>
          </button>

          <!-- Register Link -->
          <div class="text-center">
            <p class="text-gray-400 text-sm">
              ¿No tienes cuenta?
              <a routerLink="/register" class="text-indigo-400 hover:text-indigo-300 font-semibold">
                Registrarse
              </a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-8 text-center text-gray-400 text-xs">
          <p>© 2026 Sistema Brecha. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).pipe(
      timeout(15000),
      finalize(() => this.loading = false),
    ).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error) => {
        if (error.name === 'TimeoutError') {
          this.error = 'El servidor tardó demasiado en responder. Intenta de nuevo.';
        } else {
          this.error = error.error?.detail || 'Error al iniciar sesión';
        }
      },
    });
  }
}
