import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Check } from 'lucide-react';
import { NAV_LINKS, LOGO_SRC } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { language, setLanguage, t, dir } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'he', label: 'עברית', flag: '🇮🇱' },
    { code: 'ar', label: 'العربية', flag: '🇵🇸' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-brand-gold/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
             <img src={LOGO_SRC} alt="Waseem Logo" className="h-10 w-auto object-contain" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 items-center">
            {NAV_LINKS[language].map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-600 hover:text-brand-purple transition-colors font-medium text-sm tracking-wide"
              >
                {link.name}
              </a>
            ))}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 text-slate-600 hover:text-brand-purple transition-colors p-2 rounded-lg hover:bg-slate-100"
              >
                <Globe size={20} />
                <span className="uppercase font-bold text-xs">{language}</span>
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-2 ${dir === 'rtl' ? 'left-0' : 'right-0'}`}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors text-sm"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-lg">{lang.flag}</span>
                          <span className="text-slate-700 font-medium">{lang.label}</span>
                        </span>
                        {language === lang.code && <Check size={14} className="text-brand-purple" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href="https://wa.me/972534260632"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-brand-purple text-white font-medium text-sm hover:bg-brand-purpleDark transition-all shadow-lg shadow-brand-purple/20 border border-transparent hover:border-brand-gold"
            >
              {t('hireMe')}
            </a>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
             {/* Mobile Language Switcher (Simple Toggle) */}
             <button
                onClick={() => {
                   const next = language === 'en' ? 'he' : language === 'he' ? 'ar' : 'en';
                   setLanguage(next);
                }}
                className="text-slate-700 font-bold uppercase text-sm border border-slate-200 rounded-md px-2 py-1"
             >
                {language}
             </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-700 hover:text-brand-purple focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-6 pt-4 pb-8 space-y-4 flex flex-col">
              {NAV_LINKS[language].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-slate-600 hover:text-brand-purple text-lg font-medium"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-brand-purple text-white font-medium shadow-md"
              >
                {t('letsTalk')}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;