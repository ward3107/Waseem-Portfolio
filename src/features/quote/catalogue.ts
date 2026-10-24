import type { Language } from '@/types';
import { draftScopeConfig, scopeRows, type QuoteScope, type ScopeConfig } from './scope';

type Localized = Record<Language, string>;

export type PriceRule =
  | { mode: 'pending' }
  | { mode: 'manual_quote' }
  | { mode: 'fixed_package'; amountIls: number; approved: true }
  | { mode: 'estimate_range'; minIls: number; maxIls: number; approved: true };

export type QuoteOption = {
  id: string;
  label: Localized;
  price: PriceRule;
  exclusiveGroup?: string;
  requiresAny?: string[];
};

export type QuoteCategory = {
  id: string;
  label: Localized;
  options: QuoteOption[];
};

export type QuoteCatalogue = {
  /** Remains false until the owner approves the entire public numeric catalogue. */
  publishedPrices: boolean;
  categories: QuoteCategory[];
  scope?: ScopeConfig;
};

const label = (he: string, en: string, ar: string): Localized => ({ he, en, ar });
const pending = (): PriceRule => ({ mode: 'pending' });
const manual = (): PriceRule => ({ mode: 'manual_quote' });
const option = (id: string, he: string, en: string, ar: string, extra: Partial<QuoteOption> = {}): QuoteOption => ({
  id, label: label(he, en, ar), price: pending(), ...extra,
});

const primaryWeb = 'primary_web_presence';

