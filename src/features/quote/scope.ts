import type { Language } from '@/types';
import type { PriceRule, QuoteCatalogue } from './catalogue';

export type LocalizedScopeText = Record<Language, string>;
export type ScopeQuantity = 'pages' | 'languages' | 'products' | 'reels';
export type ScopeFeature = 'blog_cms' | 'booking' | 'custom_form' | 'motion_hero' |
  'member_login' | 'custom_payment' | 'captions' | 'motion_titles';
export type ScopePriceKey = 'extra_page' | 'website_extra_language' | 'extra_language' | 'product_batch' | 'extra_reel' |
  'enhanced_design' | 'custom_design' | ScopeFeature;
type QuantityPriceKey = 'extra_page' | 'website_extra_language' | 'extra_language' | 'product_batch' | 'extra_reel';

export type ScopeValues = {
  quantities?: Partial<Record<ScopeQuantity, number>>;
  design?: 'standard' | 'enhanced' | 'custom';
  features?: ScopeFeature[];
};
export type QuoteScope = Record<string, ScopeValues>;

export type QuantityRule = { included: number; max: number; perCharge: number; priceKey: QuantityPriceKey };
export type ScopeProfile = {
  quantities: Partial<Record<ScopeQuantity, QuantityRule>>;
  design?: boolean;
  features?: ScopeFeature[];
};
export type ScopeConfig = {
  profiles: Record<string, ScopeProfile>;
  prices: Record<ScopePriceKey, PriceRule>;
};
export type ScopeRow = {
  id: string;
  optionId: string;
  label: LocalizedScopeText;
  /** Included scope has no separate price and must never be billed again. */
  price: PriceRule | null;
  quantity: number;
};

const text = (he: string, en: string, ar: string): LocalizedScopeText => ({ he, en, ar });
const manual = (): PriceRule => ({ mode: 'manual_quote' });

export const scopeCopy = {
  quantities: {
    pages: text('מספר עמודים', 'Number of pages', 'عدد الصفحات'),
    languages: text('מספר שפות', 'Number of languages', 'عدد اللغات'),
    products: text('מספר מוצרים להזנה', 'Products to enter', 'عدد المنتجات للإدخال'),
    reels: text('מספר סרטונים', 'Number of videos', 'عدد الفيديوهات'),
  },
  extras: {
    extra_page: text('עמודים נוספים', 'Additional pages', 'صفحات إضافية'),
    extra_language: text('שפות נוספות', 'Additional languages', 'لغات إضافية'),
    website_extra_language: text('שפות נוספות', 'Additional languages', 'لغات إضافية'),
    product_batch: text('קבוצות של עד 10 מוצרים נוספים', 'Additional batches of up to 10 products', 'دفعات إضافية حتى 10 منتجات'),
    extra_reel: text('סרטונים נוספים', 'Additional videos', 'فيديوهات إضافية'),
  },
  design: {
    heading: text('רמת עיצוב', 'Design level', 'مستوى التصميم'),
    standard: text('עיצוב רגיל', 'Standard design', 'تصميم أساسي'),
    enhanced: text('עיצוב מורחב', 'Enhanced design', 'تصميم موسّع'),
    custom: text('עיצוב מותאם אישית', 'Custom design', 'تصميم مخصص'),
  },
  features: {
    blog_cms: text('בלוג ומערכת תוכן', 'Blog and content management', 'مدونة وإدارة محتوى'),
    booking: text('תיאום פגישות', 'Appointment booking', 'حجز المواعيد'),
    custom_form: text('טופס מותאם ואינטגרציה', 'Custom form and integration', 'نموذج مخصص وربط'),
    motion_hero: text('אנימציה בפתיח', 'Animated hero', 'حركة في الواجهة'),
    member_login: text('אזור חברים', 'Member login', 'دخول الأعضاء'),
    custom_payment: text('סליקה מותאמת', 'Custom payment integration', 'ربط دفع مخصص'),
    captions: text('כתוביות לסרטון', 'Video captions', 'ترجمة نصية للفيديو'),
    motion_titles: text('כותרות מונפשות', 'Animated titles', 'عناوين متحركة'),
  },
  invalid: text('היקף מחוץ לטווח – נדרשת הצעה', 'Scope outside range – quote required', 'النطاق خارج الحدود – يتطلب عرض سعر'),
  included: text('כלול בבחירה', 'Included in selection', 'مشمول في الاختيار'),
} as const;

