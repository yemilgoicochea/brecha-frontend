import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassificationService, ClassificationResponse } from '../../services/classification.service';
import { RouterModule } from '@angular/router';

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
              <th class="px-4 py-2 text-left font-medium">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr *ngFor="let item of list">
              <td class="px-4 py-2">{{ item.created_at | date:'short' }}</td>
              <td class="px-4 py-2">{{ item.title || '-' }}</td>
              <td class="px-4 py-2">{{ item.status }}</td>
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
  list: ClassificationResponse[] = [];
  constructor(private svc: ClassificationService) {}

  ngOnInit() {
    this.svc.getHistory().subscribe({
      next: (history) => {
        this.list = history;
      },
      error: () => {
        this.list = [];
      }
    });
  }
}