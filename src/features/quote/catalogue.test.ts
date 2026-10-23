import { describe, expect, it } from 'vitest';
import { canPublishQuote, quoteCatalogue, quoteTotal } from './catalogue';

describe('quote publication gate', () => {
  it('keeps the calculator unpublished until every price is approved', () => {
    expect(canPublishQuote(quoteCatalogue)).toBe(false);
    expect(quoteTotal(quoteCatalogue, 'website', [])).toBeNull();
  });

  it('calculates only configured selections and rejects unknown add-ons', () => {
    const catalogue = {
      published: true,
      services: [{ ...quoteCatalogue.services[0], priceIls: 1000 }],
      addOns: [{ ...quoteCatalogue.addOns[0], priceIls: 200 }],
    };
    expect(canPublishQuote(catalogue)).toBe(true);
    expect(quoteTotal(catalogue, 'website', ['multilingual'])).toBe(1200);
    expect(quoteTotal(catalogue, 'website', ['unknown'])).toBeNull();
  });
});
