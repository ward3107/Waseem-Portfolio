import { describe, expect, it } from 'vitest';
import {
  allOptions, canSelectOption, quoteBreakdown, quoteCatalogue, quoteEstimate, toggleOption,
  type QuoteCatalogue,
} from './catalogue';
import { buildRequestMessage } from './request';

describe('service request catalogue', () => {
  it('covers twelve areas without publishing unapproved numbers', () => {
    expect(quoteCatalogue.categories).toHaveLength(12);
    expect(new Set(allOptions(quoteCatalogue).map((item) => item.id)).size).toBe(allOptions(quoteCatalogue).length);
    expect(quoteCatalogue.publishedPrices).toBe(false);
    expect(quoteEstimate(quoteCatalogue, ['landing'])).toEqual({ mode: 'manual_quote' });
  });

  it('keeps competing web packages and card levels out of one request', () => {
    let selected = toggleOption(quoteCatalogue, [], 'landing');
    selected = toggleOption(quoteCatalogue, selected, 'extra_language');
    selected = toggleOption(quoteCatalogue, selected, 'starter_store');
    expect(selected).toEqual(['extra_language', 'starter_store']);
    selected = toggleOption(quoteCatalogue, selected, 'starter_store');
    expect(selected).toEqual([]);
    selected = toggleOption(quoteCatalogue, selected, 'card_classic');
    selected = toggleOption(quoteCatalogue, selected, 'card_motion');
    expect(selected).toEqual(['card_motion']);
  });

  it('requires a store before product entry and blocks unknown IDs', () => {
    expect(canSelectOption(quoteCatalogue, [], 'product_entry')).toBe(false);
    expect(toggleOption(quoteCatalogue, [], 'product_entry')).toEqual([]);
    expect(toggleOption(quoteCatalogue, [], 'unknown')).toEqual([]);
    expect(canSelectOption(quoteCatalogue, ['starter_store'], 'product_entry')).toBe(true);
  });

  it('can total only owner-approved fixed items and treats unknown costs as manual', () => {
    const catalogue: QuoteCatalogue = {
      publishedPrices: true,
      categories: [{
        id: 'test', label: { he: 'בדיקה', en: 'Test', ar: 'اختبار' },
        options: [
          { id: 'fixed', label: { he: 'קבוע', en: 'Fixed', ar: 'ثابت' }, price: { mode: 'fixed_package', amountIls: 900, approved: true } },
          { id: 'range', label: { he: 'טווח', en: 'Range', ar: 'نطاق' }, price: { mode: 'estimate_range', minIls: 100, maxIls: 200, approved: true } },
          { id: 'custom', label: { he: 'מותאם', en: 'Custom', ar: 'مخصص' }, price: { mode: 'manual_quote' } },
        ],
      }],
    };
    expect(quoteEstimate(catalogue, ['fixed'])).toEqual({ mode: 'fixed_package', amountIls: 900 });
    expect(quoteEstimate(catalogue, ['fixed', 'range'])).toEqual({ mode: 'estimate_range', minIls: 1000, maxIls: 1100 });
    expect(quoteEstimate(catalogue, ['fixed', 'custom'])).toEqual({ mode: 'manual_quote' });
    expect(quoteEstimate(catalogue, ['unknown'])).toEqual({ mode: 'manual_quote' });
  });

  it('itemizes approved amounts without double counting or presenting partial work as a total', () => {
    const priced: QuoteCatalogue = {
      publishedPrices: true,
      categories: [{ id: 'web', label: { he: 'אתר', en: 'Web', ar: 'موقع' }, options: [
        { id: 'landing', label: { he: 'דף', en: 'Landing', ar: 'صفحة' }, exclusiveGroup: 'web_base', price: { mode: 'fixed_package', amountIls: 80, approved: true } },
        { id: 'store', label: { he: 'חנות', en: 'Store', ar: 'متجر' }, exclusiveGroup: 'web_base', price: { mode: 'fixed_package', amountIls: 120, approved: true } },
        { id: 'addon', label: { he: 'תוספת', en: 'Add-on', ar: 'إضافة' }, requiresAny: ['landing', 'store'], price: { mode: 'fixed_package', amountIls: 20, approved: true } },
        { id: 'custom', label: { he: 'מותאם', en: 'Custom', ar: 'مخصص' }, price: { mode: 'manual_quote' } },
      ] }],
    };
    const complete = quoteBreakdown(priced, ['landing', 'landing', 'addon']);
    expect(complete.pricedItems.map((item) => item.id)).toEqual(['landing', 'addon']);
    expect(complete.total).toEqual({ mode: 'fixed_package', amountIls: 100 });
    expect(quoteBreakdown(priced, ['landing', 'store']).total).toEqual({ mode: 'manual_quote' });
    expect(quoteBreakdown(priced, ['addon']).total).toEqual({ mode: 'manual_quote' });

    const partial = quoteBreakdown(priced, ['landing', 'custom']);
    expect(partial.knownSubtotal).toEqual({ minIls: 80, maxIls: 80 });
    expect(partial.unpricedIds).toEqual(['custom']);
    expect(partial.total).toEqual({ mode: 'manual_quote' });
    const message = buildRequestMessage(priced, {
      language: 'en', categoryIds: ['web'], optionIds: ['landing', 'custom'], unsureCategoryIds: [],
      unsureOverall: false, projectStage: 'new', businessName: '', notes: '',
    });
    expect(message).toContain('Landing');
    expect(message).toContain('80');
    expect(message).toContain('Custom — Request a quote');
    expect(message).toContain('Priced items subtotal only');
    expect(message).not.toContain('Estimated total');
  });

  it('builds a scoped WhatsApp request without an invented price', () => {
    const message = buildRequestMessage(quoteCatalogue, {
      language: 'he', categoryIds: ['websites', 'seo'], optionIds: ['landing', 'seo_audit', 'unknown'],
      unsureCategoryIds: [], unsureOverall: false, projectStage: 'new',
      businessName: '  דוגמה  ', notes: ' צריך אתר בעברית ',
    });
    expect(message).toContain('דף נחיתה');
    expect(message).toContain('בדיקת SEO טכני');
    expect(message).toContain('דוגמה');
    expect(message).toContain('אתר בעברית');
    expect(message).not.toContain('unknown');
    expect(message).not.toMatch(/₪|0 ₪/);
  });
});
