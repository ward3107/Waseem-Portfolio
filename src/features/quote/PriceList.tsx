import { useLanguage } from '@/contexts/LanguageContext';
import { formatPriceRule, type QuoteCatalogue } from './catalogue';
import { scopeCopy, type ScopePriceKey } from './scope';

const copy = {
  he: { title: 'מחירון השירותים והתוספות', service: 'שירות', price: 'מחיר', extras: 'תוספות לפי היקף',
    note: 'המחירים בש״ח. מחיר קבוע הוא להיקף הבסיס; טווח הוא הערכה לפי המורכבות. תוספות נבחרות מחושבות בנפרד. דומיין, אחסון, רישיונות, מנויים ושימוש בשירותי AI אינם כלולים. תחזוקה היא חבילה לחודש אחד, ללא חידוש אוטומטי.',
    base: 'עמוד אחד, שפה אחת', date: 'עודכן: 24.10.2026' },
  en: { title: 'Service and add-on price list', service: 'Service', price: 'Price', extras: 'Scope add-ons',
    note: 'Prices are in ILS. Fixed prices cover the base scope; ranges are estimates based on complexity. Selected add-ons are charged separately. Domain, hosting, licenses, subscriptions and AI usage are excluded. Maintenance covers one month without automatic renewal.',
    base: 'One page, one language', date: 'Updated: 24 Oct 2026' },
  ar: { title: 'قائمة أسعار الخدمات والإضافات', service: 'الخدمة', price: 'السعر', extras: 'إضافات حسب النطاق',
    note: 'الأسعار بالشيكل. السعر الثابت للنطاق الأساسي، والنطاق السعري تقديري حسب التعقيد. تُحسب الإضافات المختارة منفصلة. النطاق والاستضافة والتراخيص والاشتراكات واستخدام AI غير مشمولة. الصيانة لشهر واحد دون تجديد تلقائي.',
    base: 'صفحة واحدة ولغة واحدة', date: 'تحديث: 24.10.2026' },
};
export default function PriceList({ catalogue }: { catalogue: QuoteCatalogue }) {
  const { language } = useLanguage();
  const t = copy[language];
  const extraNames = { ...scopeCopy.extras, enhanced_design: scopeCopy.design.enhanced, custom_design: scopeCopy.design.custom, ...scopeCopy.features };
  return <details className="mt-5 rounded-xl border border-slate-500 bg-slate-950 text-white">
    <summary className="min-h-12 cursor-pointer px-4 py-3 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200">{t.title}</summary>
    <div className="max-h-[60dvh] overflow-y-auto overscroll-contain px-4 pb-4" data-lenis-prevent="" data-native-scroll="" tabIndex={0} aria-label={t.title}>
      <p className="mb-3 text-sm leading-6 text-slate-200">{t.note}</p>
      <table className="w-full table-fixed text-start text-sm [overflow-wrap:anywhere]">
        <caption className="mb-2 text-start text-slate-300">{t.date}</caption>
        <thead><tr className="border-b border-slate-500"><th scope="col" className="w-[60%] py-3 text-start">{t.service}</th><th scope="col" className="py-3 text-end">{t.price}</th></tr></thead>
        {catalogue.categories.map((category) => <tbody key={category.id}>
          <tr><th colSpan={2} scope="rowgroup" className="pt-5 pb-2 text-start text-base text-cyan-200">{category.label[language]}</th></tr>
          {category.options.map((option) => <tr key={option.id} className="border-b border-slate-700">
            <th scope="row" className="py-3 pe-2 text-start font-normal">{option.label[language]}{['landing', 'business_site'].includes(option.id) && <small className="block text-slate-300">{t.base}</small>}</th>
            <td className="py-3 text-end font-semibold text-cyan-200"><bdi>{formatPriceRule(language, option.price)}</bdi></td>
          </tr>)}
        </tbody>)}
        {catalogue.scope && <tbody>
          <tr><th colSpan={2} scope="rowgroup" className="pt-5 pb-2 text-start text-base text-cyan-200">{t.extras}</th></tr>
          {(Object.entries(catalogue.scope.prices) as Array<[ScopePriceKey, typeof catalogue.scope.prices[ScopePriceKey]]>).map(([key, price]) =>
            <tr key={key} className="border-b border-slate-700">
              <th scope="row" className="py-3 pe-2 text-start font-normal">{extraNames[key][language]}</th>
              <td className="py-3 text-end font-semibold text-cyan-200"><bdi>{formatPriceRule(language, price)}</bdi></td>
            </tr>)}
        </tbody>}
      </table>
    </div>
  </details>;
}
