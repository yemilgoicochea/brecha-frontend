import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClassificationService, ClassificationResponse } from '../../services/classification.service';
import { AuthService, User } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-4xl font-extrabold text-white mb-2">Bienvenido, {{ currentUser?.name }}!</h1>
        <p class="text-gray-400">Aquí puedes ver un resumen de tus análisis y gestionar tus clasificaciones.</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Projects -->
        <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg p-6 text-white shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-indigo-200 text-sm font-medium">Proyectos analizados</p>
              <p class="text-4xl font-extrabold mt-2">{{ totalProjects }}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 opacity-50">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- Completed -->
        <div class="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-6 text-white shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-emerald-200 text-sm font-medium">Análisis completados</p>
              <p class="text-4xl font-extrabold mt-2">{{ completedProjects }}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 opacity-50">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- Pending -->
        <div class="bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg p-6 text-white shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-amber-200 text-sm font-medium">Análisis pendientes</p>
              <p class="text-4xl font-extrabold mt-2">{{ pendingProjects }}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 opacity-50">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-4">Acciones rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a routerLink="/classify" class="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg p-6 transition-colors shadow-lg flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <div>
              <p class="font-semibold">Nuevo análisis</p>
              <p class="text-indigo-200 text-sm">Analiza un proyecto nuevo</p>
            </div>
          </a>
          <a routerLink="/history" class="bg-purple-600 hover:bg-purple-500 text-white rounded-lg p-6 transition-colors shadow-lg flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v7.5m0 0l-3-3m3 3l3-3M3 20.25a4.5 4.5 0 015.572.692l5.396 5.396c1.558 1.557 4.092 1.557 5.652 0l5.396-5.396a4.5 4.5 0 10-6.364-6.364l-1.033 1.033m0 0a4.5 4.5 0 001.344 6.364" />
            </svg>
            <div>
              <p class="font-semibold">Ver historial</p>
              <p class="text-purple-200 text-sm">Revisa tus análisis anteriores</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Recent Projects -->
      <div>
        <h2 class="text-2xl font-bold text-white mb-4">Proyectos recientes</h2>
        <div *ngIf="loading" class="text-center py-8">
          <svg class="h-12 w-12 animate-spin text-indigo-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
            <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"></path>
          </svg>
          <p class="text-gray-400 mt-2">Cargando historial...</p>
        </div>

        <div *ngIf="!loading && projects.length === 0" class="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto text-gray-500 mb-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m6-11.25a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-400 mb-4">No tienes proyectos analizados aún</p>
          <a routerLink="/classify" class="text-indigo-400 hover:text-indigo-300 font-semibold">
            Crea tu primer análisis →
          </a>
        </div>

        <div *ngIf="!loading && projects.length > 0" class="space-y-3">
          <div *ngFor="let project of projects.slice(0, 5)" class="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-indigo-500 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="font-semibold text-white">{{ project.title || 'Sin título' }}</p>
                <p class="text-sm text-gray-400 mt-1">{{ project.created_at | date: 'short' }}</p>
              </div>
              <span 
                [ngClass]="{
                  'bg-green-900/20 text-green-400': project.status === 'completed',
                  'bg-yellow-900/20 text-yellow-400': project.status === 'pending',
                  'bg-blue-900/20 text-blue-400': project.status === 'processing',
                  'bg-red-900/20 text-red-400': project.status === 'error'
                }"
                class="px-3 py-1 rounded-full text-xs font-semibold"
              >
                {{ getStatusLabel(project.status) }}
              </span>
            </div>
          </div>
          <a *ngIf="projects.length > 5" routerLink="/history" class="block text-center text-indigo-400 hover:text-indigo-300 py-2 font-semibold">
            Ver todos los proyectos →
          </a>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  projects: ClassificationResponse[] = [];
  loading = false;
  
  totalProjects = 0;
  completedProjects = 0;
  pendingProjects = 0;

  constructor(
    private authService: AuthService,
    private classificationService: ClassificationService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit() {
    this.loadProjects();
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
        this.pendingProjects = projects.filter(p => p.status === 'pending').length;
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'completed': 'Completado',
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'error': 'Error'
    };
    return labels[status] || status;
  }
}
