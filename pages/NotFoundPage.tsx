import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const NotFoundPage: React.FC = () => {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = '404 — Page not found';
  }, []);

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <p className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan mb-4">
          404
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
          {t('nf_title') || 'Page not found'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          {t('nf_body') || "The page you're looking for doesn't exist or has been moved."}
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-lg bg-brand-purple text-white font-bold shadow-lg hover:bg-brand-purpleDark transition-colors"
        >
          {t('nf_cta') || 'Back to home'}
        </Link>
      </div>
    </section>
  );
};

export default NotFoundPage;
