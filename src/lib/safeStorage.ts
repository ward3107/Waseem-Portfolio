/**
 * localStorage is not always available or writable. Accessing `window.localStorage`
 * — or calling get/set on it — throws in several real browser configurations:
 *  - Safari Private Browsing (historically throws on setItem; quota is 0)
 *  - Chrome/Edge with "Block all cookies" or third-party storage blocked
 *  - Sandboxed iframes without `allow-same-origin`
 *  - Firefox with `dom.storage.enabled = false`
 *
 * A raw `localStorage.getItem(...)` in a React state initializer or provider
 * therefore throws during render, and with no error boundary that white-screens
 * the whole site for those visitors. These helpers swallow the failure and
 * degrade to "no persistence" instead of crashing.
 */

export function safeGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked/full — persistence is best-effort, so ignore.
  }
}

export function safeRemoveItem(key: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}
