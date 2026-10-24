import type { Language } from '@/types';
import { allOptions, type QuoteCatalogue } from './catalogue';

export type RequestDetails = {
  language: Language;
  categoryIds: string[];
  optionIds: string[];
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
    finish: 'أرجو تقديم عرض حسب نطاق العمل. لم يتم الاتفاق على سعر بعد.',
  },
} as const;

export function buildRequestMessage(catalogue: QuoteCatalogue, details: RequestDetails): string {
  const t = lines[details.language];
  const selected = new Set(details.optionIds);
  const uncertain = new Set(details.unsureCategoryIds);
  const options = allOptions(catalogue);
  const serviceLines = catalogue.categories
    .filter((category) => details.categoryIds.includes(category.id))
    .flatMap((category) => {
      const picked = category.options.filter((item) => selected.has(item.id));
      return [
        ...picked.map((item) => '- ' + category.label[details.language] + ': ' + item.label[details.language]),
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
    '',
    t.stage + ': ' + t.stages[details.projectStage],
    ...(business ? [t.business + ': ' + business] : []),
    ...(notes ? [t.notes + ': ' + notes] : []),
    '',
    t.finish,
  ].join('\n');
}
