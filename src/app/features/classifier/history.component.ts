import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClassificationService, ClassificationResponse } from '../../services/classification.service';

interface Classification {
  gap_indicator_id: number;
  gap_name: string;
  sector_name: string;
  indicator_type: string;
  confidence_score: number;
  justification: string;
  ranking_position: number;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">

      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold text-white">Historial de análisis</h1>
          <p class="text-gray-400 mt-1">Todas tus consultas de clasificación de proyectos</p>
        </div>
        <a routerLink="/classify"
           class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo análisis
        </a>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <svg class="h-10 w-10 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
          <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
        </svg>
        <span class="ml-3 text-gray-400">Cargando historial...</span>
      </div>

      <!-- Auto-refresh notice -->
      <div *ngIf="!loading && hasPending" class="flex items-center gap-2 text-amber-400 text-sm mb-4 bg-amber-900/20 border border-amber-800/50 rounded-lg px-4 py-2.5">
        <svg class="h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
          <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
        </svg>
        Hay consultas en proceso — actualizando automáticamente cada {{ refreshInterval / 1000 }}s
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && queries.length === 0"
           class="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-14 h-14 mx-auto text-gray-600 mb-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m6-11.25a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-400 mb-4">No tienes consultas aún</p>
        <a routerLink="/classify" class="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">
          Crea tu primer análisis →
        </a>
      </div>

      <!-- Queries list -->
      <div *ngIf="!loading && queries.length > 0" class="space-y-3">
        <div *ngFor="let q of queries"
             class="bg-gray-800 border rounded-xl overflow-hidden transition-all"
             [ngClass]="expandedId === q.query_id ? 'border-indigo-700/60' : 'border-gray-700'">

          <!-- Row header (clickable) -->
          <div (click)="toggleExpand(q)"
               class="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-700/30 transition-colors select-none">

