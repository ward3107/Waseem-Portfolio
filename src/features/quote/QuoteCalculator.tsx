import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContact } from '@/features/contact/useContact';
import {
  allOptions, canSelectOption, formatQuoteAmount, quoteBreakdown, quoteCatalogue, toggleOption,
  type QuoteCategory, type QuoteCatalogue,
} from './catalogue';
import { buildRequestMessage } from './request';
import ScopeEditor from './ScopeEditor';
import { scopeRows, type QuoteScope, type ScopeValues } from './scope';

const copy = {
  he: {
    heading: 'מתכננים פרויקט? מתחילים כאן',
    intro: 'בחרו מה צריך. נסכם את הבקשה לשיחת וואטסאפ ונכין הצעה לפי היקף העבודה.',
    steps: ['תחומים', 'שירותים', 'סיכום'],
    categoryTitle: 'באילו תחומים אתם צריכים עזרה?',
    categoryHint: 'אפשר לבחור כמה תחומים. את השירותים המדויקים נבחר בשלב הבא.',
    selected: 'נבחרו',
    categoryCount: 'תחומים',
    unsureOverall: 'אני לא בטוח/ה מה אני צריך/ה',
    optionTitle: 'מה תרצו בתחום הזה?',
    optionProgress: 'תחום',
    optionHint: 'בחרו שירות אחד או יותר. אם עדיין לא ברור, אפשר לבקש עזרה.',
    unsureCategory: 'לא בטוח/ה — עזרו לי לבחור',
    prerequisite: 'יש לבחור קודם אתר, חנות או אפליקציה מתאימים',
    reviewTitle: 'הבקשה שלכם',
    reviewHint: 'בדקו את הבחירות והוסיפו כמה מילים על הפרויקט.',
    quoteStatus: 'בקשת הצעת מחיר',
    itemQuote: 'לפי הצעת מחיר',
    estimatedTotal: 'סה״כ משוער',
    partialSubtotal: 'סכום ביניים לפריטים מתומחרים בלבד',
    quoteNote: 'המחיר הסופי תלוי בהיקף העבודה ובעלויות חיצוניות נדרשות, אם יהיו. נבדוק יחד לפני התחייבות.',
    business: 'שם העסק (לא חובה)',
    businessPlaceholder: 'איך קוראים לעסק?',
    stage: 'מה מצב הפרויקט?',
    new: 'פרויקט חדש',
    existing: 'כבר יש אתר או מוצר',
    stageUnsure: 'עדיין לא בטוח/ה',
    notes: 'מה עוד חשוב לדעת? (לא חובה)',
    notesPlaceholder: 'מטרה, קישור לאתר קיים או פרטים שכדאי לדעת',
    next: 'המשך',
    back: 'חזרה',
    whatsapp: 'פתחו סיכום בוואטסאפ',
    handoff: 'ההודעה תיפתח מוכנה בוואטסאפ. אתם בוחרים אם לשלוח אותה.',
    edit: 'עריכת בחירות',
  },
  en: {
    heading: 'Plan your project',
    intro: 'Choose what you need. We will prepare a WhatsApp summary and quote after reviewing the scope.',
    steps: ['Areas', 'Services', 'Review'],
    categoryTitle: 'Which areas do you need help with?',
    categoryHint: 'Choose more than one. You can select specific services next.',
    selected: 'Selected',
    categoryCount: 'areas',
    unsureOverall: 'I am not sure what I need',
    optionTitle: 'What do you need in this area?',
    optionProgress: 'Area',
    optionHint: 'Choose one or more services, or ask for guidance.',
    unsureCategory: 'Not sure — help me choose',
    prerequisite: 'Choose a matching site, store, or app first',
    reviewTitle: 'Your request',
    reviewHint: 'Review your choices and add a few details.',
    quoteStatus: 'Request a quote',
    itemQuote: 'Request a quote',
    estimatedTotal: 'Estimated total',
    partialSubtotal: 'Priced items subtotal only',
    quoteNote: 'Final pricing depends on the work and any required external costs. We will review those before you commit.',
    business: 'Business name (optional)',
    businessPlaceholder: 'Your business name',
    stage: 'What stage is the project at?',
    new: 'New project',
    existing: 'Existing site or product',
    stageUnsure: 'Not sure yet',
    notes: 'Anything else we should know? (optional)',
    notesPlaceholder: 'Goal, existing site URL, or useful details',
    next: 'Continue',
    back: 'Back',
    whatsapp: 'Open summary in WhatsApp',
    handoff: 'WhatsApp opens a prepared message. You decide whether to send it.',
    edit: 'Edit choices',
  },
  ar: {
    heading: 'خطّط لمشروعك',
    intro: 'اختر ما تحتاجه. نجهز ملخصاً لواتساب وعرضاً بعد مراجعة نطاق العمل.',
    steps: ['المجالات', 'الخدمات', 'المراجعة'],
    categoryTitle: 'في أي مجالات تحتاج المساعدة؟',
    categoryHint: 'يمكنك اختيار أكثر من مجال، ثم تحديد الخدمات.',
    selected: 'تم اختيار',
    categoryCount: 'مجالات',
    unsureOverall: 'لست متأكداً مما أحتاجه',
    optionTitle: 'ماذا تحتاج في هذا المجال؟',
    optionProgress: 'المجال',
    optionHint: 'اختر خدمة أو أكثر، أو اطلب المساعدة في الاختيار.',
    unsureCategory: 'لست متأكداً — ساعدني في الاختيار',
    prerequisite: 'اختر موقعاً أو متجراً أو تطبيقاً مناسباً أولاً',
    reviewTitle: 'ملخص طلبك',
    reviewHint: 'راجع اختياراتك وأضف بعض التفاصيل.',
    quoteStatus: 'طلب عرض سعر',
    itemQuote: 'بحاجة إلى عرض سعر',
    estimatedTotal: 'الإجمالي التقديري',
    partialSubtotal: 'مجموع العناصر المسعّرة فقط',
    quoteNote: 'السعر النهائي يعتمد على نطاق العمل وأي تكاليف خارجية مطلوبة. نراجعها معاً قبل الالتزام.',
    business: 'اسم النشاط التجاري (اختياري)',
    businessPlaceholder: 'اسم نشاطك التجاري',
    stage: 'ما حالة المشروع؟',
    new: 'مشروع جديد',
    existing: 'لدي موقع أو منتج قائم',
    stageUnsure: 'لست متأكداً بعد',
    notes: 'هل هناك تفاصيل إضافية؟ (اختياري)',
    notesPlaceholder: 'الهدف أو رابط الموقع الحالي أو معلومات مفيدة',
    next: 'متابعة',
    back: 'رجوع',
    whatsapp: 'افتح الملخص في واتساب',
    handoff: 'تُفتح رسالة جاهزة في واتساب. أنت تقرر إرسالها.',
    edit: 'تعديل الاختيارات',
  },
} as const;

