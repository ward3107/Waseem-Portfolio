import { describe, expect, it } from 'vitest';
import { projectRailOffset } from './projectRail';

describe('project rail spacing', () => {
  it('keeps visible cards separated throughout rotation regardless of count', () => {
    for (const count of [1, 2, 5, 10, 30]) {
      for (let tick = -100; tick <= 100; tick++) {
        const slots = Array.from({ length: count }, (_, i) => projectRailOffset(i, count, tick / 17))
          .filter(x => Math.abs(x) < 1.65).sort((a, b) => a - b);
        for (let i = 1; i < slots.length; i++) {
          // Max bezel width 2.56 * scale 1.15 = 2.944; pitch is 3.4.
          expect((slots[i] - slots[i - 1]) * 3.4).toBeGreaterThan(2.944);
        }
      }
    }
  });
  it('centres each project when snapped to its slot', () => {
    for (let i = 0; i < 10; i++) {
      expect(projectRailOffset(i, 10, -i * Math.PI * 2 / 10)).toBeCloseTo(0);
    }
  });
});
