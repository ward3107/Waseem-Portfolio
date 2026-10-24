import { describe, expect, it } from 'vitest';
import { formatQuoteAmount, quoteBreakdown, quoteCatalogue, toggleOption, type QuoteCatalogue } from './catalogue';
import { buildRequestMessage } from './request';
import { draftScopeConfig, scopeRows, type QuoteScope } from './scope';

// Test-only values exercise the calculation. They are not commercial prices and
// are not imported into the production catalogue or the public build.
function fixture(): QuoteCatalogue {
  const baseAmounts: Record<string, number> = {
    landing: 1000, business_site: 2000, starter_store: 3500, card_classic: 300, reel_edit: 300,
  };
  const rate = (amountIls: number) => ({ mode: 'fixed_package' as const, amountIls, approved: true as const });
  return {
    ...quoteCatalogue,
    publishedPrices: true,
    categories: quoteCatalogue.categories.map((category) => ({
      ...category,
      options: category.options.map((item) => ({ ...item, price: baseAmounts[item.id] ? rate(baseAmounts[item.id]) : item.price })),
    })),
    scope: {
      ...draftScopeConfig,
      prices: {
        ...draftScopeConfig.prices,
        extra_page: rate(90), website_extra_language: rate(200), product_batch: rate(190), extra_reel: rate(250),
        enhanced_design: rate(300), blog_cms: rate(400), captions: rate(50),
      },
    },
  };
}

describe('composable quote scope', () => {
  it('updates the itemized total when pages, languages or design change', () => {
    const catalogue = fixture();
    const scope: QuoteScope = { landing: { quantities: { pages: 3, languages: 2 }, design: 'enhanced' } };
    const result = quoteBreakdown(catalogue, ['landing'], scope);
    expect(result.pricedItems.map((item) => [item.id, item.quantity, item.minIls])).toEqual([
      ['landing', 1, 1000], ['landing:extra_page', 2, 180],
      ['landing:website_extra_language', 1, 200], ['landing:design:enhanced', 1, 300],
    ]);
    expect(result.total).toEqual({ mode: 'fixed_package', amountIls: 1680 });
    expect(quoteBreakdown(catalogue, ['landing'], { landing: { quantities: { pages: 1, languages: 1 } } }).total)
      .toEqual({ mode: 'fixed_package', amountIls: 1000 });
    expect(quoteBreakdown(catalogue, ['landing'], { landing: { quantities: { pages: 4, languages: 2 }, design: 'enhanced' } }).total)
      .toEqual({ mode: 'fixed_package', amountIls: 1770 });
  });

  it('bills product blocks and duplicate feature selections only once', () => {
    const catalogue = fixture();
    const store = quoteBreakdown(catalogue, ['starter_store'], { starter_store: { quantities: { products: 21 } } });
    expect(store.total).toEqual({ mode: 'fixed_package', amountIls: 3880 });
    expect(store.pricedItems.filter((item) => item.id === 'starter_store:product_batch')).toHaveLength(1);
    const business = quoteBreakdown(catalogue, ['business_site'], { business_site: { features: ['blog_cms', 'blog_cms'] } });
    expect(business.total).toEqual({ mode: 'fixed_package', amountIls: 2400 });
    expect(quoteBreakdown(catalogue, ['landing'], { landing: { quantities: { pages: 99 } } }).total)
      .toEqual({ mode: 'manual_quote' });
  });

  it('drops a previous base and its scope when the customer switches service', () => {
    const catalogue = fixture();
    const selected = toggleOption(catalogue, ['landing'], 'business_site');
    expect(selected).toEqual(['business_site']);
    const stale: QuoteScope = { landing: { quantities: { pages: 10 } }, business_site: { quantities: { pages: 5 } } };
    expect(scopeRows(catalogue, selected, stale).some((row) => row.optionId === 'landing')).toBe(false);
    expect(quoteBreakdown(catalogue, selected, stale).total).toEqual({ mode: 'fixed_package', amountIls: 2360 });
  });

  it('marks custom costs as partial and sends matching scope in Hebrew, Arabic and English', () => {
    const catalogue = fixture();
    const scope: QuoteScope = { landing: { quantities: { pages: 2 }, features: ['booking'] } };
    const result = quoteBreakdown(catalogue, ['landing'], scope);
    expect(result.knownSubtotal).toEqual({ minIls: 1090, maxIls: 1090 });
    expect(result.total).toEqual({ mode: 'manual_quote' });
    for (const language of ['he', 'ar', 'en'] as const) {
      const message = buildRequestMessage(catalogue, {
        language, categoryIds: ['websites'], optionIds: ['landing'], scope,
        unsureCategoryIds: [], unsureOverall: false, projectStage: 'new', businessName: '', notes: '',
      });
      expect(message).toContain(formatQuoteAmount(language, 1090, 1090));
      expect(message).toContain('2');
      expect(message).toContain(scopeRows(catalogue, ['landing'], scope).find((row) => row.id === 'landing:booking')!.label[language]);
      expect(message).not.toContain('Estimated total');
      expect(message).not.toContain('undefined');
    }
  });
});
