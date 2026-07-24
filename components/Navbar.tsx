import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Moon, Sun } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSectionNavigate } from '../hooks/useSectionNavigate';


const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { scrollYProgress } = useScroll();
  const navigateToSection = useSectionNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-brand-gold/20 dark:border-slate-800' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Name — single instance, scales with viewport */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              navigateToSection('/');
            }}
            className="text-lg md:text-xl font-heading font-bold text-slate-900 dark:text-white hover:text-brand-purple dark:hover:text-brand-purpleLight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 rounded"
          >
            Waseem
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 items-center">
            {NAV_LINKS[language].map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigateToSection(link.href);
                }}
                className="text-slate-600 dark:text-slate-300 hover:text-brand-purple dark:hover:text-brand-purpleLight transition-colors font-medium text-sm tracking-wide"
              >
                {link.name}
              </a>
            ))}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  const next = language === 'en' ? 'he' : language === 'he' ? 'ar' : 'en';
                  setLanguage(next);
                }}
                aria-label={`Switch language. Current: ${language.toUpperCase()}. Click to change.`}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-brand-purple dark:hover:text-brand-purpleLight transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
              >
                <Globe size={20} aria-hidden="true" />
                <span className="uppercase font-bold text-xs">{language}</span>
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Toggle ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-purple dark:hover:text-brand-purpleLight hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
            >
              {theme === 'dark' ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
            </button>

            {/* CTA Button */}
            <a
              href="/about#contact"
              onClick={(e) => {
                e.preventDefault();
                navigateToSection('/about#contact', { focusId: 'name' });
              }}
              className="px-4 py-2 bg-brand-purple text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:bg-brand-purpleLight transition-all"
            >
              {t('hero_cta_start')}
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
              aria-label={`Switch language. Current: ${language.toUpperCase()}`}
              className="text-slate-700 dark:text-slate-300 font-bold uppercase text-sm border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
            >
              {language}
            </button>

            <button
              onClick={toggleTheme}
              aria-label={`Toggle ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="text-slate-700 dark:text-slate-300 hover:text-brand-purple p-1 focus:outline-none focus:ring-2 focus:ring-brand-purple rounded"
            >
              {theme === 'dark' ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="text-slate-700 dark:text-slate-300 hover:text-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple rounded"
            >
              {isOpen ? <X size={28} aria-hidden="true" /> : <Menu size={28} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 overflow-hidden relative z-50"
            role="navigation"
            aria-label="Main navigation menu"
          >
            <div className="px-6 pt-4 pb-8 space-y-4 flex flex-col">
              {NAV_LINKS[language].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    setTimeout(() => navigateToSection(link.href), 100);
                  }}
                  className="text-slate-600 dark:text-slate-300 hover:text-brand-purple text-lg font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-lg px-2 py-1 -mx-2 block cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="/about#contact"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  setTimeout(() => navigateToSection('/about#contact', { focusId: 'name' }), 100);
                }}
                className="w-full text-center py-3 rounded-xl bg-brand-purple text-white font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 cursor-pointer"
              >
                {t('letsTalk')}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll progress — always fills left-to-right regardless of page
          direction, matching the universal reading-progress convention. */}
      <motion.div
        dir="ltr"
        aria-hidden="true"
        style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-purple to-brand-cyan"
      />
    </nav>
  );
};

export default Navbar;