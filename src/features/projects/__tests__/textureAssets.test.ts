import portfolio from '../../../../public/assets/wordpress-portfolio.svg?raw';
import shop from '../../../../public/assets/wordpress-shop.svg?raw';
import { describe, expect, it } from 'vitest';

describe('WordPress SVG texture dimensions', () => {
  for (const [name, source] of [['wordpress-portfolio', portfolio], ['wordpress-shop', shop]]) {
    it(`${name} has explicit pixel dimensions for GPU upload`, () => {
      const root = source.match(/<svg\b[^>]*>/)?.[0] ?? '';
      expect(root).toMatch(/\bwidth="1200"/);
      expect(root).toMatch(/\bheight="800"/);
      expect(root).toContain('viewBox="0 0 1200 800"');
    });
  }
});
