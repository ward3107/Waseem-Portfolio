import { describe, it, expect } from 'vitest';
import { jsonForScriptTag, safeHref } from '@/lib/safe';

const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

describe('jsonForScriptTag', () => {
  it('escapes a </script> breakout attempt', () => {
    const payload = { author: '</script><img src=x onerror=alert(1)>' };
    const out = jsonForScriptTag(payload);
    expect(out).not.toContain('</script>');
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
  });

  it('still parses back to the original value', () => {
    const payload = { text: 'a < b & c > d', n: 5 };
    expect(JSON.parse(jsonForScriptTag(payload))).toEqual(payload);
  });

  it('escapes the JS-hostile line separators but preserves them', () => {
    const out = jsonForScriptTag({ s: LS + PS });
    expect(out).not.toContain(LS);
    expect(out).not.toContain(PS);
    expect(JSON.parse(out).s).toBe(LS + PS);
  });
});

describe('safeHref', () => {
  it('allows http and https', () => {
    expect(safeHref('https://example.com/x')).toBe('https://example.com/x');
    expect(safeHref('http://example.com')).toBe('http://example.com');
  });

  it('blocks javascript: URLs', () => {
    expect(safeHref('javascript:alert(1)')).toBeUndefined();
    // Browsers ignore case and leading whitespace when parsing schemes.
    expect(safeHref('JaVaScRiPt:alert(1)')).toBeUndefined();
    expect(safeHref('  javascript:alert(1)')).toBeUndefined();
  });

  it('blocks data: and other active schemes', () => {
    expect(safeHref('data:text/html,<script>alert(1)</script>')).toBeUndefined();
    expect(safeHref('vbscript:msgbox(1)')).toBeUndefined();
    expect(safeHref('file:///etc/passwd')).toBeUndefined();
  });

  it('returns undefined for empty/nullish input', () => {
    expect(safeHref(undefined)).toBeUndefined();
    expect(safeHref(null)).toBeUndefined();
    expect(safeHref('')).toBeUndefined();
  });
});
