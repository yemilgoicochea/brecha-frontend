import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, takeWhile } from 'rxjs';
import { getApiUrl, API_CONFIG } from '../config/api.config';

export interface ClassificationRequest {
  title: string;
  description: string;
}

export interface ClassificationResponse {
  query_id: string;
  title?: string;
  description?: string;
  status: string;
  created_at?: string;
  completed_at?: string;
}

export interface ClassificationResult {
  query_id: string;
  status: string;
  classifications?: any[];
  created_at?: string;
  completed_at?: string;
}

export interface GapIndicator {
  id: string;
  name: string;
  description: string;
  category?: string;
}

@Injectable({ providedIn: 'root' })
export class ClassificationService {
  private pollInterval = 2000; // Poll every 2 seconds

  constructor(private http: HttpClient) {}

  /**
   * Submit classification request
   * Returns immediately with query_id (202 ACCEPTED)
   * Client must poll for results
   */
  submitClassification(request: ClassificationRequest): Observable<ClassificationResponse> {
    const url = getApiUrl('/api/v1/classify');
    return this.http.post<ClassificationResponse>(url, request);
  }

  /**
   * Get classification result and poll until completion
   * Automatically polls GET /query/{query_id} until status='completed'
   */
  getClassificationWithPolling(queryId: string): Observable<ClassificationResult> {
    return interval(this.pollInterval).pipe(
      switchMap(() => this.getClassification(queryId)),
      takeWhile(
        (result) => result.status !== 'completed' && result.status !== 'error',
        true // Include last value
      )
    );
  }

  /**
   * Get classification status and results
   */
  getClassification(queryId: string): Observable<ClassificationResult> {
    const url = getApiUrl(`/api/v1/query/${queryId}`);
    return this.http.get<ClassificationResult>(url);
  }

  /**
   * Get available gap indicators/categories
   */
  getCategories(): Observable<GapIndicator[]> {
    const url = getApiUrl('/api/v1/categories');
    return this.http.get<GapIndicator[]>(url);
  }

  /**
   * Get user's classification history
   */
  getHistory(): Observable<ClassificationResponse[]> {
    const url = getApiUrl('/api/v1/history');
    return this.http.get<ClassificationResponse[]>(url);
  }

  retryQuery(queryId: string): Observable<any> {
    const url = getApiUrl(`/api/v1/query/${queryId}/retry`);
    return this.http.post<any>(url, {});
  }
}
