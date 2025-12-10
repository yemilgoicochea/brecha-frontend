import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ProjectAnalysis, GapResult } from '../../models/analysis.model';
import { API_CONFIG, getApiUrl } from '../../config/api.config';

interface ApiLabel {
  id?: number;
  label: string;
  confianza: number;
  justificacion: string;
}

interface ApiResponse {
  labels: ApiLabel[];
}

@Injectable({ providedIn: 'root' })
export class ClassificationService {
  private storageKey = 'projectAnalyses';
  latest$ = new BehaviorSubject<ProjectAnalysis | null>(null);

  constructor(private http: HttpClient) {}

  get history(): ProjectAnalysis[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try { return JSON.parse(raw) as ProjectAnalysis[]; } catch { return []; }
  }

  private saveHistory(list: ProjectAnalysis[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(list));
  }

  private generateId(): string {
    return (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
      ? (crypto as any).randomUUID()
      : 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random()*16|0;
          const v = c === 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
        });
  }

  async classify(file: File | undefined, text: string, meta: { projectName: string; projectCode?: string; municipality?: string; description?: string; } ): Promise<ProjectAnalysis> {
    try {
      // Llamar a la API con el título (por ahora solo title)
      const apiUrl = getApiUrl(API_CONFIG.endpoints.classify);
      const response: any = await this.http.post(apiUrl, {
        title: meta.projectName
      }).toPromise();

      // Si la API responde con error, lanzar excepción con el mensaje
      if (response?.error) {
        throw new Error(response.error + (response.detalle_error ? `\n${response.detalle_error}` : ''));
      }

      if (!response?.labels) {
        throw new Error('Respuesta inválida de la API');
      }

      // Mapear respuesta de API al modelo interno
      const gaps: GapResult[] = response.labels.map((label: any) => ({
        id: label.id,
        name: label.label,
        score: label.confianza,
        reason: label.justificacion
      }));

      const analysis: ProjectAnalysis = {
        id: this.generateId(),
        projectName: meta.projectName,
        projectCode: meta.projectCode,
        municipality: meta.municipality,
        description: meta.description,
        fileName: file?.name,
        createdAt: new Date().toISOString(),
        gaps
      };

      const list = [...this.history, analysis];
      this.saveHistory(list);
      this.latest$.next(analysis);
      return analysis;
    } catch (error) {
      console.error('Error al clasificar:', error);
      throw new Error(`Fallo en la clasificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}
