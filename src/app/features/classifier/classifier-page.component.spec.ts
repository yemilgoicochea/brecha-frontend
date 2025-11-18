import { ClassifierPageComponent } from './classifier-page.component';
import { ClassificationService } from './classification.service';
import { expect, jest } from '@jest/globals';

describe('ClassifierPageComponent (class logic)', () => {
  let svc: ClassificationService;
  let component: ClassifierPageComponent;

  beforeEach(() => {
    localStorage.clear();
    svc = new ClassificationService();
    component = new ClassifierPageComponent(svc as any);
    jest.spyOn(svc, 'classify').mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      projectName: 'Proyecto X',
      createdAt: new Date().toISOString(),
      gaps: []
    } as any);
  });

  it('initial state', () => {
    expect(component.analysis).toBeNull();
    expect(component.error).toBe('');
  });

  it('classify sets analysis', async () => {
    component.projectName = 'Proyecto X';
    await component.classify();
    expect(svc.classify).toHaveBeenCalled();
    expect(component.analysis).not.toBeNull();
    expect(component.analysis!.projectName).toBe('Proyecto X');
  });

  it('missing projectName sets error', async () => {
    component.projectName = '';
    await component.classify();
    expect(component.error).toContain('Nombre de proyecto');
    expect(svc.classify).not.toHaveBeenCalled();
  });

  it('reset clears fields', () => {
    component.projectName = 'X';
    component.analysis = { id:'1', projectName:'X', createdAt:'', gaps:[] } as any;
    component.reset();
    expect(component.projectName).toBe('');
    expect(component.analysis).toBeNull();
  });
});