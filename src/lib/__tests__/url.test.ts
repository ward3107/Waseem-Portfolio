import { describe, it, expect } from 'vitest';
import { normalizeHttpUrl } from '@/lib/url';

// The DB check the admin editors must satisfy, exactly as written in
// supabase/schema.sql (case-sensitive `~`). The helper's whole job is to make
// its output pass this or be null, so we assert against the real thing.
const DB_CHECK = /^https?:\/\//;
const passesDbCheck = (v: string | null) => v === null || DB_CHECK.test(v);

describe('normalizeHttpUrl', () => {
  it('prepends https:// to a scheme-less host', () => {
    expect(normalizeHttpUrl('careerconnect.com')).toBe('https://careerconnect.com');
    expect(normalizeHttpUrl('www.x.vercel.app/path')).toBe('https://www.x.vercel.app/path');
  });

  it('keeps an already-valid URL unchanged', () => {
    expect(normalizeHttpUrl('https://x.com')).toBe('https://x.com');
    expect(normalizeHttpUrl('http://y.io/a?b=c')).toBe('http://y.io/a?b=c');
  });

  it('lowercases the scheme (the DB regex is case-sensitive)', () => {
    expect(normalizeHttpUrl('HTTPS://X.com')).toBe('https://X.com');
    expect(normalizeHttpUrl('Http://Y.io/Path')).toBe('http://Y.io/Path');
  });

  it('returns null for blank / whitespace / nullish input', () => {
    expect(normalizeHttpUrl('')).toBeNull();
    expect(normalizeHttpUrl('   ')).toBeNull();
    expect(normalizeHttpUrl(null)).toBeNull();
    expect(normalizeHttpUrl(undefined)).toBeNull();
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeHttpUrl('  example.com  ')).toBe('https://example.com');
  });

  it('always produces a value the DB check accepts', () => {
    for (const input of [
      'careerconnect.com',
      'https://x.com',
      'HTTPS://X.io',
      'credly.com/badge/123',
      '   ',
      '',
      null,
    ]) {
      expect(passesDbCheck(normalizeHttpUrl(input))).toBe(true);
    }
  });
});