// Public scope rates, updated with the service catalogue on 2026-10-24.
export const draftScopeConfig: ScopeConfig = {
  profiles: {
    landing: { quantities: { pages: { included: 1, max: 12, perCharge: 1, priceKey: 'extra_page' }, languages: { included: 1, max: 3, perCharge: 1, priceKey: 'website_extra_language' } }, design: true, features: ['booking', 'custom_form', 'motion_hero'] },
    business_site: { quantities: { pages: { included: 1, max: 30, perCharge: 1, priceKey: 'extra_page' }, languages: { included: 1, max: 3, perCharge: 1, priceKey: 'website_extra_language' } }, design: true, features: ['blog_cms', 'booking', 'custom_form', 'motion_hero', 'member_login'] },
    starter_store: { quantities: { products: { included: 10, max: 100, perCharge: 10, priceKey: 'product_batch' }, languages: { included: 1, max: 3, perCharge: 1, priceKey: 'extra_language' } }, design: true, features: ['member_login', 'custom_payment'] },
    card_classic: { quantities: { languages: { included: 1, max: 3, perCharge: 1, priceKey: 'extra_language' } } },
    card_motion: { quantities: { languages: { included: 1, max: 3, perCharge: 1, priceKey: 'extra_language' } } },
    card_signature: { quantities: { languages: { included: 1, max: 3, perCharge: 1, priceKey: 'extra_language' } } },
    reel_edit: { quantities: { reels: { included: 1, max: 10, perCharge: 1, priceKey: 'extra_reel' } }, features: ['captions', 'motion_titles'] },
  },
  prices: {
    "extra_page": {
        "mode": "fixed_package",
        "amountIls": 220,
        "approved": true
    },
    "website_extra_language": {
        "mode": "fixed_package",
        "amountIls": 400,
        "approved": true
    },
    "extra_language": {
        "mode": "fixed_package",
        "amountIls": 200,
        "approved": true
    },
    "product_batch": {
        "mode": "fixed_package",
        "amountIls": 220,
        "approved": true
    },
    "extra_reel": {
        "mode": "fixed_package",
        "amountIls": 300,
        "approved": true
    },
    "enhanced_design": {
        "mode": "fixed_package",
        "amountIls": 650,
        "approved": true
    },
    "custom_design": {
        "mode": "estimate_range",
        "minIls": 1150,
        "maxIls": 2300,
        "approved": true
    },
    "blog_cms": {
        "mode": "fixed_package",
        "amountIls": 450,
        "approved": true
    },
    "booking": {
        "mode": "estimate_range",
        "minIls": 450,
        "maxIls": 900,
        "approved": true
    },
    "custom_form": {
        "mode": "estimate_range",
        "minIls": 350,
        "maxIls": 800,
        "approved": true
    },
    "motion_hero": {
        "mode": "fixed_package",
        "amountIls": 340,
        "approved": true
    },
    "member_login": {
        "mode": "estimate_range",
        "minIls": 900,
        "maxIls": 1750,
        "approved": true
    },
    "custom_payment": {
        "mode": "estimate_range",
        "minIls": 650,
        "maxIls": 1500,
        "approved": true
    },
    "captions": {
        "mode": "fixed_package",
        "amountIls": 90,
        "approved": true
    },
    "motion_titles": {
        "mode": "fixed_package",
        "amountIls": 150,
        "approved": true
    }
},};

const quantityOrder: ScopeQuantity[] = ['pages', 'languages', 'products', 'reels'];

/** One shared description drives the review UI, calculation and WhatsApp text. */
export function scopeRows(catalogue: QuoteCatalogue, selectedIds: string[], scope: QuoteScope = {}): ScopeRow[] {
  const config = catalogue.scope;
  if (!config) return [];
  const rows: ScopeRow[] = [];
  for (const optionId of new Set(selectedIds)) {
    const profile = config.profiles[optionId];
    if (!profile) continue;
    const values = scope[optionId] ?? {};
    for (const kind of quantityOrder) {
      const rule = profile.quantities[kind];
      if (!rule) continue;
      const chosen = values.quantities?.[kind] ?? rule.included;
      if (!Number.isSafeInteger(chosen) || chosen < rule.included || chosen > rule.max) {
        rows.push({ id: `${optionId}:${kind}:invalid`, optionId, label: text(
          `${scopeCopy.quantities[kind].he}: ${chosen} — ${scopeCopy.invalid.he}`,
          `${scopeCopy.quantities[kind].en}: ${chosen} — ${scopeCopy.invalid.en}`,
          `${scopeCopy.quantities[kind].ar}: ${chosen} — ${scopeCopy.invalid.ar}`,
        ), price: manual(), quantity: 1 });
        continue;
      }
      rows.push({ id: `${optionId}:${kind}`, optionId, label: text(
        `${scopeCopy.quantities[kind].he}: ${chosen}`,
        `${scopeCopy.quantities[kind].en}: ${chosen}`,
        `${scopeCopy.quantities[kind].ar}: ${chosen}`,
      ), price: null, quantity: 1 });
      const extra = Math.ceil((chosen - rule.included) / rule.perCharge);
      if (extra) rows.push({ id: `${optionId}:${rule.priceKey}`, optionId, label: scopeCopy.extras[rule.priceKey], price: config.prices[rule.priceKey], quantity: extra });
    }
    if (profile.design) {
      const design = values.design ?? 'standard';
      rows.push({
        id: `${optionId}:design:${design}`, optionId,
        label: scopeCopy.design[design],
        price: design === 'standard' ? null : config.prices[design === 'enhanced' ? 'enhanced_design' : 'custom_design'],
        quantity: 1,
      });
    }
    for (const feature of new Set(values.features ?? [])) {
      if (!profile.features?.includes(feature)) continue;
      rows.push({ id: `${optionId}:${feature}`, optionId, label: scopeCopy.features[feature], price: config.prices[feature], quantity: 1 });
    }
  }
  return rows;
}
