import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassificationService } from './classification.service';
import { RouterModule } from '@angular/router';
import { ProjectAnalysis } from '../../models/analysis.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="mx-auto max-w-5xl">
      <h1 class="text-3xl font-extrabold mb-6">Historial de análisis</h1>
      <div *ngIf="list.length; else empty" class="overflow-x-auto rounded border border-gray-200 bg-white">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-700">
            <tr>
              <th class="px-4 py-2 text-left font-medium">Fecha</th>
              <th class="px-4 py-2 text-left font-medium">Proyecto</th>
              <th class="px-4 py-2 text-left font-medium">Municipalidad</th>
              <th class="px-4 py-2 text-left font-medium">Brechas</th>
              <th class="px-4 py-2 text-left font-medium">Archivo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr *ngFor="let item of list">
              <td class="px-4 py-2">{{ item.createdAt | date:'short' }}</td>
              <td class="px-4 py-2">{{ item.projectName }}</td>
              <td class="px-4 py-2">{{ item.municipality || '-' }}</td>
              <td class="px-4 py-2">{{ item.gaps.length }}</td>
              <td class="px-4 py-2">{{ item.fileName || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #empty>
        <p class="text-sm text-gray-500">Aún no hay análisis guardados.</p>
      </ng-template>
    </section>
  `
})
export class HistoryComponent implements OnInit {
  list: ProjectAnalysis[] = [];
  constructor(private svc: ClassificationService) {}
  ngOnInit() { this.list = this.svc.history.sort((a,b)=> b.createdAt.localeCompare(a.createdAt)); }
}