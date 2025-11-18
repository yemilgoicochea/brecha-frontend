import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProjectAnalysis } from '../../models/analysis.model';

@Injectable({ providedIn: 'root' })
export class ClassificationService {
  private storageKey = 'projectAnalyses';
  latest$ = new BehaviorSubject<ProjectAnalysis | null>(null);

  get history(): ProjectAnalysis[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try { return JSON.parse(raw) as ProjectAnalysis[]; } catch { return []; }
  }

  private saveHistory(list: ProjectAnalysis[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(list));
  }

  async classify(file: File | undefined, text: string, meta: { projectName: string; projectCode?: string; municipality?: string; description?: string; } ): Promise<ProjectAnalysis> {
    // Mock implementation until backend is ready
    const gaps = [
      { name: 'Brecha 1', score: 0.97, reason: 'Motivo de la elección' },
      { name: 'Brecha 2', score: 0.94, reason: 'Motivo de la elección' },
      { name: 'Brecha 3', score: 0.90, reason: 'Motivo de la elección' }
    ];
    const genId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
      ? (crypto as any).randomUUID()
      : 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random()*16|0;
          const v = c === 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
        });
    const analysis: ProjectAnalysis = {
      id: genId,
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
  }
}
