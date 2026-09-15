import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('WordPress SVG texture dimensions', () => {
  for (const name of ['wordpress-portfolio', 'wordpress-shop']) {
    it(`${name} has explicit pixel dimensions for GPU upload`, () => {
      const source = readFileSync(resolve(process.cwd(), `public/assets/${name}.svg`), 'utf8');
      const root = source.match(/<svg\b[^>]*>/)?.[0] ?? '';
      expect(root).toMatch(/\bwidth="1200"/);
      expect(root).toMatch(/\bheight="800"/);
      expect(root).toContain('viewBox="0 0 1200 800"');
    });
  }
});
