import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GapResult } from '../../models/analysis.model';

@Component({
  selector: 'app-gap-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4" *ngIf="gaps.length; else empty">
      <div *ngFor="let g of gaps; let i = index" class="flex items-center gap-4 rounded-xl border border-gray-200 bg-white/80 backdrop-blur px-5 py-4 shadow-sm hover:shadow-md transition">
        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
            <path fill-rule="evenodd" d="M4.5 5.25A2.25 2.25 0 016.75 3h10.5A2.25 2.25 0 0119.5 5.25v13.5A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V5.25zM7.5 7.5a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9zm0 3a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9zm0 3a.75.75 0 000 1.5h5.25a.75.75 0 000-1.5H7.5z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold"><span class="text-indigo-600 font-bold">{{ g.score * 100 | number:'1.0-0' }}%</span> · {{ g.name }}</p>
          <p class="text-xs text-gray-500 mt-0.5">{{ g.reason || 'Motivo no disponible' }}</p>
        </div>
      </div>
    </div>
    <ng-template #empty>
      <p class="text-sm text-gray-400">Sin brechas todavía.</p>
    </ng-template>
  `
})
export class GapCardsComponent {
  @Input() gaps: GapResult[] = [];
}