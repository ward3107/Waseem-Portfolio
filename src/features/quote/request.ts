import type { Language } from '@/types';
import { allOptions, formatQuoteAmount, quoteBreakdown, type QuoteCatalogue } from './catalogue';
import { scopeRows, type QuoteScope } from './scope';

export type RequestDetails = {
  language: Language;
  categoryIds: string[];
  optionIds: string[];
  scope?: QuoteScope;
  unsureCategoryIds: string[];
  unsureOverall: boolean;
  projectStage: 'new' | 'existing' | 'unsure';
  businessName: string;
  notes: string;
};

const lines = {
  he: {
    intro: 'היי ואסיה, אני מבקש/ת הצעת מחיר לפרויקט.',
    services: 'שירותים שבחרתי:',
    unsure: 'אשמח לעזרה בבחירת השירות המתאים',
    stage: 'מצב הפרויקט',
    stages: { new: 'פרויקט חדש', existing: 'יש לי אתר או מוצר קיים', unsure: 'עדיין לא בטוח/ה' },
    business: 'עסק',
    notes: 'פרטים נוספים',
    itemQuote: 'לפי הצעת מחיר',
    total: 'סה״כ משוער',
    partial: 'סכום ביניים לפריטים מתומחרים בלבד (לא מחיר הפרויקט)',
    finish: 'אשמח להצעה לפי היקף העבודה. טרם נקבע מחיר.',
  },
  en: {
    intro: 'Hi vasia, I would like a project quote.',
    services: 'Services selected:',
    unsure: 'I would like help choosing the right service',
    stage: 'Project stage',
    stages: { new: 'New project', existing: 'Existing site or product', unsure: 'Not sure yet' },
    business: 'Business',
    notes: 'More details',
    itemQuote: 'Request a quote',
    total: 'Estimated total',
    partial: 'Priced items subtotal only (not the project price)',
    finish: 'Please quote based on the project scope. No price has been agreed.',
  },
  ar: {
    intro: 'مرحباً vasia، أود طلب عرض سعر لمشروع.',
    services: 'الخدمات المختارة:',
    unsure: 'أحتاج مساعدة في اختيار الخدمة المناسبة',
    stage: 'حالة المشروع',
    stages: { new: 'مشروع جديد', existing: 'لدي موقع أو منتج قائم', unsure: 'لست متأكداً بعد' },
    business: 'النشاط التجاري',
    notes: 'تفاصيل إضافية',
    itemQuote: 'بحاجة إلى عرض سعر',
    total: 'الإجمالي التقديري',
    partial: 'مجموع العناصر المسعّرة فقط (ليس سعر المشروع)',
    finish: 'أرجو تقديم عرض حسب نطاق العمل. لم يتم الاتفاق على سعر بعد.',
  },
} as const;

export function buildRequestMessage(catalogue: QuoteCatalogue, details: RequestDetails): string {
  const t = lines[details.language];
  const selected = new Set(details.optionIds);
  const uncertain = new Set(details.unsureCategoryIds);
  const options = allOptions(catalogue);
  const allowedIds = catalogue.categories
    .filter((category) => details.categoryIds.includes(category.id))
    .flatMap((category) => category.options.filter((item) => selected.has(item.id)).map((item) => item.id));
  const breakdown = quoteBreakdown(catalogue, allowedIds, details.scope);
  const detailsRows = scopeRows(catalogue, allowedIds, details.scope);
  const amountFor = (id: string) => {
    const item = breakdown.pricedItems.find((priced) => priced.id === id);
    return item ? formatQuoteAmount(details.language, item.minIls, item.maxIls) : t.itemQuote;
  };
  const serviceLines = catalogue.categories
    .filter((category) => details.categoryIds.includes(category.id))
    .flatMap((category) => {
      const picked = category.options.filter((item) => selected.has(item.id));
      return [
        ...picked.flatMap((item) => [
          '- ' + category.label[details.language] + ': ' + item.label[details.language] + ' — ' + amountFor(item.id),
          ...detailsRows.filter((row) => row.optionId === item.id).map((row) =>
            '  · ' + row.label[details.language] + (row.quantity > 1 ? ' ×' + row.quantity : '') +
            (row.price ? ' — ' + amountFor(row.id) : '')),
        ]),
        ...(uncertain.has(category.id) ? ['- ' + category.label[details.language] + ': ' + t.unsure] : []),
      ];
    });
  // Discard forged or stale option IDs: only the catalogue's selected categories
  // may contribute to the outbound summary.
  if (!options.length || (!serviceLines.length && !details.unsureOverall)) return '';
  const business = details.businessName.trim().slice(0, 120);
  const notes = details.notes.trim().slice(0, 700);
  return [
    t.intro,
    '',
    t.services,
    ...serviceLines,
    ...(details.unsureOverall ? ['- ' + t.unsure] : []),
    ...(breakdown.knownSubtotal ? [
      (breakdown.total.mode !== 'manual_quote' && !details.unsureOverall && !details.unsureCategoryIds.length
        ? t.total : t.partial) + ': ' + formatQuoteAmount(details.language, breakdown.knownSubtotal.minIls, breakdown.knownSubtotal.maxIls),
    ] : []),
    '',
    t.stage + ': ' + t.stages[details.projectStage],
    ...(business ? [t.business + ': ' + business] : []),
    ...(notes ? [t.notes + ': ' + notes] : []),
    '',
    t.finish,
  ].join('\n');
}
