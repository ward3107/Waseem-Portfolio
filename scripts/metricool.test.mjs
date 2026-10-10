import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const source = readFileSync('public/assets/site-engagement.js', 'utf8');
const tracker = 'script[src="https://tracker.metricool.com/resources/be.js"]';
function page(path = '/') {
  return new JSDOM('<div id="root"></div>', {
    url: `https://www.vasia.dev${path}`, runScripts: 'outside-only',
  });
}
function consent(w, analytics) {
  w.localStorage.setItem('cookie-consent', JSON.stringify({analytics}));
  w.dispatchEvent(new w.Event('vasia:consent'));
}

test('Metricool loads after consent and records the supplied brand only once', () => {
  const dom = page(), w = dom.window, visits = [];
  w.eval(source);
  assert.equal(w.document.querySelector(tracker), null);
  consent(w, false);
  assert.equal(w.document.querySelector(tracker), null);
  consent(w, true);
  const script = w.document.querySelector(tracker);
  assert.ok(script);
  assert.equal(script.async, true);
  w.beTracker = {t: options => visits.push(options.hash)};
  script.dispatchEvent(new w.Event('load'));
  consent(w, true);
  w.eval(source);
  assert.equal(w.document.querySelectorAll(tracker).length, 1);
  assert.deepEqual(visits, ['e5a3aeddb5585d10c71503ff25220e45']);
  dom.window.close();
});

test('Metricool rechecks consent when the external script finishes loading', () => {
  const dom = page(), w = dom.window, visits = [];
  consent(w, true);
  w.eval(source);
  const script = w.document.querySelector(tracker);
  consent(w, false);
  w.beTracker = {t: options => visits.push(options.hash)};
  script.dispatchEvent(new w.Event('load'));
  assert.equal(visits.length, 0);
  consent(w, true);
  assert.equal(visits.length, 1);
  dom.window.close();
});

test('Metricool does not load on admin pages or when saved consent is invalid', () => {
  for (const path of ['/admin', '/admin/login', '/admin/content']) {
    const dom = page(path), w = dom.window;
    consent(w, true);
    w.eval(source);
    assert.equal(w.document.querySelector(tracker), null);
    dom.window.close();
  }
  const dom = page(), w = dom.window;
  w.localStorage.setItem('cookie-consent', 'invalid');
  w.eval(source);
  assert.equal(w.document.querySelector(tracker), null);
  dom.window.close();
});
