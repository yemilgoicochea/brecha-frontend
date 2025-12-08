import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassificationService } from './classification.service';
import { GapCardsComponent } from './gap-cards.component';
import { ProjectAnalysis } from '../../models/analysis.model';

@Component({
  selector: 'app-classifier-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GapCardsComponent],
  template: `
    <div class="grid gap-10 md:grid-cols-2">
      <form (ngSubmit)="classify()" class="space-y-6" #f="ngForm" aria-describedby="form-desc">
        <p id="form-desc" class="sr-only">Formulario para clasificar un proyecto y obtener brechas.</p>
        <h1 class="text-3xl font-extrabold">Identificar brechas</h1>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium">Nombre del proyecto</label>
            <input type="text" [(ngModel)]="projectName" name="projectName" required class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej: Electrificación rural" />
          </div>
          <div>
            <label class="block text-sm font-medium">Código (opcional)</label>
            <input type="text" [(ngModel)]="projectCode" name="projectCode" class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium">Municipalidad (opcional)</label>
            <input type="text" [(ngModel)]="municipality" name="municipality" class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Municipalidad Provincial de Tacna" />
          </div>
          <div>
            <label class="block text-sm font-medium">Descripción</label>
            <textarea [(ngModel)]="description" name="description" rows="6" class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Descripción del proyecto y sus componentes"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium">Archivo (PDF / Word)</label>
            <input type="file" (change)="onFile($event)" accept=".pdf,.doc,.docx" class="mt-1 w-full text-sm" />
            <div *ngIf="file" class="text-xs text-gray-500 mt-1">Seleccionado: {{ file.name }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button type="button" (click)="classify()" [disabled]="loading || !projectName" class="inline-flex items-center rounded bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="!loading">Identificar brechas</span>
            <span *ngIf="loading" class="flex items-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"/></svg>
              Procesando...
            </span>
          </button>
          <button type="reset" (click)="reset()" class="text-sm text-gray-500 hover:text-gray-700">Limpiar</button>
        </div>
        <!-- Solo mostrar error aquí si es de validación de formulario -->
        <div *ngIf="formError" class="text-sm text-red-600">{{ formError }}</div>
      </form>
      <div>
        <p class="text-xs font-semibold tracking-widest text-indigo-600 mb-2">RESULTADOS</p>
        <h2 class="text-4xl font-extrabold leading-tight mb-6">Brechas<br/>identificadas</h2>
        <ng-container *ngIf="error && !analysis">
          <div class="text-sm text-red-600 mb-4">{{ error }}</div>
        </ng-container>
        <ng-container *ngIf="analysis">
          <ng-container *ngIf="analysis.gaps.length === 0; else showGaps">
            <div class="text-sm text-gray-500 mb-4">No se identificaron brechas para este proyecto.</div>
          </ng-container>
          <ng-template #showGaps>
            <app-gap-cards [gaps]="analysis.gaps"></app-gap-cards>
          </ng-template>
          <div class="mt-6">
            <button (click)="download()" class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600" aria-label="Descargar resultados">
              Descargar resultados
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M12 3a.75.75 0 01.75.75v9.19l2.72-2.72a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 011.06-1.06l2.72 2.72V3.75A.75.75 0 0112 3zm-9 15.75A2.25 2.25 0 015.25 16.5h13.5A2.25 2.25 0 0121 18.75v.75a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 19.5v-.75z" clip-rule="evenodd"/></svg>
            </button>
            <div class="mt-4 rounded bg-gray-50 p-4 text-xs text-gray-600 border border-gray-200 overflow-auto max-h-64">
              <pre>{{ analysis | json }}</pre>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class ClassifierPageComponent {
  projectName = '';
  projectCode = '';
  municipality = '';
  description = '';
  file?: File;
  loading = false;
  error = '';
  formError = '';
  analysis: ProjectAnalysis | null = null;

  constructor(private svc: ClassificationService) {}

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.file = input.files?.[0];
  }

  async classify() {
    this.error = '';
    this.formError = '';
    if (!this.projectName.trim()) {
      this.formError = 'Nombre de proyecto requerido';
      return;
    }
    this.loading = true;
    try {
      this.analysis = await this.svc.classify(this.file, this.description, {
        projectName: this.projectName,
        projectCode: this.projectCode,
        municipality: this.municipality,
        description: this.description
      });
    } catch (e: any) {
      this.error = e.message || 'Error en la clasificación';
      this.analysis = null;
    } finally {
      this.loading = false;
    }
  }

  reset() {
    this.projectName = '';
    this.projectCode = '';
    this.municipality = '';
    this.description = '';
    this.file = undefined;
    this.analysis = null;
    this.error = '';
    this.formError = '';
  }

  download() {
    if (!this.analysis) return;
    const blob = new Blob([JSON.stringify(this.analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis-${this.analysis.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}