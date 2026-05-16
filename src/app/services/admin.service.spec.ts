import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminService } from './admin.service';
import { expect } from '@jest/globals';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AdminService],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── Sectors ──────────────────────────────────────────────────────────────

  describe('getSectors()', () => {
    it('should call GET /api/v1/admin/sectors', () => {
      const mockSectors = [
        {
          id: 1, code: 'S01', name: 'Agua', transparency_name: 'Agua',
          pdf_filename: 'agua.pdf', is_active: true, created_at: '2026-01-01', gap_count: 3,
        },
      ];

      service.getSectors().subscribe((sectors) => {
        expect(sectors.length).toBe(1);
        expect(sectors[0].name).toBe('Agua');
        expect(sectors[0].gap_count).toBe(3);
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/v1/admin/sectors'));
      expect(req.request.method).toBe('GET');
      req.flush(mockSectors);
    });
  });

  describe('toggleSector()', () => {
    it('should call PATCH /api/v1/admin/sectors/:id/toggle', () => {
      service.toggleSector(5).subscribe((res) => {
        expect(res.id).toBe(5);
        expect(res.is_active).toBe(false);
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/v1/admin/sectors/5/toggle'));
      expect(req.request.method).toBe('PATCH');
      req.flush({ id: 5, is_active: false });
    });
  });

  // ── Gaps ──────────────────────────────────────────────────────────────────

  describe('getGaps()', () => {
    it('should call GET /api/v1/admin/gaps with no params by default', () => {
      const mockResponse = { items: [], total: 0, page: 1, limit: 20, pages: 1 };

      service.getGaps().subscribe((res) => {
        expect(res.total).toBe(0);
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/v1/admin/gaps'));
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should pass sector_id, indicator_type and is_active as query params', () => {
      service.getGaps({ sector_id: 2, indicator_type: 'COBERTURA', is_active: true }).subscribe();

      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/api/v1/admin/gaps') &&
          r.params.get('sector_id') === '2' &&
          r.params.get('indicator_type') === 'COBERTURA' &&
          r.params.get('is_active') === 'true',
      );
      req.flush({ items: [], total: 0, page: 1, limit: 20, pages: 1 });
    });

    it('should pass pagination params', () => {
      service.getGaps({ page: 2, limit: 10 }).subscribe();

      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/api/v1/admin/gaps') &&
          r.params.get('page') === '2' &&
          r.params.get('limit') === '10',
      );
      req.flush({ items: [], total: 0, page: 2, limit: 10, pages: 1 });
    });
  });

  describe('getGap()', () => {
    it('should call GET /api/v1/admin/gaps/:id', () => {
      service.getGap(7).subscribe((gap) => {
        expect(gap.id).toBe(7);
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/v1/admin/gaps/7'));
      expect(req.request.method).toBe('GET');
      req.flush({ id: 7, name: 'Test', sector_id: 1, indicator_type: 'COBERTURA', is_active: true, created_at: '' });
    });
  });

  describe('createGap()', () => {
    it('should call POST /api/v1/admin/gaps', () => {
      const payload = { sector_id: 1, name: 'Nueva Brecha', indicator_type: 'COBERTURA' as const };

      service.createGap(payload).subscribe((gap) => {
        expect(gap.name).toBe('Nueva Brecha');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/v1/admin/gaps'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ ...payload, id: 99, is_active: true, created_at: '' });
    });
  });

  describe('updateGap()', () => {
    it('should call PUT /api/v1/admin/gaps/:id', () => {
      service.updateGap(3, { name: 'Brecha Editada' }).subscribe((gap) => {
        expect(gap.name).toBe('Brecha Editada');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/v1/admin/gaps/3'));
      expect(req.request.method).toBe('PUT');
      req.flush({ id: 3, name: 'Brecha Editada', sector_id: 1, indicator_type: 'COBERTURA', is_active: true, created_at: '' });
    });
  });

  describe('deleteGap()', () => {
    it('should call DELETE /api/v1/admin/gaps/:id', () => {
      let completed = false;
      service.deleteGap(4).subscribe(() => { completed = true; });

      const req = httpMock.expectOne((r) => r.url.includes('/api/v1/admin/gaps/4'));
      expect(req.request.method).toBe('DELETE');
      req.flush({ id: 4, is_active: false });
      expect(completed).toBe(true);
    });
  });

  // ── Government Levels ─────────────────────────────────────────────────────

  describe('getGovernmentLevels()', () => {
    it('should call GET /api/v1/admin/government-levels', () => {
      service.getGovernmentLevels().subscribe((levels) => {
        expect(levels.length).toBe(2);
        expect(levels[0].code).toBe('NAC');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/v1/admin/government-levels'));
      expect(req.request.method).toBe('GET');
      req.flush([
        { id: 1, code: 'NAC', name: 'Nacional' },
        { id: 2, code: 'REG', name: 'Regional' },
      ]);
    });
  });
});