type Stage = 'categories' | 'options' | 'review';

const inlineCopy = {
  he: {
    heading: 'הרכיבו את הפרויקט שלכם',
    intro: 'בחרו תחום, שירות והיקף. הסיכום מתעדכן בכל בחירה.',
    empty: 'בחרו שירות כדי להתחיל להרכיב את הבקשה.',
    category: 'תחום השירות',
    pending: 'רק רכיבים עם מחיר מאושר נכללים בסכום. יתר הבחירות ייבדקו להצעה אישית.',
    websiteTerms: 'לאתר: תוכן מהלקוח, שני סבבי תיקונים. אחסון, דומיין ורישיונות בתשלום אינם כלולים.',
    starter: 'דוגמה התחלתית: דף נחיתה עם עמוד ושפה אחת. אפשר לשנות או להסיר.',
  },
  en: {
    heading: 'Build your project',
    intro: 'Choose an area, service and scope. The summary updates with every selection.',
    empty: 'Choose a service area to start building your request.',
    category: 'Service area',
    pending: 'Only approved priced items count toward the subtotal. Other selections need a personal quote.',
    websiteTerms: 'Website: client-supplied content and two revision rounds. Hosting, domain and paid licenses are excluded.',
    starter: 'Starting example: a one-page, one-language landing page. Change or remove it anytime.',
  },
  ar: {
    heading: 'كوّن مشروعك',
    intro: 'اختر المجال والخدمة ونطاق العمل. يتحدث الملخص مع كل اختيار.',
    empty: 'اختر مجال خدمة للبدء في إعداد طلبك.',
    category: 'مجال الخدمة',
    pending: 'يشمل المجموع فقط العناصر ذات الأسعار المعتمدة. تتطلب الاختيارات الأخرى عرضًا شخصيًا.',
    websiteTerms: 'الموقع: المحتوى من العميل وجولتا تعديل. الاستضافة والنطاق والتراخيص المدفوعة غير مشمولة.',
    starter: 'مثال للبدء: صفحة هبوط بصفحة ولغة واحدة. يمكنك تعديلها أو إزالتها.',
  },
} as const;