// No numeric price is approved. Categories represent work customers can ask
// about, not commercial commitments. Manual items need individual scoping.
export const quoteCatalogue: QuoteCatalogue = {
  publishedPrices: false,
  scope: draftScopeConfig,
  categories: [
    {
      id: 'websites', label: label('אתרים ודפי נחיתה', 'Websites & landing pages', 'مواقع وصفحات هبوط'), options: [
        option('landing', 'דף נחיתה', 'Landing page', 'صفحة هبوط', { exclusiveGroup: primaryWeb }),
        option('business_site', 'אתר עסקי', 'Business website', 'موقع أعمال', { exclusiveGroup: primaryWeb }),
        option('custom_site', 'אתר בהתאמה אישית', 'Custom website', 'موقع مخصص', { exclusiveGroup: primaryWeb, price: manual() }),
      ],
    },
    {
      id: 'commerce', label: label('חנויות ומסחר', 'Online stores', 'متاجر إلكترونية'), options: [
        option('starter_store', 'חנות למוצרים פשוטים', 'Store for standard products', 'متجر لمنتجات عادية', { exclusiveGroup: primaryWeb }),
        option('custom_store', 'חנות עם תהליכים מיוחדים', 'Custom commerce flow', 'متجر بمسارات مخصصة', { exclusiveGroup: primaryWeb, price: manual() }),
      ],
    },
    {
      id: 'cards', label: label('כרטיסי ביקור דיגיטליים', 'Digital business cards', 'بطاقات عمل رقمية'), options: [
        option('card_classic', 'כרטיס קלאסי', 'Classic card', 'بطاقة كلاسيكية', { exclusiveGroup: 'digital_card_level' }),
        option('card_motion', 'כרטיס עם תנועה', 'Motion card', 'بطاقة متحركة', { exclusiveGroup: 'digital_card_level' }),
        option('card_signature', 'עיצוב ייחודי לכרטיס', 'Signature card design', 'تصميم بطاقة مميز', { exclusiveGroup: 'digital_card_level' }),
      ],
    },
    {
      id: 'apps', label: label('אפליקציות ו־PWA', 'Apps & PWA', 'تطبيقات وPWA'), options: [
        option('pwa', 'אפליקציית ווב / PWA', 'Web app / PWA', 'تطبيق ويب / PWA', { exclusiveGroup: 'application_build', price: manual() }),
        option('mobile_app', 'אפליקציית מובייל', 'Mobile app', 'تطبيق هاتف', { exclusiveGroup: 'application_build', price: manual() }),
        option('store_launch', 'הכנה ופרסום בחנויות אפליקציות', 'App store launch support', 'تجهيز ونشر في متاجر التطبيقات', { price: manual() }),
      ],
    },
    {
      id: 'agents', label: label('סוכני AI וצ׳אטבוטים', 'AI agents & chatbots', 'وكلاء AI وروبوتات محادثة'), options: [
        option('website_chatbot', 'צ׳אטבוט לאתר', 'Website chatbot', 'روبوت محادثة للموقع', { price: manual() }),
        option('business_agent', 'סוכן AI לתהליך עסקי', 'AI agent for a business process', 'وكيل AI لعملية عمل', { price: manual() }),
        option('knowledge_assistant', 'עוזר מבוסס מאגר ידע', 'Knowledge-base assistant', 'مساعد يعتمد على قاعدة معرفة', { price: manual() }),
      ],
    },
    {
      id: 'automation', label: label('אוטומציה, API ו־CRM', 'Automation, APIs & CRM', 'أتمتة وAPI وCRM'), options: [
        option('workflow', 'אוטומציה לתהליך חוזר', 'Recurring workflow automation', 'أتمتة عملية متكررة', { price: manual() }),
        option('crm', 'חיבור למערכת CRM', 'CRM integration', 'ربط بنظام CRM', { price: manual() }),
        option('api', 'חיבור בין מערכות באמצעות API', 'API system integration', 'ربط الأنظمة عبر API', { price: manual() }),
      ],
    },
    {
      id: 'video', label: label('עריכת וידאו ווידאו AI', 'Video editing & AI video', 'مونتاج فيديو وفيديو AI'), options: [
        option('reel_edit', 'עריכת רילס מחומרים מוכנים', 'Reel editing from supplied footage', 'مونتاج ريلز من مواد جاهزة'),
        option('ad_edit', 'עריכת סרטון פרסומי', 'Promotional video editing', 'مونتاج فيديو إعلاني', { price: manual() }),
        option('ai_video', 'הפקת וידאו בעזרת AI', 'AI video production', 'إنتاج فيديو بمساعدة AI', { price: manual() }),
      ],
    },
    {
      id: 'motion', label: label('מושן ותלת־ממד', 'Motion & 3D', 'موشن وثلاثي الأبعاد'), options: [
        option('motion_graphics', 'גרפיקת מושן', 'Motion graphics', 'رسوم متحركة', { price: manual() }),
        option('web_3d', 'חוויה תלת־ממדית לאתר', 'Interactive 3D for a website', 'تجربة تفاعلية ثلاثية الأبعاد للموقع', { price: manual() }),
      ],
    },
    {
      id: 'performance', label: label('מהירות וביצועים', 'Speed & performance', 'السرعة والأداء'), options: [
        option('speed_audit', 'בדיקת ביצועים לאתר קיים', 'Existing-site performance audit', 'فحص أداء موقع قائم'),
        option('speed_fix', 'שיפור מהירות לאתר קיים', 'Existing-site speed improvements', 'تحسين سرعة موقع قائم', { price: manual() }),
      ],
    },
    {
      id: 'seo', label: label('SEO טכני', 'Technical SEO', 'SEO تقني'), options: [
        option('seo_audit', 'בדיקת SEO טכני לאתר קיים', 'Existing-site technical SEO audit', 'فحص SEO تقني لموقع قائم'),
        option('seo_implementation', 'יישום תיקוני SEO טכניים', 'Technical SEO implementation', 'تنفيذ تحسينات SEO التقنية', { price: manual() }),
        option('local_seo', 'תשתית SEO מקומי', 'Local SEO setup', 'تهيئة SEO محلي', { price: manual() }),
      ],
    },
    {
      id: 'support', label: label('תחזוקה ומעבר אתר', 'Maintenance & migration', 'صيانة ونقل المواقع'), options: [
        option('maintenance', 'תחזוקה שוטפת', 'Ongoing maintenance', 'صيانة مستمرة', { price: manual() }),
        option('migration', 'מעבר אתר או פלטפורמה', 'Site or platform migration', 'نقل موقع أو منصة', { price: manual() }),
        option('repair', 'תיקון תקלה באתר קיים', 'Repair an existing site', 'إصلاح مشكلة بموقع قائم', { price: manual() }),
      ],
    },
    {
      id: 'accessibility', label: label('יישום נגישות', 'Accessibility implementation', 'تنفيذ تحسينات الوصول'), options: [
        option('accessibility_audit', 'בדיקת שימוש ונגישות', 'Usability and accessibility audit', 'فحص الاستخدام وإمكانية الوصول'),
        option('accessibility_fix', 'תיקוני נגישות בממשק', 'Interface accessibility fixes', 'إصلاحات الوصول في الواجهة', { price: manual() }),
      ],
    },
  ],
};

export const allOptions = (catalogue: QuoteCatalogue): QuoteOption[] => catalogue.categories.flatMap((category) => category.options);

export function canSelectOption(catalogue: QuoteCatalogue, selectedIds: string[], optionId: string): boolean {
  const candidate = allOptions(catalogue).find((item) => item.id === optionId);
  return !!candidate && (!candidate.requiresAny || candidate.requiresAny.some((id) => selectedIds.includes(id)));
}

