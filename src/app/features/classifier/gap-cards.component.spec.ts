import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GapCardsComponent } from './gap-cards.component';
import { GapResult } from '../../models/analysis.model';
import { expect } from '@jest/globals';

describe('GapCardsComponent', () => {
  let component: GapCardsComponent;
  let fixture: ComponentFixture<GapCardsComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GapCardsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GapCardsComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  // ── Inicialización ─────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty gaps array', () => {
    expect(component.gaps).toEqual([]);
  });

  it('should accept gaps input', () => {
    const gaps: GapResult[] = [{ name: 'Test', score: 0.8, reason: 'R' }];
    component.gaps = gaps;
    expect(component.gaps).toBe(gaps);
  });

  // ── getColorClasses (método directo) ───────────────────────────────

  it('getColorClasses returns emerald for high confidence (≥80%)', () => {
    expect(component.getColorClasses(0.85)).toContain('text-emerald-400');
    expect(component.getColorClasses(0.85)).toContain('bg-emerald-900/30');
    expect(component.getColorClasses(1.0)).toContain('text-emerald-400');
  });

  it('getColorClasses returns amber for medium confidence (60–79%)', () => {
    expect(component.getColorClasses(0.70)).toContain('text-amber-400');
    expect(component.getColorClasses(0.70)).toContain('bg-amber-900/30');
    expect(component.getColorClasses(0.60)).toContain('text-amber-400');
  });

  it('getColorClasses returns red for low confidence (<60%)', () => {
    expect(component.getColorClasses(0.50)).toContain('text-red-400');
    expect(component.getColorClasses(0.50)).toContain('bg-red-900/30');
    expect(component.getColorClasses(0.0)).toContain('text-red-400');
  });

  // ── getScoreColorClass (método directo) ───────────────────────────

  it('getScoreColorClass returns emerald for high confidence', () => {
    expect(component.getScoreColorClass(0.85)).toBe('text-emerald-400');
    expect(component.getScoreColorClass(0.80)).toBe('text-emerald-400');
  });

  it('getScoreColorClass returns amber for medium confidence', () => {
    expect(component.getScoreColorClass(0.70)).toBe('text-amber-400');
    expect(component.getScoreColorClass(0.60)).toBe('text-amber-400');
  });

  it('getScoreColorClass returns red for low confidence', () => {
    expect(component.getScoreColorClass(0.50)).toBe('text-red-400');
    expect(component.getScoreColorClass(0.0)).toBe('text-red-400');
  });

  // ── Renderizado DOM ────────────────────────────────────────────────

  it('should display confidence as percentage without decimals', () => {
    component.gaps = [{ name: 'Brecha A', score: 0.8567, reason: 'Test' }];
    fixture.detectChanges();

    const scoreSpan = compiled.querySelector('p span');
    expect(scoreSpan?.textContent?.trim()).toBe('86%');
  });

  it('should display gap name after percentage', () => {
    component.gaps = [{ name: 'Brecha agua', score: 0.85, reason: 'Test' }];
    fixture.detectChanges();

    const p = compiled.querySelector('p.text-sm');
    expect(p?.textContent).toContain('Brecha agua');
  });

  it('should show reason when provided', () => {
    const reason = 'Esta es una justificación de prueba';
    component.gaps = [{ name: 'Brecha', score: 0.75, reason }];
    fixture.detectChanges();

    // Reason is in second <p> with text-gray-400
    const reasonEl = compiled.querySelector('p.text-xs.text-gray-400');
    expect(reasonEl?.textContent?.trim()).toBe(reason);
  });

  it('should show fallback text when reason is not provided', () => {
    component.gaps = [{ name: 'Brecha', score: 0.65 }];
    fixture.detectChanges();

    const reasonEl = compiled.querySelector('p.text-xs.text-gray-400');
    expect(reasonEl?.textContent?.trim()).toBe('Motivo no disponible');
  });

  it('should display multiple gaps as separate cards', () => {
    component.gaps = [
      { name: 'Brecha 1', score: 0.90, reason: 'R1' },
      { name: 'Brecha 2', score: 0.70, reason: 'R2' },
      { name: 'Brecha 3', score: 0.50, reason: 'R3' },
    ];
    fixture.detectChanges();

    const cards = compiled.querySelectorAll('.rounded-xl');
    expect(cards.length).toBe(3);
  });

  it('should show empty message when no gaps', () => {
    component.gaps = [];
    fixture.detectChanges();

    const emptyText = compiled.querySelector('p.text-sm.text-gray-400')?.textContent;
    expect(emptyText).toBe('Sin brechas todavía.');
  });

  it('should apply correct color classes to multiple gaps', () => {
    component.gaps = [
      { name: 'Alta', score: 0.90, reason: 'R1' },   // emerald
      { name: 'Media', score: 0.70, reason: 'R2' },  // amber
      { name: 'Baja', score: 0.45, reason: 'R3' },   // red
    ];
    fixture.detectChanges();

    const scoreSpans = compiled.querySelectorAll('p span');
    expect(scoreSpans[0].className).toContain('text-emerald-400');
    expect(scoreSpans[1].className).toContain('text-amber-400');
    expect(scoreSpans[2].className).toContain('text-red-400');
  });
});
