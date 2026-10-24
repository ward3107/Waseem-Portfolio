import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContact } from '@/features/contact/useContact';
import {
  allOptions, canSelectOption, quoteCatalogue, quoteEstimate, toggleOption,
  type QuoteCategory,
} from './catalogue';
import { buildRequestMessage } from './request';

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

export default function QuoteCalculator() {
  const { language, dir } = useLanguage();
  const contact = useContact();
  const t = copy[language];
  const [stage, setStage] = useState<Stage>('categories');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [optionIds, setOptionIds] = useState<string[]>([]);
  const [unsureCategoryIds, setUnsureCategoryIds] = useState<string[]>([]);
  const [unsureOverall, setUnsureOverall] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [projectStage, setProjectStage] = useState<'new' | 'existing' | 'unsure'>('unsure');
  const [businessName, setBusinessName] = useState('');
  const [notes, setNotes] = useState('');
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const selectedCategories = quoteCatalogue.categories.filter((category) => categoryIds.includes(category.id));
  const currentCategory = selectedCategories[activeCategoryIndex];
  const estimate = quoteEstimate(quoteCatalogue, optionIds);
  const formatter = new Intl.NumberFormat(language === 'he' ? 'he-IL' : language === 'ar' ? 'ar-IL' : 'en-IL', {
    style: 'currency', currency: 'ILS', maximumFractionDigits: 0,
  });
  const estimateLabel = estimate.mode === 'fixed_package' ? formatter.format(estimate.amountIls)
    : estimate.mode === 'estimate_range' ? formatter.format(estimate.minIls) + '–' + formatter.format(estimate.maxIls)
      : t.quoteStatus;

  const message = buildRequestMessage(quoteCatalogue, {
    language, categoryIds, optionIds, unsureCategoryIds, unsureOverall, projectStage, businessName, notes,
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
    setOptionIds((previous) => {
      const allowed = allOptions(quoteCatalogue)
        .filter((item) => next.some((categoryId) => quoteCatalogue.categories.find((category) => category.id === categoryId)?.options.includes(item)))
        .map((item) => item.id);
      const remaining = previous.filter((item) => allowed.includes(item));
      return remaining.filter((item) => canSelectOption(quoteCatalogue, remaining, item));
    });
  };

  const chooseOption = (id: string, category: QuoteCategory) => {
    setOptionIds((previous) => toggleOption(quoteCatalogue, previous, id));
    setUnsureCategoryIds((previous) => previous.filter((item) => item !== category.id));
  };

  const toggleUnsureCategory = (category: QuoteCategory) => {
    const wasUnsure = unsureCategoryIds.includes(category.id);
    setUnsureCategoryIds((previous) => wasUnsure ? previous.filter((item) => item !== category.id) : [...previous, category.id]);
    if (!wasUnsure) setOptionIds((previous) => previous.filter((id) => !category.options.some((item) => item.id === id)));
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
        const category = quoteCatalogue.categories.find((item) => item.id === id);
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
              {quoteCatalogue.categories.map((category) => {
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
                const available = checked || canSelectOption(quoteCatalogue, optionIds, item.id);
                return (
                  <label key={item.id} className={'flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 ' + (available ? 'cursor-pointer bg-white' : 'cursor-not-allowed bg-[#f0f2f7] text-[#667088]') + (checked ? ' border-[#675abb] ring-1 ring-[#675abb]' : ' border-[#dfe4ef]')}>
                    <input type="checkbox" checked={checked} disabled={!available} onChange={() => chooseOption(item.id, currentCategory)} className="h-5 w-5 shrink-0 accent-[#5448a9]" />
                    <span className="flex-1 font-medium">{item.label[language]}{!available && <span className="mt-1 block text-xs font-normal">{t.prerequisite}</span>}</span>
                  </label>
                );
              })}
            </div>
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
                    {category.options.filter((item) => optionIds.includes(item.id)).map((item) => <li key={item.id}>{item.label[language]}</li>)}
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
