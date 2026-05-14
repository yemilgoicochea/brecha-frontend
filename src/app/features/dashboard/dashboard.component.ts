import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClassificationService, ClassificationResponse } from '../../services/classification.service';
import { AdminService } from '../../services/admin.service';
import { AuthService, User } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">

      <!-- Welcome Banner -->
      <div class="mb-8 bg-gradient-to-r from-indigo-900/60 to-gray-800 border border-indigo-800/50 rounded-2xl px-6 py-6 flex items-center justify-between">
        <div>
          <p class="text-indigo-300 text-sm font-medium mb-1">Bienvenido de vuelta</p>
          <h1 class="text-3xl font-extrabold text-white">{{ currentUser?.name }}</h1>
          <p class="text-gray-400 text-sm mt-1">
            <span *ngIf="isAdmin" class="inline-flex items-center gap-1 text-amber-400 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                <path fill-rule="evenodd" d="M9.674 2.075a.75.75 0 01.652 0l7.25 3.5A.75.75 0 0117 6.957V16.5h.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H3V6.957a.75.75 0 01-.576-.382l7.25-3.5zM11 12a1 1 0 11-2 0 1 1 0 012 0zm-1-4a1 1 0 00-1 1v2a1 1 0 002 0V9a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              Administrador
            </span>
            <span *ngIf="!isAdmin">Sistema de clasificación de proyectos de inversión pública</span>
          </p>
        </div>
        <div class="hidden md:block w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
          {{ (currentUser?.name?.charAt(0) || 'U').toUpperCase() }}
        </div>
      </div>

      <!-- User Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg">
          <p class="text-indigo-200 text-xs font-medium uppercase tracking-wide">Total</p>
          <p class="text-4xl font-extrabold mt-2">{{ totalProjects }}</p>
          <p class="text-indigo-300 text-xs mt-1">proyectos analizados</p>
        </div>
        <div class="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-5 text-white shadow-lg">
          <p class="text-emerald-200 text-xs font-medium uppercase tracking-wide">Completados</p>
          <p class="text-4xl font-extrabold mt-2">{{ completedProjects }}</p>
          <p class="text-emerald-300 text-xs mt-1">clasificaciones listas</p>
        </div>
        <div class="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-5 text-white shadow-lg">
          <p class="text-amber-200 text-xs font-medium uppercase tracking-wide">Pendientes</p>
          <p class="text-4xl font-extrabold mt-2">{{ pendingProjects }}</p>
          <p class="text-amber-300 text-xs mt-1">en cola o procesando</p>
        </div>
        <div class="bg-gradient-to-br from-red-700 to-red-800 rounded-xl p-5 text-white shadow-lg">
          <p class="text-red-200 text-xs font-medium uppercase tracking-wide">Con error</p>
          <p class="text-4xl font-extrabold mt-2">{{ errorProjects }}</p>
          <p class="text-red-300 text-xs mt-1">requieren revisión</p>
        </div>
      </div>

      <!-- Admin Stats (solo admin) -->
      <div *ngIf="isAdmin" class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <h2 class="text-lg font-bold text-white">Panel de Administración</h2>
          <span class="px-2 py-0.5 text-xs font-semibold bg-amber-900/30 text-amber-400 border border-amber-800 rounded-full">Admin</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a routerLink="/admin/sectors"
             class="bg-gray-800 border border-gray-700 hover:border-amber-700 rounded-xl p-5 transition-all group flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Sectores activos</p>
              <p class="text-3xl font-extrabold text-white mt-1">
                <span *ngIf="loadingAdminStats" class="text-gray-600">—</span>
                <span *ngIf="!loadingAdminStats">{{ activeSectors }}</span>
              </p>
              <p class="text-indigo-400 text-xs mt-2 group-hover:text-amber-400 transition-colors font-medium">Gestionar sectores →</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-900/20 group-hover:bg-amber-900/40 flex items-center justify-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-amber-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
          </a>
          <a routerLink="/admin/gaps"
             class="bg-gray-800 border border-gray-700 hover:border-indigo-700 rounded-xl p-5 transition-all group flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Indicadores de brecha</p>
              <p class="text-3xl font-extrabold text-white mt-1">
                <span *ngIf="loadingAdminStats" class="text-gray-600">—</span>
                <span *ngIf="!loadingAdminStats">{{ totalGaps }}</span>
              </p>
              <p class="text-indigo-400 text-xs mt-2 group-hover:text-indigo-300 transition-colors font-medium">Gestionar brechas →</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-indigo-900/20 group-hover:bg-indigo-900/40 flex items-center justify-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-indigo-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          </a>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-lg font-bold text-white mb-4">Acciones rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a routerLink="/classify"
             class="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl p-5 transition-colors shadow-lg flex items-center gap-4 group">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <p class="font-semibold">Nuevo análisis</p>
              <p class="text-indigo-200 text-sm">Clasifica un proyecto nuevo</p>
            </div>
          </a>
          <a routerLink="/history"
             class="bg-purple-700 hover:bg-purple-600 text-white rounded-xl p-5 transition-colors shadow-lg flex items-center gap-4 group">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="font-semibold">Ver historial</p>
              <p class="text-purple-200 text-sm">Revisa tus análisis anteriores</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Recent Projects -->
      <div>
        <h2 class="text-lg font-bold text-white mb-4">Proyectos recientes</h2>

        <div *ngIf="loading" class="text-center py-8">
          <svg class="h-10 w-10 animate-spin text-indigo-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
            <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
          </svg>
          <p class="text-gray-400 mt-2 text-sm">Cargando historial...</p>
        </div>

        <div *ngIf="!loading && projects.length === 0"
             class="bg-gray-800 border border-gray-700 rounded-xl p-10 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto text-gray-600 mb-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m6-11.25a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-400 mb-4">No tienes proyectos analizados aún</p>
          <a routerLink="/classify" class="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">
            Crea tu primer análisis →
          </a>
        </div>

        <div *ngIf="!loading && projects.length > 0" class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div *ngFor="let project of projects.slice(0, 5); let last = last"
               [class.border-b]="!last"
               class="border-gray-700/60 px-5 py-4 hover:bg-gray-700/20 transition-colors flex items-center justify-between gap-4">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-white truncate">{{ project.title || 'Sin título' }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ project.created_at | date: 'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <span [ngClass]="{
                'bg-emerald-900/20 text-emerald-400 border-emerald-800': project.status === 'completed',
                'bg-amber-900/20 text-amber-400 border-amber-800': project.status === 'pending',
                'bg-blue-900/20 text-blue-400 border-blue-800': project.status === 'processing',
                'bg-red-900/20 text-red-400 border-red-800': project.status === 'error'
              }"
              class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border">
              {{ getStatusLabel(project.status) }}
            </span>
          </div>
          <div *ngIf="projects.length > 5" class="px-5 py-3 border-t border-gray-700 text-center">
            <a routerLink="/history" class="text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
              Ver todos los proyectos →
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;
  projects: ClassificationResponse[] = [];
  loading = false;

  totalProjects = 0;
  completedProjects = 0;
  pendingProjects = 0;
  errorProjects = 0;

  // Admin stats
  activeSectors = 0;
  totalGaps = 0;
  loadingAdminStats = false;

  constructor(
    private authService: AuthService,
    private classificationService: ClassificationService,
    private adminService: AdminService,
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === 'admin';
    });
  }

  ngOnInit() {
    this.loadProjects();
    if (this.isAdmin) {
      this.loadAdminStats();
    }
  }

  loadProjects() {
    this.loading = true;
    this.classificationService.getHistory().subscribe({
      next: (projects) => {
        this.projects = projects.sort((a, b) =>
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        this.totalProjects = projects.length;
        this.completedProjects = projects.filter(p => p.status === 'completed').length;
        this.pendingProjects = projects.filter(p => p.status === 'pending' || p.status === 'processing').length;
        this.errorProjects = projects.filter(p => p.status === 'error').length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadAdminStats() {
    this.loadingAdminStats = true;
    this.adminService.getSectors().subscribe({
      next: (sectors) => {
        this.activeSectors = sectors.filter(s => s.is_active).length;
        this.totalGaps = sectors.reduce((sum, s) => sum + (s.gap_count || 0), 0);
        this.loadingAdminStats = false;
      },
      error: () => {
        this.loadingAdminStats = false;
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      completed: 'Completado',
      pending: 'Pendiente',
      processing: 'Procesando',
      error: 'Error',
    };
    return labels[status] || status;
  }
}
