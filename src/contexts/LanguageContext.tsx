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
  const [language, setLanguage] = useState<Language>(() => {
    // Highest priority: an explicit ?lang= query param. The hreflang alternates
    // in index.html and sitemap.xml advertise ?lang=he / ?lang=ar, so a visitor
    // arriving from a localized search result must actually land in that
    // language (previously this param was ignored entirely).
    try {
      const urlLang = new URLSearchParams(window.location.search).get('lang');
      if (urlLang === 'en' || urlLang === 'he' || urlLang === 'ar') {
        return urlLang as Language;
      }
    } catch {
      // window/URLSearchParams unavailable — fall through to the other sources.
    }
    const saved = safeGetItem('vibe_lang') as Language | null;
    if (saved && (saved === 'en' || saved === 'he' || saved === 'ar')) {
      return saved;
    }
    const browserLang = navigator.language.split('-')[0];
    return (browserLang === 'he' || browserLang === 'ar') ? (browserLang as Language) : 'en';
  });

  const dir = language === 'en' ? 'ltr' : 'rtl';

  useEffect(() => {
    safeSetItem('vibe_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
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
