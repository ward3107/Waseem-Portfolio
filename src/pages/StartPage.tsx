import React, { useEffect, useMemo } from 'react';
import { CONTACT } from '@/constants';

type StartLanguage = 'en' | 'he' | 'ar';

const COPY: Record<StartLanguage, { message: string; loading: string; button: string }> = {
  en: {
    message: 'Hi Waseem, I found Vasia through your content and would like to discuss a project.',
    loading: 'Opening WhatsApp…',
    button: 'Continue to WhatsApp',
  },
  he: {
    message: 'היי וסימ, הגעתי ל־Vasia דרך התוכן שלך ואני רוצה לדבר על פרויקט.',
    loading: 'פותחים את WhatsApp…',
    button: 'המשך ל־WhatsApp',
  },
  ar: {
    message: 'مرحباً وسيم، وصلت إلى Vasia من خلال المحتوى وأرغب في مناقشة مشروع.',
    loading: 'جارٍ فتح واتساب…',
    button: 'المتابعة إلى واتساب',
  },
};

function resolveLanguage(): StartLanguage {
  const requested = new URLSearchParams(window.location.search).get('lang');
  if (requested === 'he' || requested === 'ar' || requested === 'en') return requested;

  const browserLanguage = navigator.language.toLowerCase();
  if (browserLanguage.startsWith('he')) return 'he';
  if (browserLanguage.startsWith('ar')) return 'ar';
  return 'en';
}

/** A short, stable entry point used by every social asset. */
const StartPage: React.FC = () => {
  const language = useMemo(resolveLanguage, []);
  const copy = COPY[language];
  const whatsappUrl = `${CONTACT.whatsappUrl}?text=${encodeURIComponent(copy.message)}`;
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';

  useEffect(() => {
    if (!isPreview) window.location.replace(whatsappUrl);
  }, [isPreview, whatsappUrl]);

  return (
    <main
      lang={language}
      dir={language === 'en' ? 'ltr' : 'rtl'}
      className="min-h-screen bg-[#060812] text-white grid place-items-center px-6 text-center"
    >
      <div>
        <p className="text-xl font-semibold mb-6">{copy.loading}</p>
        <a
          href={whatsappUrl}
          className="inline-flex rounded-full bg-[#25D366] px-6 py-3 font-bold text-[#07110b]"
        >
          {copy.button}
        </a>
      </div>
    </main>
  );
};

export default StartPage;
