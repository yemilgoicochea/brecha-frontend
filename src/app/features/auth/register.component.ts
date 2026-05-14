import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
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

        <!-- Register Form -->
        <div class="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-8">
          <h2 class="text-2xl font-bold text-white mb-6">Crear Cuenta</h2>

          <!-- Error Message -->
          <div *ngIf="error" class="mb-4 p-4 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
            {{ error }}
          </div>

          <!-- First Name Field -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
            <input
              type="text"
              [(ngModel)]="firstName"
              name="firstName"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Juan"
            />
          </div>

          <!-- Last Name Field -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Apellido</label>
            <input
              type="text"
              [(ngModel)]="lastName"
              name="lastName"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Pérez"
            />
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
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
            <div class="relative">
              <input
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                class="w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button type="button" (click)="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200">
                <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              </button>
            </div>
            <!-- Password strength indicator -->
            <div *ngIf="password" class="mt-2 space-y-1">
              <div class="flex gap-1">
                <div class="h-1 flex-1 rounded" [class]="password.length >= 8 ? 'bg-green-500' : 'bg-gray-600'"></div>
                <div class="h-1 flex-1 rounded" [class]="hasUppercase() ? 'bg-green-500' : 'bg-gray-600'"></div>
                <div class="h-1 flex-1 rounded" [class]="hasNumber() ? 'bg-green-500' : 'bg-gray-600'"></div>
                <div class="h-1 flex-1 rounded" [class]="hasSymbol() ? 'bg-green-500' : 'bg-gray-600'"></div>
              </div>
              <p class="text-xs" [class]="isPasswordStrong() ? 'text-green-400' : 'text-gray-400'">
                <span [class.line-through]="password.length >= 8">8+ caracteres</span> ·
                <span [class.line-through]="hasUppercase()">1 mayúscula</span> ·
                <span [class.line-through]="hasNumber()">1 número</span> ·
                <span [class.line-through]="hasSymbol()">1 símbolo</span>
              </p>
            </div>
            <p *ngIf="!password" class="text-xs text-gray-400 mt-1">Mínimo 8 caracteres, con mayúscula, número y símbolo</p>
          </div>

          <!-- Confirm Password Field -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">Confirmar Contraseña</label>
            <div class="relative">
              <input
                [type]="showConfirmPassword ? 'text' : 'password'"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                class="w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button type="button" (click)="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200">
                <svg *ngIf="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <svg *ngIf="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              </button>
            </div>
            <p *ngIf="password && confirmPassword && password !== confirmPassword" class="text-xs text-red-400 mt-1">
              Las contraseñas no coinciden
            </p>
          </div>

          <!-- Register Button -->
          <button
            (click)="register()"
            [disabled]="loading || password !== confirmPassword || !isPasswordStrong()"
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-4"
          >
            <span *ngIf="!loading">Crear Cuenta</span>
            <span *ngIf="loading" class="flex items-center justify-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
                <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
              </svg>
              Procesando...
            </span>
          </button>

          <!-- Login Link -->
          <div class="text-center">
            <p class="text-gray-400 text-sm">
              ¿Ya tienes cuenta?
              <a routerLink="/login" class="text-indigo-400 hover:text-indigo-300 font-semibold">
                Iniciar sesión
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
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  hasUppercase(): boolean { return /[A-Z]/.test(this.password); }
  hasNumber(): boolean { return /[0-9]/.test(this.password); }
  hasSymbol(): boolean { return /[^A-Za-z0-9]/.test(this.password); }
  isPasswordStrong(): boolean {
    return this.password.length >= 8 && this.hasUppercase() && this.hasNumber() && this.hasSymbol();
  }

  register() {
    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (!this.isPasswordStrong()) {
      this.error = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.email, this.firstName, this.lastName, this.password).subscribe({
      next: (response) => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.error = error.error?.detail || 'Error al crear la cuenta';
        this.loading = false;
      }
    });
  }
}
