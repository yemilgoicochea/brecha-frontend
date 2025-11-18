import { GapCardsComponent } from './gap-cards.component';
import { expect } from '@jest/globals';

describe('GapCardsComponent (class logic)', () => {
  it('accepts gaps array', () => {
    const comp = new GapCardsComponent();
    comp.gaps = [ { name: 'Brecha 1', score: 0.9 }, { name: 'Brecha 2', score: 0.8 } ] as any;
    expect(comp.gaps.length).toBe(2);
  });

  it('handles empty gaps', () => {
    const comp = new GapCardsComponent();
    comp.gaps = [];
    expect(comp.gaps.length).toBe(0);
  });
});