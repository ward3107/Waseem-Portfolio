import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import AccessibilityToolbar from './AccessibilityToolbar';
import { A11Y_OPEN_EVENT, normalizeA11ySettings } from './accessibilitySettings';

beforeEach(() => {
  // jsdom has no top layer. Browser tests cover the real modal implementation.
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: { configurable: true, value: function(this: HTMLDialogElement) { this.open = true; this.querySelector<HTMLElement>('[autofocus]')?.focus(); } },
    close: { configurable: true, value: function(this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); } },
  });
  window.history.replaceState(null, '', '/?lang=en');
});
afterEach(() => {
  cleanup(); sessionStorage.clear(); localStorage.clear();
  for (const attr of Array.from(document.documentElement.attributes)) if (attr.name.startsWith('data-a11y-')) document.documentElement.removeAttribute(attr.name);
  document.documentElement.style.fontSize = '';
  document.documentElement.style.removeProperty('--a11y-scale');
});
const show = () => render(<LanguageProvider><AccessibilityToolbar /></LanguageProvider>);
const open = () => { fireEvent.click(screen.getByRole('button', { name: 'Accessibility settings' })); };

describe('accessibility toolbar', () => {
  it('returns focus, exposes expanded state and unlocks scrolling after closing', () => {
    show(); open();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(document.documentElement.hasAttribute('data-a11y-dialog-open')).toBe(true);
    expect(screen.getByRole('button', { name: 'Accessibility settings' }).getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Close accessibility settings' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Accessibility settings' }));
    expect(document.documentElement.hasAttribute('data-a11y-dialog-open')).toBe(false);
  });
  it('marks the scroll region to bypass smooth scrolling and closes on Escape/cancel', () => {
    show(); open();
    expect(document.querySelector('.a11y-scroll')?.hasAttribute('data-lenis-prevent')).toBe(true);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('wraps Tab and Shift+Tab inside the dialog', () => {
    show(); open();
    screen.getByRole('link', { name: 'Accessibility statement and contact' }).focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close accessibility settings' }));
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Accessibility statement and contact' }));
  });
  it('keeps session hiding reversible from the statement page', () => {
    const view = show(); open();
    fireEvent.click(screen.getByRole('button', { name: /Hide for this visit/ }));
    expect(screen.queryByRole('button', { name: 'Accessibility settings' })).toBeNull();
    view.unmount(); show();
    expect(screen.queryByRole('button', { name: 'Accessibility settings' })).toBeNull();
    fireEvent(window, new Event(A11Y_OPEN_EVENT));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(sessionStorage.getItem('a11y-widget-hidden')).toBeNull();
  });
  it.each([
    ['Highlight links', 'data-a11y-highlight-links'], ['Readable font', 'data-a11y-readable-font'],
    ['Text spacing', 'data-a11y-text-spacing'], ['Highlight headings', 'data-a11y-highlight-headings'],
    ['Stronger keyboard focus', 'data-a11y-focus-highlight'], ['Reduce motion and animations', 'data-a11y-reduced-motion'],
    ['Large cursor', 'data-a11y-large-cursor'], ['Hide decorative media', 'data-a11y-hide-images'],
    ['Grayscale media', 'data-a11y-grayscale'], ['Align text to reading direction', 'data-a11y-align-text'],
    ['Reading guide', 'data-a11y-reading-guide'],
  ])('applies and resets %s', (label, attribute) => {
    show(); open(); fireEvent.click(screen.getByRole('checkbox', { name: label }));
    expect(document.documentElement.hasAttribute(attribute)).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Reset settings' }));
    expect(document.documentElement.hasAttribute(attribute)).toBe(false);
  });
  it('persists text size and contrast without filtering html or changing theme', () => {
    document.documentElement.classList.add('dark');
    show(); open();
    fireEvent.click(screen.getByRole('button', { name: 'Increase text size' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(document.documentElement.style.fontSize).toBe('125%');
    expect(document.documentElement.style.filter).toBe('');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    const saved = JSON.parse(localStorage.getItem('a11y-settings')!);
    expect(saved.fontSize).toBe(125); expect(saved.contrastMode).toBe('inverted');
    document.documentElement.classList.remove('dark');
  });
  it('clamps or discards corrupt saved preferences', () => {
    expect(normalizeA11ySettings({ fontSize: 900, highlightLinks: 'false' }).fontSize).toBe(200);
    expect(normalizeA11ySettings({ fontSize: -100 }).fontSize).toBe(100);
    expect(normalizeA11ySettings({ fontSize: NaN, contrastMode: 'x' }).contrastMode).toBe('normal');
    expect(normalizeA11ySettings({ highlightLinks: 'false' }).highlightLinks).toBe(false);
    expect(normalizeA11ySettings(null).fontSize).toBe(100);
  });
});
