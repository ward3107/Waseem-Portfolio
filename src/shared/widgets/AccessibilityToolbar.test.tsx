import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import AccessibilityToolbar from './AccessibilityToolbar';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
});

const show = () => render(<LanguageProvider><AccessibilityToolbar /></LanguageProvider>);

describe('accessibility toolbar', () => {
  it('returns keyboard focus to the launcher after closing', () => {
    window.history.replaceState(null, '', '/?lang=en');
    show();
    fireEvent.click(screen.getByRole('button', { name: /accessibility/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /accessibility/i }));
  });

  it('keeps the launcher hidden for the browser session', () => {
    window.history.replaceState(null, '', '/?lang=en');
    const view = show();
    fireEvent.click(screen.getByRole('button', { name: /accessibility/i }));
    fireEvent.click(screen.getByRole('button', { name: /hide/i }));
    expect(screen.queryByRole('button', { name: /accessibility/i })).toBeNull();
    view.unmount();
    show();
    expect(screen.queryByRole('button', { name: /accessibility/i })).toBeNull();
  });
});
