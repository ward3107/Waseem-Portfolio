import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import QuoteCalculator from './QuoteCalculator';
import type { QuoteCatalogue } from './catalogue';
import { draftScopeConfig } from './scope';

vi.mock('@/features/contact/useContact', () => ({
  useContact: () => ({ whatsappNumber: '972544513141' }),
}));

const label = { he: 'אתרים ודפי נחיתה', en: 'Websites & landing pages', ar: 'مواقع وصفحات هبوط' };
const landing = { he: 'דף נחיתה', en: 'Landing page', ar: 'صفحة هبوط' };

// These artificial values exercise calculations independently of the
// separately approved production website rates.
const fixture: QuoteCatalogue = {
  publishedPrices: true,
  categories: [{ id: 'websites', label, options: [{
    id: 'landing', label: landing, price: { mode: 'fixed_package', amountIls: 1000, approved: true },
  }] }, { id: 'cards', label: { he: 'כרטיסים', en: 'Cards', ar: 'بطاقات' }, options: [{
    id: 'card_classic', label: { he: 'כרטיס קלאסי', en: 'Classic card', ar: 'بطاقة كلاسيكية' }, price: { mode: 'pending' },
  }] }],
  scope: {
    ...draftScopeConfig,
    profiles: { landing: draftScopeConfig.profiles.landing },
    prices: {
      ...draftScopeConfig.prices,
      extra_page: { mode: 'fixed_package', amountIls: 90, approved: true },
      website_extra_language: { mode: 'fixed_package', amountIls: 200, approved: true },
      enhanced_design: { mode: 'fixed_package', amountIls: 300, approved: true },
    },
  },
};

afterEach(() => { cleanup(); window.localStorage.clear(); });

describe('configurable quote flow', () => {
  it('shows inline choices and a live matching itemized summary', () => {
    window.history.replaceState(null, '', '/?lang=en');
    render(<LanguageProvider><QuoteCalculator catalogue={fixture} inline /></LanguageProvider>);
    expect(screen.getByRole('heading', { name: 'Build your project' })).toBeTruthy();
    expect(screen.getByRole('combobox', { name: 'Service area' })).toBeTruthy();
    expect(screen.getAllByText(/Estimated total:.*1,000/)).toHaveLength(2);
    expect(screen.getByRole('checkbox', { name: /Landing page.*1,000/ })).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Number of pages/), { target: { value: '3' } });
    expect(screen.getAllByText(/Estimated total:.*1,180/)).toHaveLength(2);
    const href = screen.getByRole('link', { name: 'Open summary in WhatsApp' }).getAttribute('href')!;
    expect(decodeURIComponent(href)).toContain('1,180');
    expect(decodeURIComponent(href)).toContain('Number of pages: 3');
  });

  it('drops an untouched starter when switching to an unpriced service area', () => {
    window.history.replaceState(null, '', '/?lang=en');
    render(<LanguageProvider><QuoteCalculator catalogue={fixture} inline /></LanguageProvider>);
    fireEvent.change(screen.getByRole('combobox', { name: 'Service area' }), { target: { value: 'cards' } });
    expect(screen.queryByText(/Estimated total:.*1,000/)).toBeNull();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Classic card' }));
    expect(screen.getByText(/Work outside that scope/)).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Open summary in WhatsApp' })?.getAttribute('href')).not.toContain('Landing page');
  });

  it('recalculates while editing and sends the same scope and total to WhatsApp', () => {
    window.history.replaceState(null, '', '/plan?lang=en');
    render(<LanguageProvider><QuoteCalculator catalogue={fixture} /></LanguageProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Websites & landing pages' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Landing page/ }));

    fireEvent.change(screen.getByLabelText(/Number of pages/), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/Number of languages/), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('radio', { name: /Enhanced design/ }));
    expect(screen.getByText(/Estimated total:.*1,680/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    const firstHref = screen.getByRole('link', { name: 'Open summary in WhatsApp' }).getAttribute('href')!;
    expect(decodeURIComponent(firstHref)).toContain('1,680');
    expect(decodeURIComponent(firstHref)).toContain('Number of pages: 3');
    expect(decodeURIComponent(firstHref)).toContain('Additional languages');

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.change(screen.getByLabelText(/Number of pages/), { target: { value: '4' } });
    expect(screen.getByText(/Estimated total:.*1,770/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    const updatedHref = screen.getByRole('link', { name: 'Open summary in WhatsApp' }).getAttribute('href')!;
    expect(decodeURIComponent(updatedHref)).toContain('1,770');
    expect(decodeURIComponent(updatedHref)).toContain('Number of pages: 4');
    expect(decodeURIComponent(updatedHref)).not.toContain('Number of pages: 3');
  });
});
