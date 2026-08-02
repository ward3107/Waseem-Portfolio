import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Moon, Sun } from 'lucide-react';
import { NAV_LINKS } from '@/constants';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSectionNavigate } from '@/shared/hooks/useSectionNavigate';
import NavShareButton from '@/shared/widgets/NavShareButton';


const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { scrollYProgress } = useScroll();
  const navigateToSection = useSectionNavigate();

  useEffect(() => {
    let rafId = 0;
    let pending = false;
    const handleScroll = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        pending = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
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
                aria-label={t('aria_lang_switch')}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-brand-purple dark:hover:text-brand-purpleLight transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
              >
                <Globe size={20} aria-hidden="true" />
                <span className="uppercase font-bold text-xs">{language}</span>
              </button>
            </div>

            {/* Share (replaces the floating ShareWidget on mobile+desktop) */}
            <NavShareButton />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t('aria_theme_toggle_light') : t('aria_theme_toggle_dark')}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-purple dark:hover:text-brand-purpleLight hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
            >
              {theme === 'dark' ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
            </button>

            {/* CTA Button */}
            <a
              href="/about#contact"
              onClick={(e) => {
                e.preventDefault();
                navigateToSection('/about#contact', { focusId: 'project-wizard' });
              }}
              className="px-4 py-2 bg-brand-purple text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:bg-brand-purpleLight transition-all"
            >
              {t('hero_cta_start')}
            </a>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Share (replaces the floating ShareWidget) */}
            <NavShareButton />

            {/* Mobile Language Switcher (Simple Toggle) */}
            <button
              onClick={() => {
                const next = language === 'en' ? 'he' : language === 'he' ? 'ar' : 'en';
                setLanguage(next);
              }}
              aria-label={t('aria_lang_switch')}
              className="text-slate-700 dark:text-slate-300 font-bold uppercase text-sm border border-slate-200 dark:border-slate-700 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
            >
              {language}
            </button>

            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t('aria_theme_toggle_light') : t('aria_theme_toggle_dark')}
              className="text-slate-700 dark:text-slate-300 hover:text-brand-purple min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-purple rounded"
            >
              {theme === 'dark' ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? t('aria_menu_close') : t('aria_menu_open')}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="text-slate-700 dark:text-slate-300 hover:text-brand-purple min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-purple rounded"
            >
              {isOpen ? <X size={28} aria-hidden="true" /> : <Menu size={28} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — backdrop covers the rest of the page so a tap outside
          the menu closes it AND the content underneath is not accidentally
          clickable (previously the hero card could be flipped through the
          drawer). Backdrop has its own z-index below the menu itself. */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label={t('aria_menu_close')}
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40 cursor-default"
            />
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
                  setTimeout(() => navigateToSection('/about#contact', { focusId: 'project-wizard' }), 100);
                }}
                className="w-full text-center py-3 rounded-xl bg-brand-purple text-white font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 cursor-pointer"
              >
                {t('letsTalk')}
              </a>
              </div>
            </motion.div>
          </>
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