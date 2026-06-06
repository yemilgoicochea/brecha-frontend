import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClassificationService } from './classification.service';
import { expect } from '@jest/globals';

describe('ClassificationService (async API)', () => {
  let service: ClassificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClassificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── submitClassification ───────────────────────────────────────────

  it('submitClassification sends POST with title and description', () => {
    const req$ = service.submitClassification({ title: 'Proyecto A', description: 'Desc' });
    const sub = req$.subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/api/v1/classify'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Proyecto A', description: 'Desc' });

    req.flush({ query_id: 'q-123', status: 'pending' });
    sub.unsubscribe();
  });

  it('submitClassification returns query_id and status pending', (done) => {
    service.submitClassification({ title: 'Test', description: '' }).subscribe(res => {
      expect(res.query_id).toBe('q-abc');
      expect(res.status).toBe('pending');
      done();
    });

    httpMock.expectOne(r => r.url.includes('/api/v1/classify'))
      .flush({ query_id: 'q-abc', status: 'pending' });
  });

  // ── getClassification ──────────────────────────────────────────────

  it('getClassification sends GET to /api/v1/query/{id}', () => {
    const sub = service.getClassification('q-123').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/api/v1/query/q-123'));
    expect(req.request.method).toBe('GET');
    req.flush({ query_id: 'q-123', status: 'completed', classifications: [] });
    sub.unsubscribe();
  });

  it('getClassification returns status and classifications', (done) => {
    const classifications = [{ gap_indicator_id: 1, confidence_score: 0.9 }];
    service.getClassification('q-123').subscribe(res => {
      expect(res.status).toBe('completed');
      expect(res.classifications).toEqual(classifications);
      done();
    });

    httpMock.expectOne(r => r.url.includes('/api/v1/query/q-123'))
      .flush({ query_id: 'q-123', status: 'completed', classifications });
  });

  // ── getHistory ─────────────────────────────────────────────────────

  it('getHistory sends GET to /api/v1/history', () => {
    const sub = service.getHistory().subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/api/v1/history'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
    sub.unsubscribe();
  });

  it('getHistory returns list of queries', (done) => {
    const data = [
      { query_id: 'q-1', status: 'completed' },
      { query_id: 'q-2', status: 'pending' },
    ];
    service.getHistory().subscribe(res => {
      expect(res.length).toBe(2);
      expect(res[0].query_id).toBe('q-1');
      done();
    });

    httpMock.expectOne(r => r.url.includes('/api/v1/history')).flush(data);
  });

  // ── retryQuery ─────────────────────────────────────────────────────

  it('retryQuery sends POST to /api/v1/query/{id}/retry', () => {
    const sub = service.retryQuery('q-123').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/api/v1/query/q-123/retry'));
    expect(req.request.method).toBe('POST');
    req.flush({ status: 'pending' });
    sub.unsubscribe();
  });

  // ── getClassificationWithPolling ───────────────────────────────────

  it('getClassificationWithPolling emits until status completed', fakeAsync(() => {
    const emitted: string[] = [];
    let completed = false;

    service.getClassificationWithPolling('q-poll').subscribe({
      next: res => emitted.push(res.status),
      complete: () => { completed = true; },
    });

    // First interval tick → first HTTP request
    tick(2000);
    httpMock.expectOne(r => r.url.includes('/api/v1/query/q-poll'))
      .flush({ query_id: 'q-poll', status: 'pending' });

    // Second interval tick → second HTTP request
    tick(2000);
    httpMock.expectOne(r => r.url.includes('/api/v1/query/q-poll'))
      .flush({ query_id: 'q-poll', status: 'completed', classifications: [] });

    expect(emitted).toContain('pending');
    expect(emitted[emitted.length - 1]).toBe('completed');
    expect(completed).toBe(true);
  }));
});
