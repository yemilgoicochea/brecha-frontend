import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GapCardsComponent } from './gap-cards.component';
import { GapResult } from '../../models/analysis.model';
import { expect } from '@jest/globals';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('GapCardsComponent', () => {
  let component: GapCardsComponent;
  let fixture: ComponentFixture<GapCardsComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GapCardsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GapCardsComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  describe('Color indicators for confidence levels', () => {
    it('should display confidence as percentage', () => {
      component.gaps = [
        { name: 'Brecha Test', score: 0.85, reason: 'Razón test' }
      ];
      fixture.detectChanges();

      // Find any span with color class that contains percentage text
      const scoreText = Array.from(compiled.querySelectorAll('span[class*="text-"]'))
        .find(el => el.textContent?.match(/^\d+%$/))?.textContent?.trim();
      expect(scoreText).toBe('85%');
    });

    it('should format percentage without decimals', () => {
      component.gaps = [
        { name: 'Brecha A', score: 0.8567, reason: 'Test' }
      ];
      fixture.detectChanges();

      const scoreText = Array.from(compiled.querySelectorAll('span[class*="text-"]'))
        .find(el => el.textContent?.match(/^\d+%$/))?.textContent?.trim();
      expect(scoreText).toBe('86%'); // Rounded to nearest integer
    });

    it('should apply green color for high confidence (≥80%)', () => {
      component.gaps = [
        { name: 'Alta confianza', score: 0.85, reason: 'Test' }
      ];
      fixture.detectChanges();

      const iconDiv = compiled.querySelector('.bg-green-50.text-green-600');
      expect(iconDiv).toBeTruthy();
      
      const scoreSpan = compiled.querySelector('.text-green-600');
      expect(scoreSpan).toBeTruthy();
    });

    it('should apply yellow color for medium confidence (60-79%)', () => {
      component.gaps = [
        { name: 'Confianza media', score: 0.70, reason: 'Test' }
      ];
      fixture.detectChanges();

      const iconDiv = compiled.querySelector('.bg-yellow-50.text-yellow-600');
      expect(iconDiv).toBeTruthy();
      
      const scoreSpan = compiled.querySelector('.text-yellow-600');
      expect(scoreSpan).toBeTruthy();
    });

    it('should apply red color for low confidence (<60%)', () => {
      component.gaps = [
        { name: 'Baja confianza', score: 0.50, reason: 'Test' }
      ];
      fixture.detectChanges();

      const iconDiv = compiled.querySelector('.bg-red-50.text-red-600');
      expect(iconDiv).toBeTruthy();
      
      const scoreSpan = compiled.querySelector('.text-red-600');
      expect(scoreSpan).toBeTruthy();
    });

    it('should apply colors correctly for multiple gaps with different scores', () => {
      component.gaps = [
        { name: 'Alta', score: 0.90, reason: 'Test' },
        { name: 'Media', score: 0.70, reason: 'Test' },
        { name: 'Baja', score: 0.45, reason: 'Test' }
      ];
      fixture.detectChanges();

      const icons = compiled.querySelectorAll('[class*="bg-"][class*="text-"]');
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });

    it('should show reason when provided', () => {
      const reason = 'Esta es una justificación de prueba';
      component.gaps = [
        { name: 'Brecha con razón', score: 0.75, reason }
      ];
      fixture.detectChanges();

      const reasonText = compiled.querySelector('.text-gray-500')?.textContent;
      expect(reasonText).toBe(reason);
    });

    it('should show fallback text when reason is not provided', () => {
      component.gaps = [
        { name: 'Brecha sin razón', score: 0.65 }
      ];
      fixture.detectChanges();

      const reasonText = compiled.querySelector('.text-gray-500')?.textContent;
      expect(reasonText).toBe('Motivo no disponible');
    });

    it('should display multiple gaps correctly', () => {
      component.gaps = [
        { name: 'Brecha 1', score: 0.90, reason: 'Razón 1' },
        { name: 'Brecha 2', score: 0.70, reason: 'Razón 2' },
        { name: 'Brecha 3', score: 0.50, reason: 'Razón 3' }
      ];
      fixture.detectChanges();

      const cards = compiled.querySelectorAll('.rounded-xl');
      expect(cards.length).toBe(3);

      const scores = Array.from(compiled.querySelectorAll('[class*="text-"][class*="-600"]'))
        .filter(el => el.textContent?.match(/\d+%/))
        .map(el => el.textContent?.trim());
      expect(scores.length).toBeGreaterThanOrEqual(3);
    });

    it('should show empty message when no gaps', () => {
      component.gaps = [];
      fixture.detectChanges();

      const emptyText = compiled.querySelector('.text-gray-400')?.textContent;
      expect(emptyText).toBe('Sin brechas todavía.');
    });
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty gaps array', () => {
      expect(component.gaps).toEqual([]);
    });

    it('should accept gaps input', () => {
      const testGaps: GapResult[] = [
        { name: 'Test Gap', score: 0.8, reason: 'Test reason' }
      ];
      component.gaps = testGaps;
      expect(component.gaps).toBe(testGaps);
    });
  });
});