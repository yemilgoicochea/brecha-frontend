import { HistoryComponent } from './history.component';
import { ClassificationService } from './classification.service';
import { expect } from '@jest/globals';

class MockClassificationService {
  history: any[] = [];
}

describe('HistoryComponent (class logic)', () => {
  let svc: MockClassificationService;
  let component: HistoryComponent;

  beforeEach(() => {
    svc = new MockClassificationService();
    component = new HistoryComponent(svc as any);
  });

  it('ngOnInit loads empty history', () => {
    component.ngOnInit();
    expect(component.list.length).toBe(0);
  });

  it('ngOnInit sorts history descending by createdAt', () => {
    const now = new Date();
    const older = new Date(now.getTime() - 60000).toISOString();
    const newer = now.toISOString();
    svc.history = [
      { id: '1', projectName: 'Old', createdAt: older, gaps: [] },
      { id: '2', projectName: 'New', createdAt: newer, gaps: [] }
    ];
    component.ngOnInit();
    expect(component.list[0].projectName).toBe('New');
    expect(component.list[1].projectName).toBe('Old');
  });
});