import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContact } from '@/features/contact/useContact';
import { canPublishQuote, quoteCatalogue, quoteTotal } from './catalogue';

const copy = {
  he: {
    heading: 'בנו הערכת מחיר לפרויקט', service: 'מה תרצו לבנות?', addOns: 'מה להוסיף?',
    estimate: 'הערכת מחיר ראשונית', note: 'אירוח, רישיונות ושירותי API חיצוניים אינם כלולים. פרויקט מורכב יתומחר בהצעה אישית.',
    action: 'המשיכו לוואטסאפ', handoff: 'הבחירה תפתח הודעה מוכנה בוואטסאפ. אתם מחליטים אם לשלוח אותה.',
    message: 'שלום ואסים, אשמח להצעת מחיר על', extras: 'תוספות', total: 'הערכה',
  },
  en: {
    heading: 'Build a project estimate', service: 'What are you building?', addOns: 'Add to the project',
    estimate: 'Initial estimate', note: 'External hosting, licences and API services are separate. Complex projects need a tailored quote.',
    action: 'Continue to WhatsApp', handoff: 'Your choices open a prepared WhatsApp message. You decide whether to send it.',
    message: 'Hi Waseem, I would like a quote for', extras: 'Add-ons', total: 'Estimate',
  },
  ar: {
    heading: 'احسب تقديراً أولياً لمشروعك', service: 'ماذا تريد أن تبني؟', addOns: 'إضافات المشروع',
    estimate: 'تقدير أولي', note: 'الاستضافة والتراخيص وخدمات API الخارجية منفصلة. المشاريع المعقدة تحتاج إلى عرض مخصص.',
    action: 'المتابعة إلى واتساب', handoff: 'ستفتح اختياراتك رسالة جاهزة في واتساب، وأنت تقرر إرسالها.',
    message: 'مرحباً وسيم، أريد عرض سعر لـ', extras: 'إضافات', total: 'التقدير',
  },
} as const;

export default function QuoteCalculator() {
  const { language } = useLanguage();
  const contact = useContact();
  const t = copy[language];
  const [serviceId, setServiceId] = useState('');
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  if (!canPublishQuote(quoteCatalogue)) return null;

  const service = quoteCatalogue.services.find((item) => item.id === serviceId);
  const addOns = quoteCatalogue.addOns.filter((item) => addOnIds.includes(item.id));
  const total = quoteTotal(quoteCatalogue, serviceId, addOnIds);
  const formatted = total === null ? '' : new Intl.NumberFormat(language === 'he' ? 'he-IL' : language === 'ar' ? 'ar-IL' : 'en-IL', {
    style: 'currency', currency: 'ILS', maximumFractionDigits: 0,
  }).format(total);
  const message = service && total !== null ? [
    `${t.message} ${service.label[language]}.`,
    addOns.length ? `${t.extras}: ${addOns.map((item) => item.label[language]).join(', ')}.` : '',
    `${t.total}: ${formatted}.`,
  ].filter(Boolean).join('\n') : '';

  return (
    <section aria-labelledby="quote-heading" className="rounded-2xl border border-brand-purple/30 bg-slate-900 p-5 text-white shadow-xl sm:p-8">
      <h2 id="quote-heading" className="mb-6 text-2xl font-bold">{t.heading}</h2>
      <fieldset className="mb-6">
        <legend className="mb-3 font-semibold">{t.service}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {quoteCatalogue.services.map((item) => (
            <label key={item.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-white/20 p-3 focus-within:ring-2 focus-within:ring-brand-cyan">
              <input type="radio" name="quote-service" value={item.id} checked={serviceId === item.id} onChange={() => setServiceId(item.id)} />
              <span>{item.label[language]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="mb-6">
        <legend className="mb-3 font-semibold">{t.addOns}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {quoteCatalogue.addOns.map((item) => (
            <label key={item.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-white/20 p-3 focus-within:ring-2 focus-within:ring-brand-cyan">
              <input type="checkbox" checked={addOnIds.includes(item.id)} onChange={(event) => setAddOnIds(
                event.target.checked ? [...addOnIds, item.id] : addOnIds.filter((id) => id !== item.id)
              )} />
              <span>{item.label[language]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div aria-live="polite" className="mb-5 rounded-xl bg-white/10 p-4">
        <p className="text-sm text-white/75">{t.estimate}</p>
        <p className="text-3xl font-bold" dir="ltr">{formatted || '—'}</p>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-white/75">{t.note}</p>
      {service && total !== null && (
        <a href={`https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#25D366] px-6 font-bold text-slate-950 focus-visible:ring-2 focus-visible:ring-white">
          {t.action}
        </a>
      )}
      <p className="mt-3 text-xs text-white/65">{t.handoff}</p>
    </section>
  );
}