/** Remove competing packages and any add-on whose prerequisite was removed. */
export function toggleOption(catalogue: QuoteCatalogue, selectedIds: string[], optionId: string): string[] {
  const options = allOptions(catalogue);
  const candidate = options.find((item) => item.id === optionId);
  if (!candidate) return selectedIds;
  const next = selectedIds.includes(optionId)
    ? selectedIds.filter((id) => id !== optionId)
    : canSelectOption(catalogue, selectedIds, optionId)
      ? [...selectedIds.filter((id) => !candidate.exclusiveGroup || options.find((item) => item.id === id)?.exclusiveGroup !== candidate.exclusiveGroup), optionId]
      : selectedIds;
  return next.filter((id) => canSelectOption(catalogue, next, id));
}

export type QuoteEstimate =
  | { mode: 'manual_quote' }
  | { mode: 'fixed_package'; amountIls: number }
  | { mode: 'estimate_range'; minIls: number; maxIls: number };

export type QuoteBreakdown = {
  /** Amounts are null while the public price catalogue is unpublished. */
  pricedItems: Array<{ id: string; quantity: number; minIls: number; maxIls: number }>;
  unpricedIds: string[];
  knownSubtotal: { minIls: number; maxIls: number } | null;
  /** A whole-project number is available only when every selected item is priced. */
  total: QuoteEstimate;
};

export function quoteBreakdown(catalogue: QuoteCatalogue, selectedIds: string[], scope: QuoteScope = {}): QuoteBreakdown {
  const uniqueIds = [...new Set(selectedIds)];
  const options = allOptions(catalogue);
  const selected = uniqueIds.map((id) => options.find((item) => item.id === id));
  const components = scopeRows(catalogue, uniqueIds, scope).filter((row) => row.price !== null);
  const groups = selected.map((item) => item?.exclusiveGroup).filter((group): group is string => !!group);
  const validSelection = uniqueIds.length > 0 && selected.every((item) =>
    !!item && canSelectOption(catalogue, uniqueIds, item.id)) && new Set(groups).size === groups.length;
  if (!validSelection || !catalogue.publishedPrices) {
    return { pricedItems: [], unpricedIds: [...uniqueIds, ...components.map((row) => row.id)], knownSubtotal: null, total: { mode: 'manual_quote' } };
  }

  const pricedItems: QuoteBreakdown['pricedItems'] = [];
  const unpricedIds: string[] = [];
  let minIls = 0;
  let maxIls = 0;
  const chargeLines = [
    ...selected.filter((item): item is QuoteOption => !!item).map((item) => ({ id: item.id, price: item.price, quantity: 1 })),
    ...components.map((row) => ({ id: row.id, price: row.price, quantity: row.quantity })),
  ];
  for (const line of chargeLines) {
    const price = line.price;
    if (!price || !Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      unpricedIds.push(line.id);
      continue;
    }
    if (price.mode === 'fixed_package') {
      if (!Number.isFinite(price.amountIls) || price.amountIls <= 0) {
        unpricedIds.push(line.id);
        continue;
      }
      const amount = price.amountIls * line.quantity;
      pricedItems.push({ id: line.id, quantity: line.quantity, minIls: amount, maxIls: amount });
      minIls += amount;
      maxIls += amount;
    } else if (price.mode === 'estimate_range') {
      if (!Number.isFinite(price.minIls) || !Number.isFinite(price.maxIls) || price.minIls <= 0 || price.maxIls < price.minIls) {
        unpricedIds.push(line.id);
        continue;
      }
      const min = price.minIls * line.quantity;
      const max = price.maxIls * line.quantity;
      pricedItems.push({ id: line.id, quantity: line.quantity, minIls: min, maxIls: max });
      minIls += min;
      maxIls += max;
    } else {
      unpricedIds.push(line.id);
    }
  }
  const knownSubtotal = pricedItems.length && Number.isFinite(minIls) && Number.isFinite(maxIls)
    ? { minIls, maxIls } : null;
  const total: QuoteEstimate = !knownSubtotal || unpricedIds.length
    ? { mode: 'manual_quote' }
    : minIls === maxIls ? { mode: 'fixed_package', amountIls: minIls }
      : { mode: 'estimate_range', minIls, maxIls };
  return { pricedItems, unpricedIds, knownSubtotal, total };
}

export function quoteEstimate(catalogue: QuoteCatalogue, selectedIds: string[], scope: QuoteScope = {}): QuoteEstimate {
  return quoteBreakdown(catalogue, selectedIds, scope).total;
}

export function formatQuoteAmount(language: Language, minIls: number, maxIls: number): string {
  const locale = language === 'he' ? 'he-IL' : language === 'ar' ? 'ar-IL' : 'en-IL';
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 });
  return minIls === maxIls ? formatter.format(minIls) : formatter.format(minIls) + '–' + formatter.format(maxIls);
}
