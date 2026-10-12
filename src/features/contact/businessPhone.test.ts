import { describe, expect, it } from 'vitest';
import { resolveBusinessPhone } from './businessPhone';

describe('published business contact migration', () => {
  it.each([undefined, '', '053-4260632', '+972 53 426 0632', '00972534260632'])
    ('resolves empty or retired settings to the current business number: %s', (value) => {
      expect(resolveBusinessPhone(value)).toBe('972544513141');
    });

  it('normalizes the new local number and preserves future admin changes', () => {
    expect(resolveBusinessPhone('0544513141')).toBe('972544513141');
    expect(resolveBusinessPhone('0501234567')).toBe('972501234567');
  });
});
