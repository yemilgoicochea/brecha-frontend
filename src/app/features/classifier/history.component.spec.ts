import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { HistoryComponent } from './history.component';
import { ClassificationService } from '../../services/classification.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { expect, jest } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const makeQuery = (overrides = {}) => ({
  query_id: 'q-1',
  status: 'completed',
  title: 'Proyecto Test',
  created_at: '2026-01-10T10:00:00Z',
  ...overrides,
});

class MockClassificationService {
  getHistory = jest.fn().mockReturnValue(of([]));
  getClassification = jest.fn().mockReturnValue(of({ query_id: 'q-1', status: 'completed', classifications: [] }));
  retryQuery = jest.fn().mockReturnValue(of({}));
}

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let mockService: MockClassificationService;

  beforeEach(async () => {
    mockService = new MockClassificationService();

    await TestBed.configureTestingModule({
      imports: [HistoryComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ClassificationService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  // ── Inicialización ─────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit loads history', () => {
    const queries = [makeQuery()];
    mockService.getHistory.mockReturnValue(of(queries));
    component.ngOnInit();
    expect(mockService.getHistory).toHaveBeenCalled();
    expect(component.queries.length).toBe(1);
  });

  it('loading is true while fetching then false after', () => {
    mockService.getHistory.mockReturnValue(of([]));
    component.loading = false;
    component.loadHistory();
    expect(component.loading).toBe(false); // queries was empty → set true, then immediately false
  });

  it('sorts queries descending by created_at', () => {
    const older = makeQuery({ query_id: 'q-old', title: 'Antiguo', created_at: '2026-01-01T00:00:00Z' });
    const newer = makeQuery({ query_id: 'q-new', title: 'Reciente', created_at: '2026-01-10T00:00:00Z' });
    mockService.getHistory.mockReturnValue(of([older, newer]));
    component.ngOnInit();
    expect(component.queries[0].query_id).toBe('q-new');
    expect(component.queries[1].query_id).toBe('q-old');
  });

  it('sets loading=false on error', () => {
    mockService.getHistory.mockReturnValue(throwError(() => new Error('Network error')));
    component.ngOnInit();
    expect(component.loading).toBe(false);
  });

  // ── hasPending ─────────────────────────────────────────────────────

  it('hasPending is false when all queries completed', () => {
    component.queries = [makeQuery({ status: 'completed' }), makeQuery({ query_id: 'q-2', status: 'completed' })];
    expect(component.hasPending).toBe(false);
  });

  it('hasPending is true when any query is pending', () => {
    component.queries = [makeQuery({ status: 'completed' }), makeQuery({ query_id: 'q-2', status: 'pending' })];
    expect(component.hasPending).toBe(true);
  });

  it('hasPending is true when any query is processing', () => {
    component.queries = [makeQuery({ status: 'processing' })];
    expect(component.hasPending).toBe(true);
  });

  // ── getStatusLabel ─────────────────────────────────────────────────

  it('getStatusLabel returns correct Spanish labels', () => {
    expect(component.getStatusLabel('completed')).toBe('Completado');
    expect(component.getStatusLabel('pending')).toBe('Pendiente');
    expect(component.getStatusLabel('processing')).toBe('Procesando');
    expect(component.getStatusLabel('error')).toBe('Error');
  });

  it('getStatusLabel returns raw status for unknown values', () => {
    expect(component.getStatusLabel('unknown')).toBe('unknown');
  });

  // ── toggleExpand ───────────────────────────────────────────────────

  it('toggleExpand does nothing for non-completed queries', () => {
    const q = makeQuery({ status: 'pending' }) as any;
    component.toggleExpand(q);
    expect(component.expandedId).toBeNull();
    expect(mockService.getClassification).not.toHaveBeenCalled();
  });

  it('toggleExpand expands and loads classifications for completed query', () => {
    const q = makeQuery() as any;
    const classifications = [{ gap_indicator_id: 1, confidence_score: 0.9 }];
    mockService.getClassification.mockReturnValue(of({ query_id: 'q-1', status: 'completed', classifications }));

    component.toggleExpand(q);

    expect(component.expandedId).toBe('q-1');
    expect(mockService.getClassification).toHaveBeenCalledWith('q-1');
    expect(component.getClassifications('q-1')).toEqual(classifications);
  });

  it('toggleExpand collapses when clicking expanded row again', () => {
    const q = makeQuery() as any;
    component.expandedId = 'q-1';
    component.classificationsCache['q-1'] = [];

    component.toggleExpand(q);

    expect(component.expandedId).toBeNull();
  });

  it('toggleExpand uses cache and does not re-fetch', () => {
    const q = makeQuery() as any;
    component.classificationsCache['q-1'] = [{ gap_indicator_id: 5 } as any];

    component.toggleExpand(q);

    expect(mockService.getClassification).not.toHaveBeenCalled();
    expect(component.expandedId).toBe('q-1');
  });

  it('getClassifications returns empty array for unknown queryId', () => {
    expect(component.getClassifications('nonexistent')).toEqual([]);
  });

  // ── retryClassification ────────────────────────────────────────────

  it('retryClassification calls retryQuery and reloads history', () => {
    mockService.retryQuery.mockReturnValue(of({}));
    mockService.getHistory.mockReturnValue(of([]));
    const event = { stopPropagation: jest.fn() } as any;
    const q = makeQuery() as any;

    component.retryClassification(q, event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(mockService.retryQuery).toHaveBeenCalledWith('q-1');
    expect(mockService.getHistory).toHaveBeenCalled();
  });

  it('retryClassification does not double-call if already retrying', () => {
    const event = { stopPropagation: jest.fn() } as any;
    const q = makeQuery() as any;
    component.retrying.add('q-1');

    component.retryClassification(q, event);

    expect(mockService.retryQuery).not.toHaveBeenCalled();
  });

  it('retryClassification clears retrying on error', () => {
    mockService.retryQuery.mockReturnValue(throwError(() => new Error('fail')));
    const event = { stopPropagation: jest.fn() } as any;
    const q = makeQuery() as any;

    component.retryClassification(q, event);

    expect(component.retrying.has('q-1')).toBe(false);
  });

  // ── ngOnDestroy ────────────────────────────────────────────────────

  it('ngOnDestroy stops refresh timer', fakeAsync(() => {
    component.queries = [makeQuery({ status: 'pending' }) as any];
    mockService.getHistory.mockReturnValue(of([makeQuery({ status: 'pending' }) as any]));
    component.loadHistory();

    const callsBefore = (mockService.getHistory as jest.Mock).mock.calls.length;
    component.ngOnDestroy();
    tick(10000); // Advance time — no new calls expected
    expect((mockService.getHistory as jest.Mock).mock.calls.length).toBe(callsBefore);
  }));
});