            <!-- Status icon -->
            <div [ngClass]="{
                'bg-emerald-900/30 text-emerald-400': q.status === 'completed',
                'bg-amber-900/30 text-amber-400': q.status === 'pending',
                'bg-blue-900/30 text-blue-400': q.status === 'processing',
                'bg-red-900/30 text-red-400': q.status === 'error'
              }" class="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
              <svg *ngIf="q.status === 'completed'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
              </svg>
              <svg *ngIf="q.status === 'pending' || q.status === 'processing'" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
                <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
              </svg>
              <svg *ngIf="q.status === 'error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
              </svg>
            </div>

            <!-- Title & date -->
            <div class="flex-1 min-w-0">
              <p class="font-medium text-white truncate">{{ q.title || 'Sin título' }}</p>
              <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                <p class="text-xs text-gray-500">{{ q.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
                <span *ngIf="q.district" class="inline-flex items-center gap-1 text-xs text-indigo-300/80">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3 shrink-0">
                    <path fill-rule="evenodd" d="M8 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM5.5 6a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z" clip-rule="evenodd" />
                    <path d="M8 11.5c-2.5 0-4.772.862-5.8 2.117A7.468 7.468 0 0 0 8 15.5a7.468 7.468 0 0 0 5.8-1.883C12.772 12.362 10.5 11.5 8 11.5Z" />
                  </svg>
                  {{ q.department }}
                  <span class="text-gray-600">/</span>
                  {{ q.province }}
                  <span class="text-gray-600">/</span>
                  {{ q.district }}
                  <span *ngIf="q.ubigeo_code" class="text-gray-500">({{ q.ubigeo_code }})</span>
                </span>
              </div>
              <!-- Top brecha preview (visible cuando ya se cargó el detalle) -->
              <div *ngIf="getTopClassification(q.query_id) as top"
                   class="flex items-center gap-2 mt-1.5">
                <span [ngClass]="{
                    'text-emerald-400': top.confidence_score >= 0.8,
                    'text-amber-400':   top.confidence_score >= 0.6 && top.confidence_score < 0.8,
                    'text-red-400':     top.confidence_score < 0.6
                  }" class="text-xs font-bold shrink-0">
                  {{ top.confidence_score * 100 | number:'1.0-0' }}%
                </span>
                <span class="text-xs text-gray-500 shrink-0">Brecha:</span>
                <span class="text-xs text-gray-300 truncate">{{ top.gap_name }}</span>
              </div>
            </div>

            <!-- Status badge -->
            <span [ngClass]="{
                'bg-emerald-900/20 text-emerald-400 border-emerald-800': q.status === 'completed',
                'bg-amber-900/20 text-amber-400 border-amber-800': q.status === 'pending',
                'bg-blue-900/20 text-blue-400 border-blue-800': q.status === 'processing',
                'bg-red-900/20 text-red-400 border-red-800': q.status === 'error'
              }"
              class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border">
              {{ getStatusLabel(q.status) }}
            </span>

            <!-- Classification status badge -->
            <span *ngIf="q.status === 'completed' && q.classification_status"
              [ngClass]="{
                'bg-emerald-900/20 text-emerald-400 border-emerald-800': q.classification_status === 'classified',
                'bg-red-900/20 text-red-400 border-red-800': q.classification_status === 'unclassified'
              }"
              class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border">
              {{ q.classification_status === 'classified' ? 'Clasificado' : 'No clasificado' }}
            </span>

            <!-- Expand chevron -->
            <svg *ngIf="q.status === 'completed'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
              class="w-4 h-4 text-gray-500 shrink-0 transition-transform"
              [class.rotate-180]="expandedId === q.query_id">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          <!-- Expanded classifications -->
          <div *ngIf="expandedId === q.query_id && q.status === 'completed'"
               class="border-t border-gray-700 px-5 py-4">

            <!-- Loading results -->
            <div *ngIf="loadingDetail === q.query_id" class="flex items-center gap-2 py-2 text-gray-400 text-sm">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
                <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
              </svg>
              Cargando clasificaciones...
            </div>

            <!-- No results -->
            <div *ngIf="loadingDetail !== q.query_id && getClassifications(q.query_id).length === 0"
                 class="flex items-center justify-between py-2">
              <span class="text-gray-500 text-sm">No se encontraron indicadores de brecha para este proyecto.</span>
              <button (click)="retryClassification(q, $event)"
                      [disabled]="retrying.has(q.query_id)"
                      class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-700/50 text-indigo-400 hover:bg-indigo-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <svg *ngIf="!retrying.has(q.query_id)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <svg *ngIf="retrying.has(q.query_id)" class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
                  <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
                </svg>
                {{ retrying.has(q.query_id) ? 'Reintentando...' : 'Reintentar' }}
              </button>
            </div>

            <!-- Results -->
            <div *ngIf="loadingDetail !== q.query_id && getClassifications(q.query_id).length > 0"
                 class="space-y-3">
              <div *ngFor="let c of getClassifications(q.query_id)"
                   class="bg-gray-900 rounded-lg p-4 flex flex-col md:flex-row md:items-start gap-4">
                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-xs text-gray-600 font-bold w-4">#{{ c.ranking_position }}</span>
                  <span [ngClass]="{
                      'text-emerald-400': c.confidence_score >= 0.8,
                      'text-amber-400': c.confidence_score >= 0.6 && c.confidence_score < 0.8,
                      'text-red-400': c.confidence_score < 0.6
                    }" class="text-xl font-extrabold w-14 text-right">{{ c.confidence_score * 100 | number:'1.0-0' }}%</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-white text-sm">{{ c.gap_name || 'Indicador #' + c.gap_indicator_id }}</p>
                  <div class="flex flex-wrap gap-1.5 mt-1.5">
                    <span *ngIf="c.sector_name" class="text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded">
                      <span class="text-gray-500">Sector: </span>{{ c.sector_name }}
                    </span>
                    <span *ngIf="c.indicator_type" [ngClass]="c.indicator_type === 'COBERTURA'
                        ? 'bg-blue-900/30 text-blue-400 border-blue-800'
                        : 'bg-purple-900/30 text-purple-400 border-purple-800'"
                      class="text-xs px-2 py-0.5 rounded border font-semibold">
                      <span class="opacity-60">Tipo de Indicador: </span>{{ c.indicator_type }}
                    </span>
                  </div>
                  <p *ngIf="c.justification" class="text-xs text-gray-400 leading-relaxed mt-2">
                    <span class="opacity-60">Justificación: </span>{{ c.justification }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending/Processing message -->
          <div *ngIf="expandedId === q.query_id && (q.status === 'pending' || q.status === 'processing')"
               class="border-t border-gray-700 px-5 py-4 text-sm text-amber-400">
            Tu consulta está siendo procesada por el worker de IA. El resultado aparecerá aquí automáticamente.
          </div>

        </div>
      </div>
    </div>
  `,
})
export class HistoryComponent implements OnInit, OnDestroy {
  queries: ClassificationResponse[] = [];
  loading = false;
  expandedId: string | null = null;
  loadingDetail: string | null = null;
  classificationsCache: Record<string, Classification[]> = {};
  retrying = new Set<string>();
  readonly refreshInterval = 8000;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  get hasPending(): boolean {
    return this.queries.some(q => q.status === 'pending' || q.status === 'processing');
  }

  constructor(private classificationService: ClassificationService) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading = this.queries.length === 0;
    this.classificationService.getHistory().subscribe({
      next: (data) => {
        this.queries = data.sort((a, b) =>
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        this.loading = false;
        this.scheduleRefreshIfNeeded();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private scheduleRefreshIfNeeded() {
    this.stopRefresh();
    if (this.hasPending) {
      this.refreshTimer = setInterval(() => this.loadHistory(), this.refreshInterval);
    }
  }

  private stopRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  toggleExpand(q: ClassificationResponse) {
    if (q.status !== 'completed') return;

    if (this.expandedId === q.query_id) {
      this.expandedId = null;
      return;
    }

    this.expandedId = q.query_id;

    if (!this.classificationsCache[q.query_id]) {
      this.loadingDetail = q.query_id;
      this.classificationService.getClassification(q.query_id).subscribe({
        next: (result) => {
          this.classificationsCache[q.query_id] = (result.classifications || []) as Classification[];
          this.loadingDetail = null;
        },
        error: () => {
          this.classificationsCache[q.query_id] = [];
          this.loadingDetail = null;
        },
      });
    }
  }

  getClassifications(queryId: string): Classification[] {
    return this.classificationsCache[queryId] || [];
  }

  getTopClassification(queryId: string): Classification | null {
    const list = this.classificationsCache[queryId];
    return list && list.length > 0 ? list[0] : null;
  }

  retryClassification(q: ClassificationResponse, event: Event) {
    event.stopPropagation();
    if (this.retrying.has(q.query_id)) return;

    this.retrying.add(q.query_id);
    this.classificationService.retryQuery(q.query_id).subscribe({
      next: () => {
        this.retrying.delete(q.query_id);
        this.expandedId = null;
        delete this.classificationsCache[q.query_id];
        this.loadHistory();
      },
      error: () => {
        this.retrying.delete(q.query_id);
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      completed: 'Completado',
      pending: 'Pendiente',
      processing: 'Procesando',
      error: 'Error',
    };
    return labels[status] || status;
  }

  ngOnDestroy() {
    this.stopRefresh();
  }
}
