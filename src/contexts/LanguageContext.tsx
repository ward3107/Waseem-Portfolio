import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types';
import { translations } from '@/translations';
import { safeGetItem, safeSetItem } from '@/lib/safeStorage';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, updateLanguage] = useState<Language>(() => {
    try {
      const urlLang = new URLSearchParams(window.location.search).get('lang');
      if (urlLang === 'en' || urlLang === 'he' || urlLang === 'ar') {
        return urlLang as Language;
      }
      if (window.location.pathname.startsWith('/en/')) return 'en';
      if (window.location.pathname.startsWith('/ar/')) return 'ar';
      if (window.location.pathname === '/') return 'he';
    } catch {
      // window/URLSearchParams unavailable — fall through to the other sources.
    }
    const saved = safeGetItem('vibe_lang') as Language | null;
    if (saved && (saved === 'en' || saved === 'he' || saved === 'ar')) {
      return saved;
    }
    const browserLang = navigator.language.split('-')[0];
    return (browserLang === 'he' || browserLang === 'ar') ? (browserLang as Language) : 'he';
  });

  const setLanguage = (lang: Language) => {
    updateLanguage(lang);
    if (/^\/(?:en\/|ar\/)?$/.test(window.location.pathname)) {
      window.history.pushState(null, '', (lang === 'he' ? '/' : `/${lang}/`) + window.location.hash);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const dir = language === 'en' ? 'ltr' : 'rtl';

  useEffect(() => {
    safeSetItem('vibe_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    if (/^\/(?:en\/|ar\/)?$/.test(window.location.pathname)) {
      const url = `https://www.vasia.dev${language === 'he' ? '/' : `/${language}/`}`;
      const description = {
        he: 'ואסים בונה אתרי Wix ו-WordPress, חנויות ואפליקציות מותאמות לעסקים. פתרונות AI ואוטומציה, עם תמיכה בעברית, בערבית ובאנגלית.',
        en: 'Waseem builds Wix and WordPress sites, online stores and custom web apps for businesses. AI automation and support in English, Hebrew and Arabic.',
        ar: 'يبني وسيم مواقع Wix وWordPress ومتاجر وتطبيقات ويب مخصصة للأعمال، مع حلول الذكاء الاصطناعي والأتمتة وخدمة بالعربية والعبرية والإنجليزية.',
      }[language];
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
      document.querySelector('meta[name="twitter:url"]')?.setAttribute('content', url);
    }
  }, [language, dir]);

  const t = (key: string) => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
