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
      const metadata = {
        "he": {
          "title": "Vasia — בניית אתרים, אפליקציות ואוטומציות AI",
          "description": "Vasia בונה אתרי Wix ו-WordPress, חנויות ואפליקציות מותאמות לעסקים, עם פתרונות AI ואוטומציה. שירות בעברית, בערבית ובאנגלית.",
          "locale": "he_IL"
        },
        "en": {
          "title": "Vasia — Websites, Apps & AI Automation",
          "description": "Vasia builds Wix and WordPress websites, online stores and custom apps for businesses, with AI tools and automation. Service in English, Hebrew and Arabic.",
          "locale": "en_US"
        },
        "ar": {
          "title": "Vasia — تطوير مواقع وتطبيقات وأتمتة بالذكاء الاصطناعي",
          "description": "Vasia تطوّر مواقع Wix وWordPress ومتاجر وتطبيقات مخصصة للأعمال، مع حلول الذكاء الاصطناعي والأتمتة. خدمة بالعربية والعبرية والإنجليزية.",
          "locale": "ar_AR"
        }
      }[language];
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
      const values: Record<string, string> = {
        title: metadata.title,
        description: metadata.description,
        'og:title': metadata.title,
        'og:description': metadata.description,
        'og:url': url,
        'og:locale': metadata.locale,
        'og:site_name': 'Vasia',
        'twitter:title': metadata.title,
        'twitter:description': metadata.description,
        'twitter:url': url,
      };
      Object.entries(values).forEach(([key, value]) => {
        const attribute = key.startsWith('og:') ? 'property' : 'name';
        document.querySelector(`meta[${attribute}="${key}"]`)?.setAttribute('content', value);
      });
      document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(node => node.remove());
      ['he_IL', 'en_US', 'ar_AR'].filter(locale => locale !== metadata.locale).forEach(locale => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:locale:alternate');
        meta.content = locale;
        document.head.appendChild(meta);
      });
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
