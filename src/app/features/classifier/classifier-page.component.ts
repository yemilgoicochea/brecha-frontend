import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassificationService } from '../../services/classification.service';
import { GapCardsComponent } from './gap-cards.component';
import { ProjectAnalysis } from '../../models/analysis.model';

@Component({
  selector: 'app-classifier-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GapCardsComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid gap-10 md:grid-cols-2">
        <!-- Form Section -->
        <form (ngSubmit)="classify()" class="space-y-6" #f="ngForm" aria-describedby="form-desc">
          <p id="form-desc" class="sr-only">Formulario para clasificar un proyecto y obtener brechas.</p>
          <div>
            <h1 class="text-4xl font-extrabold text-white mb-2">Identificar brechas</h1>
            <p class="text-gray-400">Analiza tu proyecto de infraestructura pública y descubre las brechas de servicios.</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300">Nombre del proyecto</label>
              <input 
                type="text" 
                [(ngModel)]="projectName" 
                name="projectName" 
                required 
                class="mt-1 w-full rounded bg-gray-800 border border-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="Ej: Electrificación rural" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300">Código (opcional)</label>
              <input 
                type="text" 
                [(ngModel)]="projectCode" 
                name="projectCode" 
                class="mt-1 w-full rounded bg-gray-800 border border-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300">Municipalidad (opcional)</label>
              <input 
                type="text" 
                [(ngModel)]="municipality" 
                name="municipality" 
                class="mt-1 w-full rounded bg-gray-800 border border-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="Municipalidad Provincial de Tacna" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300">Descripción</label>
              <textarea 
                [(ngModel)]="description" 
                name="description" 
                rows="6" 
                class="mt-1 w-full rounded bg-gray-800 border border-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="Descripción del proyecto y sus componentes"
              ></textarea>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button 
              type="button" 
              (click)="classify()" 
              [disabled]="loading || !projectName" 
              class="inline-flex items-center rounded bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed px-6 py-2 text-sm font-medium text-white shadow transition-colors"
            >
              <span *ngIf="!loading">Identificar brechas</span>
              <span *ngIf="loading" class="flex items-center gap-2">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
                  <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
                </svg>
                Procesando...
              </span>
            </button>
            <button 
              type="reset" 
              (click)="reset()" 
              class="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Limpiar
            </button>
          </div>

          <!-- Error Message -->
          <div *ngIf="formError" class="p-4 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
            {{ formError }}
          </div>
        </form>

        <!-- Results Section -->
        <div>
          <p class="text-xs font-semibold tracking-widest text-indigo-400 mb-2">RESULTADOS</p>
          <h2 class="text-4xl font-extrabold text-white leading-tight mb-6">Brechas<br/>identificadas</h2>
          
          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-8">
            <svg class="h-12 w-12 animate-spin text-indigo-500 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
              <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
            </svg>
            <p class="text-gray-400">{{ pollingMessage }}</p>
          </div>

          <!-- Error State -->
          <ng-container *ngIf="error && !analysis">
            <div class="p-4 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
              {{ error }}
            </div>
          </ng-container>

          <!-- Results State -->
          <ng-container *ngIf="analysis && !loading">
            <ng-container *ngIf="analysis.gaps.length === 0; else showGaps">
              <div class="p-4 bg-gray-800 border border-gray-700 rounded text-gray-400 text-sm">
                No se identificaron brechas para este proyecto.
              </div>
            </ng-container>
            <ng-template #showGaps>
              <app-gap-cards [gaps]="analysis.gaps"></app-gap-cards>
              <div class="mt-6">
                <button 
                  (click)="download()" 
                  class="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  aria-label="Descargar resultados"
                >
                  Descargar resultados
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                    <path fill-rule="evenodd" d="M12 3a.75.75 0 01.75.75v9.19l2.72-2.72a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 011.06-1.06l2.72 2.72V3.75A.75.75 0 0112 3zm-9 15.75A2.25 2.25 0 015.25 16.5h13.5A2.25 2.25 0 0121 18.75v.75a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 19.5v-.75z" clip-rule="evenodd"/>
                  </svg>
                </button>
                <div class="mt-4 rounded bg-gray-800 border border-gray-700 p-4 text-xs text-gray-400 overflow-auto max-h-64">
                  <pre>{{ analysis | json }}</pre>
                </div>
              </div>
            </ng-template>
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export class ClassifierPageComponent {
  projectName = '';
  projectCode = '';
  municipality = '';
  description = '';
  loading = false;
  error = '';
  formError = '';
  analysis: ProjectAnalysis | null = null;
  pollingMessage = 'Analizando tu proyecto...';
  currentQueryId: string | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private classificationService: ClassificationService) {}

  classify() {
    this.error = '';
    this.formError = '';

    if (!this.projectName) {
      this.formError = 'El nombre del proyecto es requerido';
      return;
    }

    this.loading = true;
    this.analysis = null;
    this.pollingMessage = 'Enviando solicitud al servidor...';

    // Step 1: Submit classification request (gets query_id)
    this.classificationService.submitClassification({
      title: this.projectName,
      description: this.description
    }).subscribe({
      next: (response) => {
        this.currentQueryId = response.query_id;
        this.pollingMessage = 'Esperando resultados del análisis...';
        this.pollForResults(response.query_id);
      },
      error: (error) => {
        this.error = error.error?.detail || 'Error al enviar la solicitud';
        this.loading = false;
      }
    });
  }

  private pollForResults(queryId: string) {
    let pollCount = 0;
    const maxPolls = 150; // 5 minutes

    this.pollTimer = setInterval(() => {
      pollCount++;

      this.classificationService.getClassification(queryId).subscribe({
        next: (result) => {
          if (result.status === 'completed') {
            this.stopPolling();
            this.analysis = {
              id: queryId,
              projectName: this.projectName,
              projectCode: this.projectCode || undefined,
              municipality: this.municipality || undefined,
              description: this.description || undefined,
              createdAt: result.created_at || new Date().toISOString(),
              gaps: result.classifications || [],
            };
            this.loading = false;
            this.pollingMessage = 'Análisis completado';
          } else if (result.status === 'error') {
            this.stopPolling();
            this.error = 'El análisis falló. Por favor, intenta nuevamente.';
            this.loading = false;
          } else if (result.status === 'pending') {
            this.pollingMessage = `Pendiente de procesamiento... (${pollCount}s)`;
          } else if (result.status === 'processing') {
            this.pollingMessage = `Procesando con Gemini AI... (${pollCount}s)`;
          }
        },
        error: () => {
          if (pollCount >= maxPolls) {
            this.stopPolling();
            this.error = 'Tiempo de espera agotado. El análisis está tomando demasiado tiempo.';
            this.loading = false;
          }
        }
      });
    }, 2000); // Poll every 2 seconds
  }

  private stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  reset() {
    this.stopPolling();
    this.projectName = '';
    this.projectCode = '';
    this.municipality = '';
    this.description = '';
    this.analysis = null;
    this.error = '';
    this.formError = '';
    this.loading = false;
  }

  download() {
    if (!this.analysis) return;

    const dataStr = JSON.stringify(this.analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analisis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
