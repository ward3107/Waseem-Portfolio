import { describe, it, expect } from 'vitest';
import { localized } from '../localized';

describe('localized', () => {
  it('returns the requested language when present', () => {
    expect(localized({ en: 'Hello', he: 'שלום', ar: 'مرحبا' }, 'he')).toBe('שלום');
  });

  it('falls back to en when the requested language is empty', () => {
    expect(localized({ en: 'Hello', he: '' }, 'he')).toBe('Hello');
  });

  it('falls back to en when the requested language is missing', () => {
    expect(localized({ en: 'Hello' }, 'ar')).toBe('Hello');
  });

  it('returns empty string when given empty input', () => {
    expect(localized({ en: '' }, 'en')).toBe('');
  });
});
