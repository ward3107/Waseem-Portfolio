import React, { useState, useEffect, useRef } from 'react';
import {
  Blocks,
  Calculator,
  BookOpen,
  Images,
  PanelsTopLeft,
  Bot,
  Briefcase,
  Clapperboard,
  Globe,
  Mail,
  Menu,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { NAV_LINKS } from '@/constants';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionNavigate } from '@/shared/hooks/useSectionNavigate';
import { useContact } from '@/features/contact/useContact';
import AudioHeaderControl from '@/experience/components/AudioHeaderControl';
import BrandLogo from '@/shared/brand/BrandLogo';
import { useLocation } from 'react-router-dom';

const NAV_ICONS: Record<string, LucideIcon> = {
  '/#what-i-do': Blocks,
  '/#quote-builder': Calculator,
  '/#ai-automation': Bot,
  '/#about': UserRound,
  '/#projects': Briefcase,
  '/video-ads': Clapperboard,
  '/#contact': Mail,
  '/gallery/': Images,
  '/en/gallery/': Images,
  '/ar/gallery/': Images,
  '/stories/': PanelsTopLeft,
  '/en/stories/': PanelsTopLeft,
  '/ar/stories/': PanelsTopLeft,
  '/blog/': BookOpen,
  '/en/blog/': BookOpen,
  '/ar/blog/': BookOpen,
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null);
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);

  const { language, setLanguage, t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const navigateToSection = useSectionNavigate();
  const contact = useContact();
  const homeHref = language === 'he' ? '/' : `/${language}/`;
  const localizedHref = (href: string) => href.startsWith('/#') ? `${homeHref}${href.slice(1)}` : href;

  // A route change can happen while the drawer is open (for example from
  // another in-app control). Never leave the new page scroll locked.
  useEffect(() => setIsOpen(false), [location.pathname, location.hash]);

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

  // While the mobile menu is open: lock body scroll (so the page behind doesn't
  // scroll under the drawer) and close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => firstMenuLinkRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        menuToggleRef.current?.focus();
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(navRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([tabindex="-1"])') ?? [])
        .filter((item) => item.getClientRects().length > 0);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && (document.activeElement === first || !navRef.current?.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !navRef.current?.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 ${isOpen ? 'z-[60]' : 'z-50'} transition-all duration-300 ${scrolled || isOpen ? `bg-white/90 dark:bg-slate-900/90 shadow-sm border-b border-brand-gold/20 dark:border-slate-800 ${isOpen ? '' : 'backdrop-blur-sm'}` : 'bg-transparent'}`}
    >
      <div className="relative z-50 max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Name — single instance, scales with viewport */}
          <a
            href={homeHref}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              navigateToSection('/');
            }}
            aria-label="vasia.dev"
            className="block w-[156px] text-slate-900 transition-colors hover:text-brand-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 dark:text-white dark:hover:text-brand-purpleLighter sm:w-[174px] rounded"
          >
            <BrandLogo className="h-auto w-full" />
          </a>

          {/* Desktop Menu */}
          <div className="hidden xl:flex gap-2 items-center">
            {NAV_LINKS[language].map((link) => {
              const Icon = NAV_ICONS[link.href] ?? Blocks;
              return (
                <a
                  key={link.name}
                  href={localizedHref(link.href)}
                  title={link.name}
                  aria-label={link.name}
                  onClick={(e) => {
                    if (/\/(blog|gallery|stories)\/$/.test(link.href)) return;
                    e.preventDefault();
                    navigateToSection(link.href);
                  }}
                  className="group relative grid h-11 w-11 place-items-center rounded-xl text-slate-600 transition-colors hover:bg-brand-purple/10 hover:text-brand-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:bg-brand-purpleLight/10 dark:hover:text-brand-purpleLight"
                >
                  <Icon size={21} strokeWidth={1.9} aria-hidden="true" />
                  <span
                    aria-hidden="true"
                    dir={language === 'en' ? 'ltr' : 'rtl'}
                    className="pointer-events-none absolute top-full z-50 mt-2 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-white dark:text-slate-950"
                  >
                    {link.name}
                  </span>
                </a>
              );
            })}

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

            {/* Audio tour control — only visible while the experience tour is
                mounted; hidden on every other page. */}
            <AudioHeaderControl />

            {/* CTA Button */}
            <a
              href={contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-brand-purple text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:bg-brand-purpleLight transition-all"
            >
              {t('hero_cta_start')}
            </a>
          </div>

          {/* Mobile Toggle */}
          <div className="xl:hidden flex items-center gap-2">
            {/* Audio tour control (mobile) — hidden unless the tour is mounted. */}
            <AudioHeaderControl />

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
              ref={menuToggleRef}
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
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="xl:hidden fixed inset-x-0 top-16 bottom-0 bg-black/50 z-40 cursor-default"
            />
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden relative z-50 max-h-[calc(100dvh-4rem)] overflow-x-hidden overflow-y-auto overscroll-contain border-b border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-900"
              role="navigation"
              aria-label="Main navigation menu"
            >
              <div className="flex flex-col gap-1 px-6 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                {NAV_LINKS[language].map((link, index) => {
                  const Icon = NAV_ICONS[link.href] ?? Blocks;
                  return (
                    <a
                      key={link.name}
                      ref={index === 0 ? firstMenuLinkRef : undefined}
                      href={localizedHref(link.href)}
                      onClick={(e) => {
                        if (/\/(blog|gallery|stories)\/$/.test(link.href)) return;
                        e.preventDefault();
                        setIsOpen(false);
                        setTimeout(() => navigateToSection(link.href), 100);
                      }}
                      className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-base font-medium text-slate-600 hover:bg-brand-purple/10 hover:text-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple dark:text-slate-300"
                    >
                      <Icon size={22} strokeWidth={1.9} aria-hidden="true" />
                      <span>{link.name}</span>
                    </a>
                  );
                })}
                <a
                  href={contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-purple px-3 py-2 text-center font-medium text-white shadow-md focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 cursor-pointer"
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
