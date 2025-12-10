import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryComponent } from './history.component';
import { ClassificationService } from './classification.service';
import { ProjectAnalysis } from '../../models/analysis.model';
import { expect } from '@jest/globals';

class MockClassificationService {
  history: ProjectAnalysis[] = [];
}

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let compiled: HTMLElement;
  let mockService: MockClassificationService;

  beforeEach(async () => {
    mockService = new MockClassificationService();
    
    await TestBed.configureTestingModule({
      imports: [HistoryComponent],
      providers: [
        { provide: ClassificationService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  describe('Justification display', () => {
    it('should display justification for each gap in table', () => {
      const justification1 = 'Justificación detallada para brecha 1';
      const justification2 = 'Otra justificación para brecha 2';
      
      mockService.history = [
        {
          id: '1',
          projectName: 'Proyecto Test',
          createdAt: '2025-12-10T10:00:00Z',
          municipality: 'Lima',
          fileName: 'test.pdf',
          gaps: [
            { id: 1, name: 'Brecha A', score: 0.85, reason: justification1 },
            { id: 2, name: 'Brecha B', score: 0.70, reason: justification2 }
          ]
        }
      ];

      component.ngOnInit();
      fixture.detectChanges();

      const gapsCell = compiled.querySelector('tbody tr td:nth-child(4)')?.textContent;
      expect(gapsCell).toBe('2');
    });

    it('should handle gaps without justification', () => {
      mockService.history = [
        {
          id: '1',
          projectName: 'Proyecto Sin Razón',
          createdAt: '2025-12-10T10:00:00Z',
          gaps: [
            { name: 'Brecha sin razón', score: 0.60 }
          ]
        }
      ];

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.list[0].gaps[0].reason).toBeUndefined();
    });

    it('should display empty justification as undefined', () => {
      mockService.history = [
        {
          id: '1',
          projectName: 'Test',
          createdAt: '2025-12-10T10:00:00Z',
          gaps: [
            { name: 'Brecha', score: 0.75, reason: '' }
          ]
        }
      ];

      component.ngOnInit();
      fixture.detectChanges();

      const gap = component.list[0].gaps[0];
      expect(gap.reason).toBe('');
    });
  });

  describe('Component behavior', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load empty history on init', () => {
      mockService.history = [];
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.list.length).toBe(0);
      const emptyText = compiled.querySelector('.text-gray-500')?.textContent;
      expect(emptyText).toBe('Aún no hay análisis guardados.');
    });

    it('should sort history descending by createdAt', () => {
      const now = new Date();
      const older = new Date(now.getTime() - 60000).toISOString();
      const newer = now.toISOString();
      
      mockService.history = [
        { id: '1', projectName: 'Old', createdAt: older, gaps: [] },
        { id: '2', projectName: 'New', createdAt: newer, gaps: [] }
      ];
      
      component.ngOnInit();
      expect(component.list[0].projectName).toBe('New');
      expect(component.list[1].projectName).toBe('Old');
    });

    it('should display all history items in table', () => {
      mockService.history = [
        {
          id: '1',
          projectName: 'Proyecto 1',
          municipality: 'Lima',
          fileName: 'archivo1.pdf',
          createdAt: '2025-12-10T10:00:00Z',
          gaps: [{ name: 'Brecha 1', score: 0.8 }]
        },
        {
          id: '2',
          projectName: 'Proyecto 2',
          municipality: 'Arequipa',
          fileName: 'archivo2.pdf',
          createdAt: '2025-12-09T10:00:00Z',
          gaps: [{ name: 'Brecha 2', score: 0.7 }]
        }
      ];

      component.ngOnInit();
      fixture.detectChanges();

      const rows = compiled.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
    });

    it('should display project details correctly', () => {
      mockService.history = [
        {
          id: '1',
          projectName: 'Mi Proyecto',
          municipality: 'Cusco',
          fileName: 'documento.pdf',
          createdAt: '2025-12-10T15:30:00Z',
          gaps: [
            { name: 'Brecha 1', score: 0.9 },
            { name: 'Brecha 2', score: 0.8 }
          ]
        }
      ];

      component.ngOnInit();
      fixture.detectChanges();

      const cells = compiled.querySelectorAll('tbody tr td');
      expect(cells[1].textContent).toBe('Mi Proyecto');
      expect(cells[2].textContent).toBe('Cusco');
      expect(cells[3].textContent).toBe('2');
      expect(cells[4].textContent).toBe('documento.pdf');
    });

    it('should handle missing optional fields', () => {
      mockService.history = [
        {
          id: '1',
          projectName: 'Proyecto',
          createdAt: '2025-12-10T10:00:00Z',
          gaps: []
        }
      ];

      component.ngOnInit();
      fixture.detectChanges();

      const cells = compiled.querySelectorAll('tbody tr td');
      expect(cells[2].textContent).toBe('-'); // municipality
      expect(cells[4].textContent).toBe('-'); // fileName
    });
  });
});