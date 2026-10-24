// @vitest-environment node
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const entry = readFileSync('index.html', 'utf8').match(/<script>\s*([\s\S]*?)<\/script>/)[1];
function resolveEntry(url) {
  const location = new URL(url, 'https://www.vasia.dev');
  let redirect;
  const document = { documentElement: {} };
  runInNewContext(entry, {
    window: { location: { pathname: location.pathname, search: location.search, hash: location.hash, replace: value => { redirect = value; } } },
    document, URLSearchParams, localStorage: { setItem() {} },
  });
  return { redirect, language: document.documentElement.lang, direction: document.documentElement.dir };
}
describe('locale entry links', () => {
  it('opens an English accessibility statement without redirecting to the homepage', () => {
    expect(resolveEntry('/accessibility?lang=en')).toEqual({ redirect: undefined, language: 'en', direction: 'ltr' });
  });
  it('preserves the Arabic calculator destination', () => {
    expect(resolveEntry('/plan?lang=ar')).toEqual({ redirect: undefined, language: 'ar', direction: 'rtl' });
  });
  it('keeps the classic preference and quote deep link when normalizing a home locale', () => {
    expect(resolveEntry('/?lang=en&classic=1#quote-builder').redirect).toBe('/en/?classic=1#quote-builder');
  });
  it('removes only the locale query when returning to Hebrew', () => {
    expect(resolveEntry('/en/?lang=he&classic=1').redirect).toBe('/?classic=1');
  });
});
