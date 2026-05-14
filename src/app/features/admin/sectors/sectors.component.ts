import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, Sector } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-sectors',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <a routerLink="/dashboard" class="hover:text-white transition-colors">Dashboard</a>
            <span>/</span>
            <span class="text-white">Sectores</span>
          </div>
          <h1 class="text-3xl font-extrabold text-white">Gestión de Sectores</h1>
          <p class="text-gray-400 mt-1">Administra los sectores del sistema Invierte.pe</p>
        </div>
        <a routerLink="/admin/gaps"
           class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Ver Brechas
        </a>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <svg class="h-10 w-10 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
          <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
        </svg>
        <span class="ml-3 text-gray-400">Cargando sectores...</span>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-900/20 border border-red-700 text-red-400 rounded-lg p-4 mb-6">
        {{ error }}
      </div>

      <!-- Stats row -->
      <div *ngIf="!loading" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p class="text-3xl font-extrabold text-white">{{ sectors.length }}</p>
          <p class="text-sm text-gray-400 mt-1">Total</p>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p class="text-3xl font-extrabold text-emerald-400">{{ activeSectors }}</p>
          <p class="text-sm text-gray-400 mt-1">Activos</p>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p class="text-3xl font-extrabold text-red-400">{{ sectors.length - activeSectors }}</p>
          <p class="text-sm text-gray-400 mt-1">Inactivos</p>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p class="text-3xl font-extrabold text-indigo-400">{{ totalGaps }}</p>
          <p class="text-sm text-gray-400 mt-1">Total brechas</p>
        </div>
      </div>

      <!-- Table -->
      <div *ngIf="!loading && sectors.length > 0" class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-700 bg-gray-900/50">
              <th class="text-left px-6 py-4 text-gray-400 font-medium">Código</th>
              <th class="text-left px-6 py-4 text-gray-400 font-medium">Sector</th>
              <th class="text-left px-6 py-4 text-gray-400 font-medium hidden md:table-cell">Nombre transparencia</th>
              <th class="text-center px-6 py-4 text-gray-400 font-medium">Brechas</th>
              <th class="text-center px-6 py-4 text-gray-400 font-medium">Estado</th>
              <th class="text-center px-6 py-4 text-gray-400 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let sector of sectors"
                class="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
              <td class="px-6 py-4">
                <span class="text-xs font-mono text-gray-400 bg-gray-900 px-2 py-1 rounded">{{ sector.code }}</span>
              </td>
              <td class="px-6 py-4 font-medium text-white">{{ sector.name }}</td>
              <td class="px-6 py-4 text-gray-400 hidden md:table-cell">{{ sector.transparency_name || '—' }}</td>
              <td class="px-6 py-4 text-center">
                <span class="text-indigo-400 font-semibold">{{ sector.gap_count }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span [ngClass]="sector.is_active
                    ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                    : 'bg-red-900/30 text-red-400 border border-red-800'"
                  class="px-3 py-1 rounded-full text-xs font-semibold">
                  {{ sector.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <button
                  (click)="toggleSector(sector)"
                  [disabled]="toggling === sector.id"
                  [ngClass]="sector.is_active
                    ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-800'
                    : 'bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-800'"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                  {{ toggling === sector.id ? '...' : (sector.is_active ? 'Desactivar' : 'Activar') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class SectorsComponent implements OnInit {
  sectors: Sector[] = [];
  loading = false;
  error = '';
  toggling: number | null = null;

  get activeSectors(): number {
    return this.sectors.filter(s => s.is_active).length;
  }

  get totalGaps(): number {
    return this.sectors.reduce((sum, s) => sum + (s.gap_count || 0), 0);
  }

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadSectors();
  }

  loadSectors() {
    this.loading = true;
    this.error = '';
    this.adminService.getSectors().subscribe({
      next: (data) => {
        this.sectors = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar los sectores.';
        this.loading = false;
      },
    });
  }

  toggleSector(sector: Sector) {
    this.toggling = sector.id;
    this.adminService.toggleSector(sector.id).subscribe({
      next: (res) => {
        sector.is_active = res.is_active;
        this.toggling = null;
      },
      error: () => {
        this.error = 'Error al actualizar el sector.';
        this.toggling = null;
      },
    });
  }
}
