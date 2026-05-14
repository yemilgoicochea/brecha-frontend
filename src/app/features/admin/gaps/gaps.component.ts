import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService, Gap, GapCreate, GapListResponse, GovernmentLevel, Sector } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-gaps',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">

      <!-- Header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <a routerLink="/dashboard" class="hover:text-white transition-colors">Dashboard</a>
            <span>/</span>
            <a routerLink="/admin/sectors" class="hover:text-white transition-colors">Sectores</a>
            <span>/</span>
            <span class="text-white">Brechas</span>
          </div>
          <h1 class="text-3xl font-extrabold text-white">Indicadores de Brecha</h1>
          <p class="text-gray-400 mt-1">CRUD de indicadores de brecha por sector</p>
        </div>
        <button (click)="openCreate()"
          class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo indicador
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-[180px]">
          <label class="block text-xs text-gray-400 mb-1">Sector</label>
          <select [(ngModel)]="filters.sector_id" (change)="applyFilters()"
            class="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
            <option [ngValue]="undefined">Todos los sectores</option>
            <option *ngFor="let s of sectors" [ngValue]="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div class="min-w-[160px]">
          <label class="block text-xs text-gray-400 mb-1">Tipo</label>
          <select [(ngModel)]="filters.indicator_type" (change)="applyFilters()"
            class="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
            <option value="">Todos</option>
            <option value="COBERTURA">Cobertura</option>
            <option value="CALIDAD">Calidad</option>
          </select>
        </div>
        <div class="min-w-[140px]">
          <label class="block text-xs text-gray-400 mb-1">Estado</label>
          <select [(ngModel)]="filters.is_active" (change)="applyFilters()"
            class="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
            <option [ngValue]="undefined">Todos</option>
            <option [ngValue]="true">Activos</option>
            <option [ngValue]="false">Inactivos</option>
          </select>
        </div>
        <button (click)="resetFilters()"
          class="px-3 py-2 text-sm text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
          Limpiar
        </button>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-900/20 border border-red-700 text-red-400 rounded-lg p-4 mb-6">
        {{ error }}
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <svg class="h-10 w-10 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
          <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
        </svg>
        <span class="ml-3 text-gray-400">Cargando...</span>
      </div>

      <!-- Table -->
      <div *ngIf="!loading" class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div *ngIf="gaps.length === 0" class="py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto text-gray-600 mb-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p class="text-gray-400">No se encontraron indicadores</p>
        </div>

        <table *ngIf="gaps.length > 0" class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-700 bg-gray-900/50">
              <th class="text-left px-5 py-4 text-gray-400 font-medium">Código</th>
              <th class="text-left px-5 py-4 text-gray-400 font-medium">Indicador</th>
              <th class="text-left px-5 py-4 text-gray-400 font-medium hidden lg:table-cell">Sector</th>
              <th class="text-center px-5 py-4 text-gray-400 font-medium">Tipo</th>
              <th class="text-center px-5 py-4 text-gray-400 font-medium">Estado</th>
              <th class="text-center px-5 py-4 text-gray-400 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let gap of gaps"
                class="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
              <td class="px-5 py-4">
                <p *ngIf="gap.indicator_code" class="font-medium text-white leading-snug">{{ gap.indicator_code }}</p>
              </td>
              <td class="px-5 py-4">
                <p class="font-medium text-white leading-snug">{{ gap.name }}</p>
              </td>
              <td class="px-5 py-4 text-gray-400 hidden lg:table-cell text-sm">{{ gap.sector_name || '—' }}</td>
              <td class="px-5 py-4 text-center">
                <span [ngClass]="gap.indicator_type === 'COBERTURA'
                    ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
                    : 'bg-purple-900/30 text-purple-400 border border-purple-800'"
                  class="px-2.5 py-1 rounded-full text-xs font-semibold">
                  {{ gap.indicator_type }}
                </span>
              </td>
              <td class="px-5 py-4 text-center">
                <span [ngClass]="gap.is_active
                    ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                    : 'bg-red-900/30 text-red-400 border border-red-800'"
                  class="px-2.5 py-1 rounded-full text-xs font-semibold">
                  {{ gap.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-5 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button (click)="openEdit(gap)"
                    class="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/20 rounded-lg transition-colors"
                    title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button *ngIf="gap.is_active" (click)="confirmDelete(gap)"
                    class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Desactivar">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="px-5 py-4 border-t border-gray-700 flex items-center justify-between text-sm">
          <span class="text-gray-400">
            {{ (currentPage - 1) * pageLimit + 1 }}–{{ Math.min(currentPage * pageLimit, totalItems) }}
            de {{ totalItems }} indicadores
          </span>
          <div class="flex gap-2">
            <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1"
              class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-40 transition-colors">
              Anterior
            </button>
            <span class="px-3 py-1.5 text-gray-400">{{ currentPage }} / {{ totalPages }}</span>
            <button (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages"
              class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-40 transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ───────── MODAL ───────── -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto py-8 px-4">
      <div class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl">
        <!-- Modal header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-700">
          <h2 class="text-lg font-bold text-white">
            {{ editingGap ? 'Editar indicador' : 'Nuevo indicador' }}
          </h2>
          <button (click)="closeModal()" class="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal body -->
        <form (ngSubmit)="saveGap()" class="px-6 py-5 space-y-5">
          <!-- Básico -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm text-gray-400 mb-1">Nombre <span class="text-red-400">*</span></label>
              <input [(ngModel)]="form.name" name="name" required
                class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Nombre del indicador" />
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Sector <span class="text-red-400">*</span></label>
              <select [(ngModel)]="form.sector_id" name="sector_id" required
                class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                <option [ngValue]="0" disabled>Selecciona un sector</option>
                <option *ngFor="let s of sectors" [ngValue]="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Tipo <span class="text-red-400">*</span></label>
              <select [(ngModel)]="form.indicator_type" name="indicator_type" required
                class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                <option value="COBERTURA">Cobertura</option>
                <option value="CALIDAD">Calidad</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Unidad de medida</label>
              <input [(ngModel)]="form.unit_measure" name="unit_measure"
                class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Ej: Porcentaje (%)" />
            </div>
          </div>

          <!-- Funcional -->
          <div>
            <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Clasificación funcional</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-400 mb-1">Función</label>
                <input [(ngModel)]="form.function_name" name="function_name"
                  class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">División</label>
                <input [(ngModel)]="form.division_name" name="division_name"
                  class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Grupo funcional</label>
                <input [(ngModel)]="form.group_functional" name="group_functional"
                  class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Servicio</label>
                <input [(ngModel)]="form.service_name" name="service_name"
                  class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Nivel geográfico</label>
                <input [(ngModel)]="form.geographic_level" name="geographic_level"
                  class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Tipología</label>
                <input [(ngModel)]="form.typology" name="typology"
                  class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          </div>

          <!-- Contenido -->
          <div>
            <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Contenido</p>
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-gray-400 mb-1">Definición</label>
                <textarea [(ngModel)]="form.definition" name="definition" rows="3"
                  class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Definición oficial del indicador"></textarea>
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Justificación</label>
                <textarea [(ngModel)]="form.justification" name="justification" rows="3"
                  class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Justificación técnica"></textarea>
              </div>
            </div>
          </div>

          <!-- Niveles de gobierno -->
          <div>
            <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Niveles de gobierno</p>
            <div *ngIf="governmentLevels.length === 0" class="text-xs text-gray-500 italic">Cargando niveles...</div>
            <div class="grid grid-cols-2 gap-2">
              <label *ngFor="let lvl of governmentLevels"
                class="flex items-center gap-2.5 cursor-pointer rounded-lg px-3 py-2 border transition-colors"
                [ngClass]="isLevelSelected(lvl.id)
                  ? 'border-indigo-600 bg-indigo-900/20 text-indigo-300'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'">
                <input type="checkbox" [checked]="isLevelSelected(lvl.id)" (change)="toggleLevel(lvl.id)"
                  class="accent-indigo-500 w-4 h-4 shrink-0" />
                <span class="text-sm leading-snug">{{ lvl.name }}</span>
              </label>
            </div>
          </div>

          <!-- Vigencia -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Vigente desde</label>
              <input [(ngModel)]="form.valid_from" name="valid_from" type="date"
                class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Vigente hasta</label>
              <input [(ngModel)]="form.valid_to" name="valid_to" type="date"
                class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <!-- Errores del form -->
          <div *ngIf="formError" class="bg-red-900/20 border border-red-700 text-red-400 rounded-lg p-3 text-sm">
            {{ formError }}
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2 border-t border-gray-700">
            <button type="button" (click)="closeModal()"
              class="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" [disabled]="saving"
              class="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              <svg *ngIf="saving" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
                <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
              </svg>
              {{ saving ? 'Guardando...' : (editingGap ? 'Actualizar' : 'Crear indicador') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ───────── CONFIRM DELETE MODAL ───────── -->
    <div *ngIf="gapToDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-red-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white">Desactivar indicador</h3>
        </div>
        <p class="text-gray-400 text-sm mb-6">
          ¿Estás seguro de desactivar <span class="text-white font-medium">{{ gapToDelete.name }}</span>?
          El indicador quedará inactivo pero no se eliminará permanentemente.
        </p>
        <div class="flex justify-end gap-3">
          <button (click)="gapToDelete = null"
            class="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 border border-gray-700 rounded-lg transition-colors">
            Cancelar
          </button>
          <button (click)="deleteGap()" [disabled]="saving"
            class="px-4 py-2 text-sm font-medium bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50">
            {{ saving ? 'Desactivando...' : 'Desactivar' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class GapsComponent implements OnInit {
  Math = Math;

  gaps: Gap[] = [];
  sectors: Sector[] = [];
  loading = false;
  error = '';

  // Pagination
  currentPage = 1;
  pageLimit = 20;
  totalItems = 0;
  totalPages = 1;

  // Filters
  filters: { sector_id?: number; indicator_type?: string; is_active?: boolean } = {};

  // Modal
  showModal = false;
  editingGap: Gap | null = null;
  saving = false;
  formError = '';
  form: GapCreate = this.emptyForm();

  // Government levels
  governmentLevels: GovernmentLevel[] = [];
  selectedLevelIds: number[] = [];

  // Delete confirm
  gapToDelete: Gap | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadSectors();
    this.loadGaps();
    this.loadGovernmentLevels();
  }

  emptyForm(): GapCreate {
    return {
      sector_id: 0,
      name: '',
      indicator_type: 'COBERTURA',
      unit_measure: '',
      geographic_level: '',
      function_name: '',
      division_name: '',
      group_functional: '',
      service_name: '',
      typology: '',
      definition: '',
      justification: '',
      valid_from: '',
      valid_to: '',
    };
  }

  loadSectors() {
    this.adminService.getSectors().subscribe({
      next: (data) => (this.sectors = data.filter(s => s.is_active)),
      error: () => {},
    });
  }

  loadGovernmentLevels() {
    this.adminService.getGovernmentLevels().subscribe({
      next: (data) => (this.governmentLevels = data),
      error: () => {},
    });
  }

  isLevelSelected(id: number): boolean {
    return this.selectedLevelIds.includes(id);
  }

  toggleLevel(id: number) {
    const idx = this.selectedLevelIds.indexOf(id);
    if (idx > -1) {
      this.selectedLevelIds.splice(idx, 1);
    } else {
      this.selectedLevelIds.push(id);
    }
  }

  loadGaps() {
    this.loading = true;
    this.error = '';
    this.adminService.getGaps({
      ...this.filters,
      page: this.currentPage,
      limit: this.pageLimit,
    }).subscribe({
      next: (res: GapListResponse) => {
        this.gaps = res.items;
        this.totalItems = res.total;
        this.totalPages = res.pages;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar los indicadores.';
        this.loading = false;
      },
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadGaps();
  }

  resetFilters() {
    this.filters = {};
    this.currentPage = 1;
    this.loadGaps();
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadGaps();
  }

  // ── Modal ──────────────────────────────────────────────
  openCreate() {
    this.editingGap = null;
    this.form = this.emptyForm();
    this.selectedLevelIds = [];
    this.formError = '';
    this.showModal = true;
  }

  openEdit(gap: Gap) {
    this.editingGap = gap;
    this.selectedLevelIds = [];
    this.formError = '';

    this.adminService.getGap(gap.id).subscribe({
      next: (detail) => {
        this.form = {
          sector_id: detail.sector_id,
          name: detail.name,
          indicator_type: detail.indicator_type,
          unit_measure: detail.unit_measure || '',
          geographic_level: detail.geographic_level || '',
          function_name: detail.function_name || '',
          division_name: detail.division_name || '',
          group_functional: detail.group_functional || '',
          service_name: detail.service_name || '',
          typology: detail.typology || '',
          definition: detail.definition || '',
          justification: detail.justification || '',
          valid_from: detail.valid_from || '',
          valid_to: detail.valid_to || '',
        };
        this.selectedLevelIds = (detail.government_levels || []).map(l => l.id);
      },
      error: () => {
        this.form = {
          sector_id: gap.sector_id,
          name: gap.name,
          indicator_type: gap.indicator_type,
          unit_measure: gap.unit_measure || '',
          geographic_level: gap.geographic_level || '',
          function_name: gap.function_name || '',
          division_name: gap.division_name || '',
          group_functional: gap.group_functional || '',
          service_name: gap.service_name || '',
          typology: gap.typology || '',
          definition: gap.definition || '',
          justification: gap.justification || '',
          valid_from: gap.valid_from || '',
          valid_to: gap.valid_to || '',
        };
      },
    });

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingGap = null;
  }

  saveGap() {
    if (!this.form.name?.trim() || !this.form.sector_id) {
      this.formError = 'Nombre y sector son obligatorios.';
      return;
    }
    this.saving = true;
    this.formError = '';

    // Strip empty strings to avoid sending noise
    const payload: any = {};
    for (const [k, v] of Object.entries(this.form)) {
      if (v !== '' && v !== null && v !== undefined) {
        payload[k] = v;
      }
    }
    payload['government_level_ids'] = this.selectedLevelIds;

    const request$ = this.editingGap
      ? this.adminService.updateGap(this.editingGap.id, payload)
      : this.adminService.createGap(payload as GapCreate);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadGaps();
      },
      error: () => {
        this.formError = 'Error al guardar. Verifica los datos e intenta nuevamente.';
        this.saving = false;
      },
    });
  }

  // ── Delete ─────────────────────────────────────────────
  confirmDelete(gap: Gap) {
    this.gapToDelete = gap;
  }

  deleteGap() {
    if (!this.gapToDelete) return;
    this.saving = true;
    this.adminService.deleteGap(this.gapToDelete.id).subscribe({
      next: () => {
        this.saving = false;
        this.gapToDelete = null;
        this.loadGaps();
      },
      error: () => {
        this.saving = false;
        this.error = 'Error al desactivar el indicador.';
        this.gapToDelete = null;
      },
    });
  }
}
