import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClassificationService } from './classification.service';
import { expect, jest } from '@jest/globals';

describe('ClassificationService', () => {
  let service: ClassificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ClassificationService);
    httpMock = TestBed.inject(HttpTestingController);
    // Provide crypto.randomUUID before test runs
    const g: any = global;
    g.crypto = { ...(g.crypto||{}), randomUUID: () => '11111111-1111-1111-1111-111111111111' };
  });

  it('should classify and return a ProjectAnalysis', async () => {
    const promise = service.classify(undefined, 'desc', { projectName: 'Proyecto A' });
    
    const req = httpMock.expectOne(request => request.url.includes('/api/v1/classify'));
    expect(req.request.method).toBe('POST');
    req.flush({
      labels: [
        { id: 1, label: 'Brecha Test', confianza: 0.85, justificacion: 'Test' }
      ]
    });
    
    const analysis = await promise;
    expect(analysis.id).toMatch(/^[0-9a-f-]{8}/);
    expect(analysis.projectName).toBe('Proyecto A');
    expect(analysis.gaps.length).toBe(1);
    httpMock.verify();
  });

  it('should persist history in localStorage', async () => {
    const promise1 = service.classify(undefined, 'x', { projectName: 'Uno' });
    httpMock.expectOne(req => req.url.includes('/api/v1/classify')).flush({ labels: [] });
    await promise1;
    
    const promise2 = service.classify(undefined, 'y', { projectName: 'Dos' });
    httpMock.expectOne(req => req.url.includes('/api/v1/classify')).flush({ labels: [] });
    await promise2;
    
    const hist = service.history;
    expect(hist.length).toBe(2);
    expect(hist[0].projectName).toBe('Uno');
    expect(hist[1].projectName).toBe('Dos');
    httpMock.verify();
  });

  it('should push latest$ subject', async () => {
    let latest: any = null;
    service.latest$.subscribe(v => latest = v);
    const promise = service.classify(undefined, 'x', { projectName: 'Emitir' });
    httpMock.expectOne(req => req.url.includes('/api/v1/classify')).flush({ labels: [] });
    await promise;
    expect(latest).not.toBeNull();
    expect(latest!.projectName).toBe('Emitir');
    httpMock.verify();
  });
});