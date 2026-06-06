import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiUrl } from '../config/api.config';

export interface UbigeoDepartment {
  code: string;
  name: string;
}

export interface UbigeoProvince {
  code: string;
  name: string;
}

export interface UbigeoDistrict {
  code: string;
  name: string;
  population: number | null;
  area_km2: number | null;
}

@Injectable({ providedIn: 'root' })
export class UbigeoService {
  constructor(private http: HttpClient) {}

  getDepartments(): Observable<UbigeoDepartment[]> {
    return this.http.get<UbigeoDepartment[]>(getApiUrl('/api/v1/ubigeo/departments'));
  }

  getProvinces(departmentCode: string): Observable<UbigeoProvince[]> {
    return this.http.get<UbigeoProvince[]>(getApiUrl(`/api/v1/ubigeo/provinces/${departmentCode}`));
  }

  getDistricts(provinceCode: string): Observable<UbigeoDistrict[]> {
    return this.http.get<UbigeoDistrict[]>(getApiUrl(`/api/v1/ubigeo/districts/${provinceCode}`));
  }
}
