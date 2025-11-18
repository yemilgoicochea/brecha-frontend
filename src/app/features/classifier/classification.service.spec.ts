import { TestBed } from '@angular/core/testing';
import { ClassificationService } from './classification.service';
import { expect, jest } from '@jest/globals';

describe('ClassificationService', () => {
  let service: ClassificationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassificationService);
    // Provide crypto.randomUUID before test runs
    const g: any = global;
    g.crypto = { ...(g.crypto||{}), randomUUID: () => '11111111-1111-1111-1111-111111111111' };
  });

  it('should classify and return a ProjectAnalysis', async () => {
    const analysis = await service.classify(undefined, 'desc', { projectName: 'Proyecto A' });
    expect(analysis.id).toMatch(/^[0-9a-f-]{8}/);
    expect(analysis.projectName).toBe('Proyecto A');
    expect(analysis.gaps.length).toBeGreaterThan(0);
  });

  it('should persist history in localStorage', async () => {
    await service.classify(undefined, 'x', { projectName: 'Uno' });
    await service.classify(undefined, 'y', { projectName: 'Dos' });
    const hist = service.history;
    expect(hist.length).toBe(2);
    expect(hist[0].projectName).toBe('Uno');
    expect(hist[1].projectName).toBe('Dos');
  });

  it('should push latest$ subject', async () => {
    let latest: any = null;
    service.latest$.subscribe(v => latest = v);
    await service.classify(undefined, 'x', { projectName: 'Emitir' });
    expect(latest).not.toBeNull();
    expect(latest!.projectName).toBe('Emitir');
  });
});