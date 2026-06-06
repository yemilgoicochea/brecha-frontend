import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClassificationService } from '../../services/classification.service';
import { UbigeoService, UbigeoDepartment, UbigeoProvince, UbigeoDistrict } from '../../services/ubigeo.service';

@Component({
  selector: 'app-classifier-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">

      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-white">Identificar brechas</h1>
        <p class="text-gray-400 mt-1">Ingresa el título de tu proyecto para clasificarlo con IA. El resultado quedará en tu historial.</p>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-5">

        <!-- Título -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Título del proyecto <span class="text-red-400">*</span>
          </label>
          <input [(ngModel)]="title" [disabled]="submitting"
            class="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            placeholder="Ej: Mejoramiento del servicio de agua potable en el distrito de San Juan" />
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Descripción <span class="text-gray-500 font-normal">(opcional)</span>
          </label>
          <textarea [(ngModel)]="description" [disabled]="submitting" rows="4"
            class="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none disabled:opacity-50"
            placeholder="Descripción adicional del proyecto..."></textarea>
        </div>

        <!-- Ubicación geográfica -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-3">
            Ubicación geográfica <span class="text-gray-500 font-normal">(opcional)</span>
          </label>
          <div class="space-y-3">

            <!-- DEPARTAMENTO -->
            <div>
              <label class="block text-xs text-gray-400 mb-1">Departamento</label>
              <div class="relative" id="dept-dropdown">
                <button type="button"
                  (click)="toggleDropdown('dept')"
                  [disabled]="submitting || loadingDepts"
                  class="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between disabled:opacity-50 focus:outline-none"
                  [class.border-indigo-500]="openDropdown === 'dept'">
                  <span [class.text-gray-500]="!selectedDeptCode">
                    {{ loadingDepts ? 'Cargando...' : (selectedDeptName || 'Seleccionar departamento') }}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                    class="w-4 h-4 text-gray-400 shrink-0 transition-transform"
                    [class.rotate-180]="openDropdown === 'dept'">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div *ngIf="openDropdown === 'dept'"
                  class="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl">
                  <div class="p-2 border-b border-gray-700">
                    <input #deptSearch [(ngModel)]="searchDept" placeholder="Buscar departamento..."
                      class="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                      (click)="$event.stopPropagation()" />
                  </div>
                  <ul class="max-h-52 overflow-y-auto py-1">
                    <li *ngFor="let d of filteredDepts"
                      (click)="selectDept(d)"
                      class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-800 text-white"
                      [class.bg-indigo-900]="d.code === selectedDeptCode"
                      [class.text-indigo-300]="d.code === selectedDeptCode">
                      {{ d.name }}
                    </li>
                    <li *ngIf="filteredDepts.length === 0" class="px-3 py-2 text-sm text-gray-500">Sin resultados</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- PROVINCIA -->
            <div>
              <label class="block text-xs mb-1" [class.text-gray-400]="selectedDeptCode" [class.text-gray-600]="!selectedDeptCode">
                Provincia
              </label>
              <div class="relative" id="prov-dropdown">
                <button type="button"
                  (click)="toggleDropdown('prov')"
                  [disabled]="submitting || !selectedDeptCode || loadingProvs"
                  class="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between disabled:opacity-50 focus:outline-none"
                  [class.border-indigo-500]="openDropdown === 'prov'">
                  <span [class.text-gray-500]="!selectedProvCode">
                    {{ loadingProvs ? 'Cargando...' : (selectedProvName || 'Seleccionar provincia') }}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                    class="w-4 h-4 text-gray-400 shrink-0 transition-transform"
                    [class.rotate-180]="openDropdown === 'prov'">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div *ngIf="openDropdown === 'prov'"
                  class="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl">
                  <div class="p-2 border-b border-gray-700">
                    <input [(ngModel)]="searchProv" placeholder="Buscar provincia..."
                      class="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                      (click)="$event.stopPropagation()" />
                  </div>
                  <ul class="max-h-52 overflow-y-auto py-1">
                    <li *ngFor="let p of filteredProvs"
                      (click)="selectProv(p)"
                      class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-800 text-white"
                      [class.bg-indigo-900]="p.code === selectedProvCode"
                      [class.text-indigo-300]="p.code === selectedProvCode">
                      {{ p.name }}
                    </li>
                    <li *ngIf="filteredProvs.length === 0" class="px-3 py-2 text-sm text-gray-500">Sin resultados</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- DISTRITO -->
            <div>
              <label class="block text-xs mb-1" [class.text-gray-400]="selectedProvCode" [class.text-gray-600]="!selectedProvCode">
                Distrito
              </label>
              <div class="relative" id="dist-dropdown">
                <button type="button"
                  (click)="toggleDropdown('dist')"
                  [disabled]="submitting || !selectedProvCode || loadingDists"
                  class="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between disabled:opacity-50 focus:outline-none"
                  [class.border-indigo-500]="openDropdown === 'dist'">
                  <span [class.text-gray-500]="!selectedDistCode">
                    {{ loadingDists ? 'Cargando...' : (selectedDistName || 'Seleccionar distrito') }}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                    class="w-4 h-4 text-gray-400 shrink-0 transition-transform"
                    [class.rotate-180]="openDropdown === 'dist'">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div *ngIf="openDropdown === 'dist'"
                  class="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl">
                  <div class="p-2 border-b border-gray-700">
                    <input [(ngModel)]="searchDist" placeholder="Buscar distrito..."
                      class="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                      (click)="$event.stopPropagation()" />
                  </div>
                  <ul class="max-h-52 overflow-y-auto py-1">
                    <li *ngFor="let d of filteredDists"
                      (click)="selectDist(d)"
                      class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-800 text-white"
                      [class.bg-indigo-900]="d.code === selectedDistCode"
                      [class.text-indigo-300]="d.code === selectedDistCode">
                      {{ d.name }}
                    </li>
                    <li *ngIf="filteredDists.length === 0" class="px-3 py-2 text-sm text-gray-500">Sin resultados</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          <!-- Ubigeo confirmado -->
          <div *ngIf="selectedDistCode" class="mt-3 flex items-center gap-2 text-xs text-indigo-300 bg-indigo-900/20 border border-indigo-800/40 rounded-lg px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>
              <strong>{{ selectedDistCode }}</strong> —
              {{ selectedDeptName }}, {{ selectedProvName }}, {{ selectedDistName }}
            </span>
          </div>
        </div>

        <!-- Error -->
        <div *ngIf="error" class="bg-red-900/20 border border-red-700 text-red-400 rounded-lg p-3 text-sm">
          {{ error }}
        </div>

        <button (click)="submit()" [disabled]="submitting || !title.trim()"
          class="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <svg *ngIf="submitting" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
            <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
          </svg>
          <svg *ngIf="!submitting" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          {{ submitting ? 'Enviando...' : 'Identificar brechas' }}
        </button>
      </div>

      <!-- Info -->
      <div class="mt-4 flex items-start gap-3 text-sm text-indigo-300 bg-indigo-900/20 border border-indigo-800/50 rounded-xl px-4 py-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 shrink-0 mt-0.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p>
          La clasificación es procesada de forma <strong>asíncrona</strong> por el worker de IA.
          Al enviar serás redirigido a tu <a routerLink="/history" class="underline hover:text-white">historial</a>
          donde verás el resultado en cuanto esté listo.
        </p>
      </div>
    </div>
  `,
})
export class ClassifierPageComponent implements OnInit {
  title = '';
  description = '';
  error = '';
  submitting = false;

  departments: UbigeoDepartment[] = [];
  provinces: UbigeoProvince[] = [];
  districts: UbigeoDistrict[] = [];

  selectedDeptCode = '';
  selectedProvCode = '';
  selectedDistCode = '';
  selectedDeptName = '';
  selectedProvName = '';
  selectedDistName = '';

  loadingDepts = false;
  loadingProvs = false;
  loadingDists = false;

  openDropdown: 'dept' | 'prov' | 'dist' | null = null;
  searchDept = '';
  searchProv = '';
  searchDist = '';

  get filteredDepts(): UbigeoDepartment[] {
    const q = this.searchDept.toLowerCase();
    return q ? this.departments.filter(d => d.name.toLowerCase().includes(q)) : this.departments;
  }

  get filteredProvs(): UbigeoProvince[] {
    const q = this.searchProv.toLowerCase();
    return q ? this.provinces.filter(p => p.name.toLowerCase().includes(q)) : this.provinces;
  }

  get filteredDists(): UbigeoDistrict[] {
    const q = this.searchDist.toLowerCase();
    return q ? this.districts.filter(d => d.name.toLowerCase().includes(q)) : this.districts;
  }

  constructor(
    private classificationService: ClassificationService,
    private ubigeoService: UbigeoService,
    private router: Router,
    private el: ElementRef,
  ) {}

  ngOnInit(): void {
    this.loadingDepts = true;
    this.ubigeoService.getDepartments().subscribe({
      next: (data) => { this.departments = data; this.loadingDepts = false; },
      error: () => { this.loadingDepts = false; },
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.openDropdown = null;
    }
  }

  toggleDropdown(which: 'dept' | 'prov' | 'dist'): void {
    this.openDropdown = this.openDropdown === which ? null : which;
    // Reset search when opening
    if (this.openDropdown === which) {
      if (which === 'dept') this.searchDept = '';
      if (which === 'prov') this.searchProv = '';
      if (which === 'dist') this.searchDist = '';
    }
  }

  selectDept(d: UbigeoDepartment): void {
    if (d.code === this.selectedDeptCode) { this.openDropdown = null; return; }
    this.selectedDeptCode = d.code;
    this.selectedDeptName = d.name;
    this.selectedProvCode = '';
    this.selectedProvName = '';
    this.selectedDistCode = '';
    this.selectedDistName = '';
    this.provinces = [];
    this.districts = [];
    this.openDropdown = null;

    this.loadingProvs = true;
    this.ubigeoService.getProvinces(d.code).subscribe({
      next: (data) => { this.provinces = data; this.loadingProvs = false; },
      error: () => { this.loadingProvs = false; },
    });
  }

  selectProv(p: UbigeoProvince): void {
    if (p.code === this.selectedProvCode) { this.openDropdown = null; return; }
    this.selectedProvCode = p.code;
    this.selectedProvName = p.name;
    this.selectedDistCode = '';
    this.selectedDistName = '';
    this.districts = [];
    this.openDropdown = null;

    this.loadingDists = true;
    this.ubigeoService.getDistricts(p.code).subscribe({
      next: (data) => { this.districts = data; this.loadingDists = false; },
      error: () => { this.loadingDists = false; },
    });
  }

  selectDist(d: UbigeoDistrict): void {
    this.selectedDistCode = d.code;
    this.selectedDistName = d.name;
    this.openDropdown = null;
  }

  submit(): void {
    if (!this.title.trim()) return;
    this.error = '';
    this.submitting = true;

    this.classificationService.submitClassification({
      title: this.title,
      description: this.description,
      ubigeo_code: this.selectedDistCode || undefined,
      department: this.selectedDeptName || undefined,
      province: this.selectedProvName || undefined,
      district: this.selectedDistName || undefined,
    }).subscribe({
      next: () => {
        this.router.navigate(['/history']);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al enviar la solicitud. Intenta nuevamente.';
        this.submitting = false;
      },
    });
  }
}
