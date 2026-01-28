import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Moon, Sun } from 'lucide-react';
import { NAV_LINKS, LOGO_SRC } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';


const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-brand-gold/20 dark:border-slate-800' : 'bg-transparent'}`}>
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
                className="text-slate-600 dark:text-slate-300 hover:text-brand-purple dark:hover:text-brand-purpleLight transition-colors font-medium text-sm tracking-wide"
              >
                {link.name}
              </a>
            ))}

            {/* Language Switcher */}
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  const next = language === 'en' ? 'he' : language === 'he' ? 'ar' : 'en';
                  setLanguage(next);
                }}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-brand-purple dark:hover:text-brand-purpleLight transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Switch Language"
              >
                <Globe size={20} />
                <span className="uppercase font-bold text-xs">{language}</span>
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-purple dark:hover:text-brand-purpleLight hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

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
              className="text-slate-700 dark:text-slate-300 font-bold uppercase text-sm border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1"
            >
              {language}
            </button>

            <button
              onClick={toggleTheme}
              className="text-slate-700 dark:text-slate-300 hover:text-brand-purple p-1"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-700 dark:text-slate-300 hover:text-brand-purple focus:outline-none"
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
            className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-6 pt-4 pb-8 space-y-4 flex flex-col">
              {NAV_LINKS[language].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-slate-600 dark:text-slate-300 hover:text-brand-purple text-lg font-medium"
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