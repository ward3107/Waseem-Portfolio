import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import QuoteCalculator from '@/features/quote/QuoteCalculator';

const copy = {
  he: { back: 'חזרה לאתר', title: 'תכנון פרויקט | vasia.dev' },
  en: { back: 'Back to the site', title: 'Plan a project | vasia.dev' },
  ar: { back: 'العودة للموقع', title: 'تخطيط مشروع | vasia.dev' },
} as const;

export default function PlanPage() {
  const { language, dir, setLanguage } = useLanguage();
  const t = copy[language];

  useEffect(() => {
    document.title = t.title;
  }, [t.title]);

  return (
    <main id="main-content" dir={dir} className="min-h-screen bg-[#f0f2f8] px-4 pb-20 pt-6 text-[#18203a] sm:px-6 sm:pt-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="text-xl font-black tracking-tight text-[#342880] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5448a9]">
              vasia<span className="text-[#00a9c4]">.</span>dev
            </Link>
            <Link to="/" className="rounded-full border border-[#cfd6e5] bg-white px-4 py-2 text-sm font-semibold hover:border-[#5448a9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5448a9]">
              {t.back}
            </Link>
          </div>
          <div role="group" aria-label={language === 'he' ? 'שפה' : language === 'ar' ? 'اللغة' : 'Language'} className="mt-4 flex w-fit gap-1 rounded-full border border-[#d7ddea] bg-white p-1">
            {([
              ['he', 'עברית'], ['en', 'English'], ['ar', 'العربية'],
            ] as const).map(([code, name]) => (
              <button key={code} type="button" dir={code === 'en' ? 'ltr' : 'rtl'} aria-pressed={language === code} onClick={() => setLanguage(code)}
                className={'min-h-11 rounded-full px-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5448a9] ' + (language === code ? 'bg-[#5448a9] text-white' : 'text-[#525d76] hover:bg-[#f0f2f8]')}>
                {name}
              </button>
            ))}
          </div>
        </header>
        <QuoteCalculator />
      </div>
    </main>
  );
}
