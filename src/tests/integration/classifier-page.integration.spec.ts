import { ClassifierPageComponent } from '../../app/features/classifier/classifier-page.component';
import { ClassificationService } from '../../app/features/classifier/classification.service';
import { expect, jest } from '@jest/globals';

describe('ClassifierPageComponent Integration (logic only)', () => {
  it('classifies using real service and populates analysis', async () => {
    const svc = new ClassificationService();
    const comp = new ClassifierPageComponent(svc as any);
    comp.projectName = 'Proyecto INT';
    const spy = jest.spyOn(svc, 'classify').mockResolvedValue({
      id: 'int-uuid-1111-1111-1111-111111111111',
      projectName: 'Proyecto INT',
      createdAt: new Date().toISOString(),
      gaps: [ { name: 'Brecha A', score: 0.91 }, { name: 'Brecha B', score: 0.88 } ]
    } as any);
    await comp.classify();
    expect(spy).toHaveBeenCalled();
    expect(comp.analysis).not.toBeNull();
    expect(comp.analysis!.gaps.length).toBe(2);
  });
});