import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClassificationService } from '../../services/classification.service';

@Component({
  selector: 'app-classifier-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">

      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-white">Identificar brechas</h1>
        <p class="text-gray-400 mt-1">Ingresa el título de tu proyecto para clasificarlo con IA. El resultado quedará en tu historial.</p>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-5">

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Título del proyecto <span class="text-red-400">*</span>
          </label>
          <input [(ngModel)]="title" [disabled]="submitting"
            class="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            placeholder="Ej: Mejoramiento del servicio de agua potable en el distrito de San Juan" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Descripción <span class="text-gray-500 font-normal">(opcional)</span>
          </label>
          <textarea [(ngModel)]="description" [disabled]="submitting" rows="4"
            class="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none disabled:opacity-50"
            placeholder="Descripción adicional del proyecto..."></textarea>
        </div>

        <div *ngIf="error" class="bg-red-900/20 border border-red-700 text-red-400 rounded-lg p-3 text-sm">
          {{ error }}
        </div>

        <button (click)="submit()" [disabled]="submitting || !title.trim()"
          class="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <svg *ngIf="submitting" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
            <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
          </svg>
          <svg *ngIf="!submitting" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          {{ submitting ? 'Enviando...' : 'Identificar brechas' }}
        </button>
      </div>

      <!-- Info -->
      <div class="mt-4 flex items-start gap-3 text-sm text-indigo-300 bg-indigo-900/20 border border-indigo-800/50 rounded-xl px-4 py-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 shrink-0 mt-0.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p>
          La clasificación es procesada de forma <strong>asíncrona</strong> por el worker de IA.
          Al enviar serás redirigido a tu <a routerLink="/history" class="underline hover:text-white">historial</a>
          donde verás el resultado en cuanto esté listo.
        </p>
      </div>
    </div>
  `,
})
export class ClassifierPageComponent {
  title = '';
  description = '';
  error = '';
  submitting = false;

  constructor(
    private classificationService: ClassificationService,
    private router: Router,
  ) {}

  submit() {
    if (!this.title.trim()) return;
    this.error = '';
    this.submitting = true;

    this.classificationService.submitClassification({
      title: this.title,
      description: this.description,
    }).subscribe({
      next: () => {
        this.router.navigate(['/history']);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al enviar la solicitud. Intenta nuevamente.';
        this.submitting = false;
      },
    });
  }
}
