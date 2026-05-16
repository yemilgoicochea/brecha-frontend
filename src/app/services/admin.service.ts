import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiUrl } from '../config/api.config';

export interface Sector {
  id: number;
  code: string;
  name: string;
  transparency_name: string;
  pdf_filename: string;
  is_active: boolean;
  created_at: string;
  gap_count: number;
}

export interface GovernmentLevel {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface Gap {
  id: number;
  sector_id: number;
  sector_name?: string;
  indicator_code?: string;
  name: string;
  indicator_type: 'COBERTURA' | 'CALIDAD';
  unit_measure?: string;
  geographic_level?: string;
  function_name?: string;
  division_name?: string;
  group_functional?: string;
  service_name?: string;
  typology?: string;
  definition?: string;
  justification?: string;
  valid_from?: string;
  valid_to?: string;
  is_active: boolean;
  created_at: string;
  government_levels?: GovernmentLevel[];
}

export interface GapCreate {
  sector_id: number;
  name: string;
  indicator_type: 'COBERTURA' | 'CALIDAD';
  indicator_code?: string;
  unit_measure?: string;
  geographic_level?: string;
  function_name?: string;
  division_name?: string;
  group_functional?: string;
  service_name?: string;
  typology?: string;
  definition?: string;
  justification?: string;
  valid_from?: string;
  valid_to?: string;
  government_level_ids?: number[];
}

export interface GapListResponse {
  items: Gap[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface GapFilters {
  sector_id?: number;
  indicator_type?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  // ── Sectors ────────────────────────────────────────────
  getSectors(): Observable<Sector[]> {
    return this.http.get<Sector[]>(getApiUrl('/api/v1/admin/sectors'));
  }

  toggleSector(id: number): Observable<{ id: number; is_active: boolean }> {
    return this.http.patch<{ id: number; is_active: boolean }>(
      getApiUrl(`/api/v1/admin/sectors/${id}/toggle`),
      {}
    );
  }

  // ── Gaps ───────────────────────────────────────────────
  getGaps(filters: GapFilters = {}): Observable<GapListResponse> {
    let params = new HttpParams();
    if (filters.sector_id != null) params = params.set('sector_id', filters.sector_id);
    if (filters.indicator_type) params = params.set('indicator_type', filters.indicator_type);
    if (filters.is_active != null) params = params.set('is_active', String(filters.is_active));
    if (filters.page) params = params.set('page', filters.page);
    if (filters.limit) params = params.set('limit', filters.limit);

    return this.http.get<GapListResponse>(getApiUrl('/api/v1/admin/gaps'), { params });
  }

  getGap(id: number): Observable<Gap> {
    return this.http.get<Gap>(getApiUrl(`/api/v1/admin/gaps/${id}`));
  }

  createGap(data: GapCreate): Observable<Gap> {
    return this.http.post<Gap>(getApiUrl('/api/v1/admin/gaps'), data);
  }

  updateGap(id: number, data: Partial<GapCreate>): Observable<Gap> {
    return this.http.put<Gap>(getApiUrl(`/api/v1/admin/gaps/${id}`), data);
  }

  deleteGap(id: number): Observable<any> {
    return this.http.delete(getApiUrl(`/api/v1/admin/gaps/${id}`));
  }

  // ── Government Levels ──────────────────────────────────
  getGovernmentLevels(): Observable<GovernmentLevel[]> {
    return this.http.get<GovernmentLevel[]>(getApiUrl('/api/v1/admin/government-levels'));
  }

  // ── Model ───────────────────────────────────────────────
  refreshModel(): Observable<{ message: string; message_id: string }> {
    return this.http.post<{ message: string; message_id: string }>(
      getApiUrl('/api/v1/admin/model/refresh'),
      {}
    );
  }
}
