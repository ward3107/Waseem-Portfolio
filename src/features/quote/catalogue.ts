import type { Language } from '@/types';

export type QuoteItem = {
  id: string;
  label: Record<Language, string>;
  priceIls: number | null;
};

export type QuoteCatalogue = {
  published: boolean;
  services: QuoteItem[];
  addOns: QuoteItem[];
};

// Publication requires Waseem's approved numeric prices. Until then the
// calculator is omitted from the public site, including direct-link previews.
export const quoteCatalogue: QuoteCatalogue = {
  published: false,
  services: [
    { id: 'website', label: { he: 'אתר תדמית', en: 'Business website', ar: 'موقع تعريفي' }, priceIls: null },
    { id: 'store', label: { he: 'חנות מקוונת', en: 'Online store', ar: 'متجر إلكتروني' }, priceIls: null },
    { id: 'app', label: { he: 'אפליקציית ווב', en: 'Web app', ar: 'تطبيق ويب' }, priceIls: null },
    { id: 'automation', label: { he: 'אוטומציה ו-AI', en: 'AI automation', ar: 'أتمتة وذكاء اصطناعي' }, priceIls: null },
  ],
  addOns: [
    { id: 'multilingual', label: { he: 'שפות נוספות', en: 'Additional languages', ar: 'لغات إضافية' }, priceIls: null },
    { id: 'content', label: { he: 'הזנת תוכן', en: 'Content entry', ar: 'إدخال المحتوى' }, priceIls: null },
    { id: 'seo', label: { he: 'הגדרת SEO', en: 'SEO setup', ar: 'إعداد SEO' }, priceIls: null },
  ],
};

export const canPublishQuote = (catalogue: QuoteCatalogue): boolean =>
  catalogue.published && catalogue.services.length > 0 &&
  [...catalogue.services, ...catalogue.addOns].every(
    (item) => Number.isFinite(item.priceIls) && item.priceIls !== null && item.priceIls >= 0
  );

export function quoteTotal(catalogue: QuoteCatalogue, serviceId: string, addOnIds: string[]): number | null {
  if (!canPublishQuote(catalogue)) return null;
  const service = catalogue.services.find((item) => item.id === serviceId);
  if (!service || service.priceIls === null) return null;
  const selected = addOnIds.map((id) => catalogue.addOns.find((item) => item.id === id));
  if (selected.some((item) => !item || item.priceIls === null)) return null;
  return service.priceIls + selected.reduce((sum, item) => sum + (item?.priceIls ?? 0), 0);
}