export default function QuoteCalculator({ catalogue = quoteCatalogue, inline = false }: { catalogue?: QuoteCatalogue; inline?: boolean }) {
  const { language, dir } = useLanguage();
  const contact = useContact();
  const t = copy[language];
  const [stage, setStage] = useState<Stage>('categories');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const starterOption = inline && catalogue.publishedPrices
    ? catalogue.categories[0]?.options.find((item) => item.price.mode === 'fixed_package' && item.price.approved)?.id
    : undefined;
  const [optionIds, setOptionIds] = useState<string[]>(() => starterOption ? [starterOption] : []);
  const starterUntouched = useRef(!!starterOption);
  const [scope, setScope] = useState<QuoteScope>({});
  const [unsureCategoryIds, setUnsureCategoryIds] = useState<string[]>([]);
  const [unsureOverall, setUnsureOverall] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [inlineCategoryId, setInlineCategoryId] = useState(catalogue.categories[0]?.id ?? '');
  const [projectStage, setProjectStage] = useState<'new' | 'existing' | 'unsure'>('unsure');
  const [businessName, setBusinessName] = useState('');
  const [notes, setNotes] = useState('');
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const effectiveCategoryIds = inline
    ? catalogue.categories.filter((category) =>
        category.options.some((item) => optionIds.includes(item.id)) || unsureCategoryIds.includes(category.id)
      ).map((category) => category.id)
    : categoryIds;
  const selectedCategories = catalogue.categories.filter((category) => effectiveCategoryIds.includes(category.id));
  const inlineCategory = catalogue.categories.find((category) => category.id === inlineCategoryId);
  const currentCategory = selectedCategories[activeCategoryIndex];
  const breakdown = quoteBreakdown(catalogue, optionIds, scope);
  const detailRows = scopeRows(catalogue, optionIds, scope);
  const fullyScoped = !unsureOverall && !unsureCategoryIds.length;
  const estimateLabel = breakdown.knownSubtotal
    ? (breakdown.total.mode !== 'manual_quote' && fullyScoped ? t.estimatedTotal : t.partialSubtotal) + ': ' +
      formatQuoteAmount(language, breakdown.knownSubtotal.minIls, breakdown.knownSubtotal.maxIls)
    : t.quoteStatus;
  const optionAmount = (id: string) => {
    const item = breakdown.pricedItems.find((priced) => priced.id === id);
    return item ? formatQuoteAmount(language, item.minIls, item.maxIls) : t.itemQuote;
  };

  const message = buildRequestMessage(catalogue, {
    language, categoryIds: effectiveCategoryIds, optionIds, scope, unsureCategoryIds, unsureOverall, projectStage, businessName, notes,
  });

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    stageHeadingRef.current?.focus();
  }, [stage, activeCategoryIndex]);

  const toggleCategory = (id: string) => {
    const next = categoryIds.includes(id) ? categoryIds.filter((item) => item !== id) : [...categoryIds, id];
    setCategoryIds(next);
    setUnsureCategoryIds((previous) => previous.filter((item) => next.includes(item)));
    const allowed = allOptions(catalogue)
      .filter((item) => next.some((categoryId) => catalogue.categories.find((category) => category.id === categoryId)?.options.includes(item)))
      .map((item) => item.id);
    const remaining = optionIds.filter((item) => allowed.includes(item));
    const valid = remaining.filter((item) => canSelectOption(catalogue, remaining, item));
    setOptionIds(valid);
    setScope((previous) => Object.fromEntries(Object.entries(previous).filter(([item]) => valid.includes(item))));
  };

  const chooseOption = (id: string, category: QuoteCategory) => {
    starterUntouched.current = false;
    const next = toggleOption(catalogue, optionIds, id);
    setOptionIds(next);
    setScope((previous) => Object.fromEntries(Object.entries(previous).filter(([item]) => next.includes(item))));
    setUnsureCategoryIds((previous) => previous.filter((item) => item !== category.id));
  };

  const updateScope = (id: string, value: ScopeValues) => {
    starterUntouched.current = false;
    setScope((previous) => ({ ...previous, [id]: value }));
  };

  const toggleUnsureCategory = (category: QuoteCategory) => {
    starterUntouched.current = false;
    const wasUnsure = unsureCategoryIds.includes(category.id);
    setUnsureCategoryIds((previous) => wasUnsure ? previous.filter((item) => item !== category.id) : [...previous, category.id]);
    if (!wasUnsure) {
      const next = optionIds.filter((id) => !category.options.some((item) => item.id === id));
      setOptionIds(next);
      setScope((previous) => Object.fromEntries(Object.entries(previous).filter(([id]) => next.includes(id))));
    }
  };

  const continueFromCategories = () => {
    setActiveCategoryIndex(0);
    setStage(selectedCategories.length ? 'options' : 'review');
  };

  const continueFromOptions = () => {
    if (activeCategoryIndex < selectedCategories.length - 1) setActiveCategoryIndex(activeCategoryIndex + 1);
    else {
      // A later package can replace one chosen in an earlier area.
      setCategoryIds((previous) => previous.filter((id) => {
        const category = catalogue.categories.find((item) => item.id === id);
        return unsureCategoryIds.includes(id) || category?.options.some((item) => optionIds.includes(item.id));
      }));
      setStage('review');
    }
  };

  const goBack = () => {
    if (stage === 'review') {
      if (selectedCategories.length) {
        setActiveCategoryIndex(selectedCategories.length - 1);
        setStage('options');
      } else setStage('categories');
    } else if (stage === 'options' && activeCategoryIndex > 0) setActiveCategoryIndex(activeCategoryIndex - 1);
    else setStage('categories');
  };

  const currentComplete = currentCategory &&
    (currentCategory.options.some((item) => optionIds.includes(item.id)) || unsureCategoryIds.includes(currentCategory.id));

  if (inline) {
    const text = inlineCopy[language];
    const onInlineCategoryChange = (id: string) => {
      if (starterUntouched.current && starterOption && !catalogue.categories.find((category) => category.id === id)?.options.some((item) => item.id === starterOption)) {
        setOptionIds((previous) => previous.filter((item) => item !== starterOption));
        starterUntouched.current = false;
      }
      setInlineCategoryId(id);
    };
    const approvedOptionAmount = (item: QuoteCategory['options'][number]) => {
      if (!catalogue.publishedPrices || (item.price.mode !== 'fixed_package' && item.price.mode !== 'estimate_range')) return null;
      return item.price.mode === 'fixed_package'
        ? formatQuoteAmount(language, item.price.amountIls, item.price.amountIls)
        : formatQuoteAmount(language, item.price.minIls, item.price.maxIls);
    };
    return (
      <section dir={dir} aria-labelledby="inline-quote-heading" className="rounded-[1.75rem] border border-violet-400/25 bg-slate-900/95 p-5 text-white shadow-[0_28px_70px_-35px_rgba(0,0,0,.75)] sm:p-7 lg:p-8">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">{t.heading}</p>
          <h2 id="inline-quote-heading" className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{text.heading}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{text.intro}</p>
          {starterUntouched.current && starterOption && <p className="mt-2 text-xs text-cyan-200">{text.starter}</p>}
        </header>
        <div className="sticky top-16 z-20 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-400/30 bg-slate-800/95 px-4 py-2 text-sm text-white shadow-lg backdrop-blur lg:hidden" aria-live="polite">
          <span>{t.selected}: {optionIds.length}</span>
          <strong className="text-cyan-300">{breakdown.knownSubtotal ? estimateLabel : '—'}</strong>
        </div>
        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)]">
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 sm:p-5">
            <label className="block text-sm font-semibold text-slate-200">{text.category}
              <select value={inlineCategoryId} onChange={(event) => onInlineCategoryChange(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 text-base text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
                {catalogue.categories.map((category) => <option key={category.id} value={category.id}>{category.label[language]}</option>)}
              </select>
            </label>
            {inlineCategory && <fieldset className="mt-4">
              <legend className="text-base font-bold text-white">{inlineCategory.label[language]}</legend>
              <div className="mt-3 max-h-[55vh] space-y-3 overflow-y-auto pe-1 sm:max-h-[520px]">
                  {inlineCategory.options.map((item) => {
                    const checked = optionIds.includes(item.id);
                    const available = checked || canSelectOption(catalogue, optionIds, item.id);
                    return <div key={item.id}>
                      <label className={'flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-sm ' + (available ? 'cursor-pointer' : 'cursor-not-allowed text-slate-500') + (checked ? ' border-violet-400 bg-violet-500/20' : ' border-slate-700 bg-slate-800/70')}>
                        <input type="checkbox" checked={checked} disabled={!available} onChange={() => chooseOption(item.id, inlineCategory)} className="h-5 w-5 shrink-0 accent-violet-400" />
                        <span className="font-medium">{item.label[language]}{!available && <span className="mt-1 block text-xs font-normal">{t.prerequisite}</span>}</span>
                        {approvedOptionAmount(item) && <span className="ms-auto shrink-0 font-bold text-cyan-300">{approvedOptionAmount(item)}</span>}
                      </label>
                      {checked && catalogue.scope?.profiles[item.id] && <div className="mt-3">
                        <ScopeEditor language={language} profile={catalogue.scope.profiles[item.id]} value={scope[item.id] ?? {}} onChange={(value) => updateScope(item.id, value)} tone="dark" />
                      </div>}
                    </div>;
                  })}
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-700 px-3 py-2 text-sm">
                    <input type="checkbox" checked={unsureCategoryIds.includes(inlineCategory.id)} onChange={() => toggleUnsureCategory(inlineCategory)} className="h-5 w-5 accent-violet-400" />
                    {t.unsureCategory}
                  </label>
              </div>
            </fieldset>}
            <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-700 px-3 py-2 text-sm">
              <input type="checkbox" checked={unsureOverall} onChange={(event) => setUnsureOverall(event.target.checked)} className="h-5 w-5 accent-violet-400" />
              {t.unsureOverall}
            </label>
          </div>
          <aside aria-label={t.reviewTitle} className="rounded-2xl border border-violet-400/25 bg-slate-800/80 p-4 shadow-xl lg:sticky lg:top-24 sm:p-5">
            <h3 className="text-lg font-bold">{t.reviewTitle}</h3>
            <p className="mt-3 rounded-xl border border-cyan-300/20 bg-slate-950 px-4 py-3 text-xl font-black text-cyan-300" aria-live="polite">{breakdown.knownSubtotal ? estimateLabel : '—'}</p>
            {!optionIds.length && !unsureOverall && <p className="mt-3 text-sm text-slate-300">{text.empty}</p>}
            {!!breakdown.unpricedIds.length && <p className="mt-3 text-xs leading-5 text-slate-300">{text.pending}</p>}
            <ul className="mt-4 max-h-48 space-y-3 overflow-y-auto pe-1 text-sm" aria-live="polite">
              {selectedCategories.map((category) => (
                <li key={category.id} className="border-b border-slate-600 pb-3 last:border-0">
                  <strong className="block">{category.label[language]}</strong>
                  {category.options.filter((item) => optionIds.includes(item.id)).map((item) => (
                    <div key={item.id} className="mt-2 text-sm">
                      <div className="flex justify-between gap-2"><span>{item.label[language]}</span>{breakdown.pricedItems.some((priced) => priced.id === item.id) && <span className="shrink-0 font-semibold text-cyan-300">{optionAmount(item.id)}</span>}</div>
                      {detailRows.filter((row) => row.optionId === item.id).map((row) => (
                        <div key={row.id} className="mt-1 flex justify-between gap-2 ps-3 text-xs text-slate-300">
                          <span>{row.label[language]}{row.quantity > 1 ? ` × ${row.quantity}` : ''}</span>
                          {breakdown.pricedItems.some((priced) => priced.id === row.id) && <span className="text-cyan-300">{optionAmount(row.id)}</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                  {unsureCategoryIds.includes(category.id) && <p className="mt-2 text-sm">{t.unsureCategory}</p>}
                </li>
              ))}
            </ul>
            {optionIds.some((id) => id === 'landing' || id === 'business_site') && <p className="mt-3 text-xs leading-5 text-slate-300">{text.websiteTerms}</p>}
            <label className="mt-5 block text-sm font-semibold">{t.business}
              <input value={businessName} maxLength={120} onChange={(event) => setBusinessName(event.target.value)} placeholder={t.businessPlaceholder} className="mt-2 min-h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-base text-white placeholder:text-slate-400" />
            </label>
            <label className="mt-4 block text-sm font-semibold">{t.stage}
              <select value={projectStage} onChange={(event) => setProjectStage(event.target.value as 'new' | 'existing' | 'unsure')} className="mt-2 min-h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-base text-white">
                <option value="unsure">{t.stageUnsure}</option><option value="new">{t.new}</option><option value="existing">{t.existing}</option>
              </select>
            </label>
            <label className="mt-4 block text-sm font-semibold">{t.notes}
              <textarea value={notes} maxLength={700} rows={2} onChange={(event) => setNotes(event.target.value)} placeholder={t.notesPlaceholder} className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-base font-normal text-white placeholder:text-slate-400" />
            </label>
            {message && <a href={'https://wa.me/' + contact.whatsappNumber + '?text=' + encodeURIComponent(message)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#20bd75] px-5 text-center font-bold text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">{t.whatsapp}</a>}
            <p className="mt-2 text-xs text-slate-300">{t.handoff}</p>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section dir={dir} aria-labelledby="quote-heading" className="overflow-hidden rounded-[28px] border border-[#dde2f0] bg-[#f8f9fd] text-[#18203a] shadow-[0_24px_70px_-32px_rgba(20,28,77,.35)]">
      <div className="border-b border-[#e0e5f1] bg-white px-5 py-6 sm:px-9 sm:py-8">
        <h2 id="quote-heading" className="text-2xl font-bold leading-tight sm:text-3xl">{t.heading}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#59647c] sm:text-base">{t.intro}</p>
        <ol aria-label={language === 'he' ? 'שלבי הבקשה' : language === 'ar' ? 'خطوات الطلب' : 'Request steps'} className="mt-6 grid grid-cols-3 gap-2">
          {t.steps.map((stepLabel, index) => {
            const currentIndex = stage === 'categories' ? 0 : stage === 'options' ? 1 : 2;
            return <li key={stepLabel} aria-current={currentIndex === index ? 'step' : undefined} className={'rounded-full px-2 py-2 text-center text-xs font-semibold sm:text-sm ' + (currentIndex === index ? 'bg-[#5448a9] text-white' : index < currentIndex ? 'bg-[#e8e5fa] text-[#433791]' : 'bg-[#f0f2f8] text-[#657089]')}>{stepLabel}</li>;
          })}
        </ol>
      </div>

      <div className="px-5 py-6 sm:px-9 sm:py-8">
        {stage === 'categories' && (
          <>
            <h3 ref={stageHeadingRef} tabIndex={-1} className="text-xl font-bold outline-none sm:text-2xl">{t.categoryTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-[#59647c]">{t.categoryHint}</p>
            <div role="group" aria-label={t.categoryTitle} className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {catalogue.categories.map((category) => {
                const selected = categoryIds.includes(category.id);
                return (
                  <button key={category.id} type="button" aria-pressed={selected} onClick={() => toggleCategory(category.id)}
                    className={'flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-start font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5448a9] ' + (selected ? 'border-[#675abb] bg-[#eeecfb] text-[#342880]' : 'border-[#dfe4ef] bg-white text-[#26304a] hover:border-[#978bcc]')}>
                    <span>{category.label[language]}</span><span aria-hidden="true" className={'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm ' + (selected ? 'border-[#5448a9] bg-[#5448a9] text-white' : 'border-[#b8c1d3]')}>{selected ? '✓' : ''}</span>
                  </button>
                );
              })}
            </div>
            <label className="mt-5 flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-[#dfe4ef] bg-white px-4 py-3 text-sm font-medium">
              <input type="checkbox" checked={unsureOverall} onChange={(event) => setUnsureOverall(event.target.checked)} className="h-5 w-5 accent-[#5448a9]" />
              {t.unsureOverall}
            </label>
            <p className="mt-4 text-sm text-[#59647c]" aria-live="polite">{t.selected}: {selectedCategories.length} {t.categoryCount}</p>
            <button type="button" disabled={!selectedCategories.length && !unsureOverall} onClick={continueFromCategories}
              className="mt-6 min-h-12 w-full rounded-full bg-[#5448a9] px-6 font-bold text-white hover:bg-[#443890] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5448a9] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">{t.next}</button>
          </>
        )}

        {stage === 'options' && currentCategory && (
          <>
            <p className="text-sm font-semibold text-[#6257ae]">{t.optionProgress} {activeCategoryIndex + 1} / {selectedCategories.length}</p>
            <h3 ref={stageHeadingRef} tabIndex={-1} className="mt-2 text-xl font-bold outline-none sm:text-2xl">{currentCategory.label[language]}</h3>
            <p className="mt-1 text-sm leading-6 text-[#59647c]">{t.optionHint}</p>
            <div role="group" aria-label={t.optionTitle + ' ' + currentCategory.label[language]} className="mt-6 grid gap-2">
              {currentCategory.options.map((item) => {
                const checked = optionIds.includes(item.id);
                const available = checked || canSelectOption(catalogue, optionIds, item.id);
                return (
                  <div key={item.id}>
                    <label className={'flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 ' + (available ? 'cursor-pointer bg-white' : 'cursor-not-allowed bg-[#f0f2f7] text-[#667088]') + (checked ? ' border-[#675abb] ring-1 ring-[#675abb]' : ' border-[#dfe4ef]')}>
                      <input type="checkbox" checked={checked} disabled={!available} onChange={() => chooseOption(item.id, currentCategory)} className="h-5 w-5 shrink-0 accent-[#5448a9]" />
                      <span className="flex-1 font-medium">{item.label[language]}{!available && <span className="mt-1 block text-xs font-normal">{t.prerequisite}</span>}</span>
                    </label>
                    {checked && catalogue.scope?.profiles[item.id] && <div className="mt-3 px-1">
                      <ScopeEditor language={language} profile={catalogue.scope.profiles[item.id]} value={scope[item.id] ?? {}} onChange={(value) => updateScope(item.id, value)} />
                      <ul className="space-y-1 px-2 text-sm text-[#526078]" aria-live="polite">
                        {detailRows.filter((row) => row.optionId === item.id).map((row) => <li key={row.id} className="flex flex-wrap justify-between gap-2">
                          <span>{row.label[language]}{row.quantity > 1 ? ` ×${row.quantity}` : ''}</span>
                          {row.price && <span className="font-semibold">{optionAmount(row.id)}</span>}
                        </li>)}
                      </ul>
                    </div>}
                  </div>
                );
              })}
            </div>
            <p className="mt-5 rounded-2xl bg-[#eeecfb] p-4 font-bold text-[#342880]" aria-live="polite">{estimateLabel}</p>
            <label className="mt-5 flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-[#dfe4ef] bg-white px-4 py-3 text-sm font-medium">
              <input type="checkbox" checked={unsureCategoryIds.includes(currentCategory.id)} onChange={() => toggleUnsureCategory(currentCategory)} className="h-5 w-5 accent-[#5448a9]" />
              {t.unsureCategory}
            </label>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={goBack} className="min-h-12 rounded-full border border-[#c8cde0] bg-white px-6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5448a9]">{t.back}</button>
              <button type="button" disabled={!currentComplete} onClick={continueFromOptions} className="min-h-12 rounded-full bg-[#5448a9] px-7 font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5448a9] disabled:cursor-not-allowed disabled:opacity-40">{t.next}</button>
            </div>
          </>
        )}

        {stage === 'review' && (
          <>
            <h3 ref={stageHeadingRef} tabIndex={-1} className="text-xl font-bold outline-none sm:text-2xl">{t.reviewTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-[#59647c]">{t.reviewHint}</p>
            <div className="mt-6 rounded-2xl border border-[#dfe4ef] bg-white p-5" aria-live="polite">
              {selectedCategories.map((category) => (
                <div key={category.id} className="border-b border-[#edf0f6] py-3 first:pt-0 last:border-0 last:pb-0">
                  <h4 className="font-bold">{category.label[language]}</h4>
                  <ul className="mt-1 space-y-1 text-sm text-[#526078]">
                    {category.options.filter((item) => optionIds.includes(item.id)).map((item) => <li key={item.id}>
                      <div className="flex flex-wrap justify-between gap-2"><span>{item.label[language]}</span><span className="font-semibold">{optionAmount(item.id)}</span></div>
                      <ul className="mt-1 space-y-1 ps-3 text-xs">
                        {detailRows.filter((row) => row.optionId === item.id).map((row) => <li key={row.id} className="flex flex-wrap justify-between gap-2">
                          <span>{row.label[language]}{row.quantity > 1 ? ` ×${row.quantity}` : ''}</span>
                          {row.price && <span className="font-semibold">{optionAmount(row.id)}</span>}
                        </li>)}
                      </ul>
                    </li>)}
                    {unsureCategoryIds.includes(category.id) && <li>{t.unsureCategory}</li>}
                  </ul>
                </div>
              ))}
              {unsureOverall && <p className="text-sm text-[#526078]">{t.unsureOverall}</p>}
            </div>
            <button type="button" onClick={() => setStage('categories')} className="mt-3 text-sm font-semibold text-[#5448a9] underline-offset-4 hover:underline">{t.edit}</button>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold">{t.business}
                <input value={businessName} maxLength={120} onChange={(event) => setBusinessName(event.target.value)} placeholder={t.businessPlaceholder} className="mt-2 min-h-12 w-full rounded-xl border border-[#cfd6e5] bg-white px-4 text-base font-normal text-[#18203a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5448a9]" />
              </label>
              <label className="block text-sm font-semibold">{t.stage}
                <select value={projectStage} onChange={(event) => setProjectStage(event.target.value as 'new' | 'existing' | 'unsure')} className="mt-2 min-h-12 w-full rounded-xl border border-[#cfd6e5] bg-white px-4 text-base font-normal text-[#18203a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5448a9]">
                  <option value="unsure">{t.stageUnsure}</option><option value="new">{t.new}</option><option value="existing">{t.existing}</option>
                </select>
              </label>
            </div>
            <label className="mt-5 block text-sm font-semibold">{t.notes}
              <textarea value={notes} maxLength={700} rows={4} onChange={(event) => setNotes(event.target.value)} placeholder={t.notesPlaceholder} className="mt-2 w-full resize-y rounded-xl border border-[#cfd6e5] bg-white px-4 py-3 text-base font-normal text-[#18203a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5448a9]" />
            </label>
            <div className="mt-6 rounded-2xl bg-[#eeecfb] p-5">
              <p className="text-lg font-bold text-[#342880]">{estimateLabel}</p>
              {breakdown.knownSubtotal && (breakdown.total.mode === 'manual_quote' || !fullyScoped) &&
                <p className="mt-1 text-sm font-semibold text-[#4f5870]">{t.quoteStatus}</p>}
              <p className="mt-2 text-sm leading-6 text-[#4f5870]">{t.quoteNote}</p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={goBack} className="min-h-12 rounded-full border border-[#c8cde0] bg-white px-6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5448a9]">{t.back}</button>
              {message && <a href={'https://wa.me/' + contact.whatsappNumber + '?text=' + encodeURIComponent(message)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#176d49] px-7 text-center font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176d49]">{t.whatsapp}</a>}
            </div>
            <p className="mt-3 text-xs leading-5 text-[#59647c]">{t.handoff}</p>
          </>
        )}
      </div>
    </section>
  );
}
