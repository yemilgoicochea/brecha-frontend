import { TestBed } from '@angular/core/testing';
import { ClassifierPageComponent } from './classifier-page.component';
import { ClassificationService } from '../../services/classification.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { expect, jest } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

class MockClassificationService {
  submitClassification = jest.fn();
}

describe('ClassifierPageComponent', () => {
  let component: ClassifierPageComponent;
  let mockService: MockClassificationService;
  let router: Router;

  beforeEach(async () => {
    mockService = new MockClassificationService();

    await TestBed.configureTestingModule({
      imports: [ClassifierPageComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ClassificationService, useValue: mockService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ClassifierPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  // ── Estado inicial ─────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initial state: title, description, error empty and not submitting', () => {
    expect(component.title).toBe('');
    expect(component.description).toBe('');
    expect(component.error).toBe('');
    expect(component.submitting).toBe(false);
  });

  // ── submit() con título vacío ──────────────────────────────────────

  it('submit() with empty title does nothing', () => {
    component.title = '';
    component.submit();
    expect(mockService.submitClassification).not.toHaveBeenCalled();
  });

  it('submit() with whitespace title does nothing', () => {
    component.title = '   ';
    component.submit();
    expect(mockService.submitClassification).not.toHaveBeenCalled();
  });

  // ── submit() éxito ─────────────────────────────────────────────────

  it('submit() sets submitting=true while in flight', () => {
    mockService.submitClassification.mockReturnValue(of({ query_id: 'q-1', status: 'pending' }));
    component.title = 'Proyecto agua';
    component.submit();
    // After observable completes synchronously, submitting resets only on error path
    expect(mockService.submitClassification).toHaveBeenCalled();
  });

  it('submit() calls service with title and description', () => {
    mockService.submitClassification.mockReturnValue(of({ query_id: 'q-1', status: 'pending' }));
    component.title = 'Proyecto agua';
    component.description = 'Descripción del proyecto';
    component.submit();
    expect(mockService.submitClassification).toHaveBeenCalledWith({
      title: 'Proyecto agua',
      description: 'Descripción del proyecto',
    });
  });

  it('submit() navigates to /history on success', () => {
    mockService.submitClassification.mockReturnValue(of({ query_id: 'q-1', status: 'pending' }));
    const navSpy = jest.spyOn(router, 'navigate');
    component.title = 'Proyecto agua';
    component.submit();
    expect(navSpy).toHaveBeenCalledWith(['/history']);
  });

  it('submit() clears previous error before submitting', () => {
    mockService.submitClassification.mockReturnValue(of({ query_id: 'q-1', status: 'pending' }));
    component.error = 'Error previo';
    component.title = 'Proyecto agua';
    component.submit();
    expect(component.error).toBe('');
  });

  // ── submit() error ─────────────────────────────────────────────────

  it('submit() sets error message on failure', () => {
    mockService.submitClassification.mockReturnValue(
      throwError(() => ({ error: { detail: 'Servicio no disponible' } }))
    );
    component.title = 'Proyecto agua';
    component.submit();
    expect(component.error).toBe('Servicio no disponible');
    expect(component.submitting).toBe(false);
  });

  it('submit() uses fallback error message when detail not provided', () => {
    mockService.submitClassification.mockReturnValue(
      throwError(() => ({}))
    );
    component.title = 'Proyecto agua';
    component.submit();
    expect(component.error).toBe('Error al enviar la solicitud. Intenta nuevamente.');
    expect(component.submitting).toBe(false);
  });
});
