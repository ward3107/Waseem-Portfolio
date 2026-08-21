import React, { useState, useEffect, useRef } from 'react';
import FooterConstellation from '@/shared/ui/FooterConstellation';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, ArrowRight, X, Lock } from 'lucide-react';
import { NAV_LINKS, SERVICE_AREAS } from '@/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap, useEscapeKey } from '@/shared/hooks/useFocusTrap';
import { useSectionNavigate } from '@/shared/hooks/useSectionNavigate';
import { useContact } from '@/features/contact/useContact';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { language, t } = useLanguage();
  const navigateToSection = useSectionNavigate();
  const CONTACT = useContact();
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const handleCloseModal = () => setLegalModal(null);

  // Capture the trigger BEFORE opening — useFocusTrap moves focus into the
  // modal on its own effect, so reading document.activeElement inside the
  // open-effect would record the modal's first button and restore focus to a
  // now-unmounted node on close (focus falls to <body>, a WCAG 2.4.3 failure).
  const openLegal = (type: 'privacy' | 'terms') => {
    previousActiveElementRef.current = document.activeElement as HTMLElement;
    setLegalModal(type);
  };

  // Use custom hooks for focus trap and escape key
  useFocusTrap(modalRef, legalModal !== null);
  useEscapeKey(legalModal !== null, handleCloseModal);

  // Lock body scroll while the modal is open and restore focus on close.
  // Gated on `legalModal` only (not modalRef.current, which can be null on the
  // first effect run while AnimatePresence mounts — that would skip the lock).
  useEffect(() => {
    if (legalModal) {
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = '';
        // Return focus to the element that opened the modal.
        previousActiveElementRef.current?.focus();
      };
    }
  }, [legalModal]);

  return (
    <footer
      id="footer"
      className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-900 relative overflow-hidden transition-colors duration-300"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-gold"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20"></div>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-brand-purple dark:text-brand-purpleLighter">
              Waseem
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              {t('footer_desc')}
            </p>
            <div className="flex gap-4">
              <a
                href={CONTACT.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('aria_github')}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-purple dark:hover:text-white hover:border-brand-purple hover:bg-brand-purple/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
              >
                <Github size={18} aria-hidden="true" />
              </a>
              <a
                href={CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('aria_linkedin')}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-white hover:border-brand-blue hover:bg-brand-blue/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
              >
                <Linkedin size={18} aria-hidden="true" />
              </a>
              <a
                href={CONTACT.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('aria_twitter')}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-cyan dark:hover:text-white hover:border-brand-cyan hover:bg-brand-cyan/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2"
              >
                <Twitter size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">
              {t('footer_links')}
            </h4>
            <ul className="space-y-0.5 text-sm text-slate-600 dark:text-slate-400">
              {NAV_LINKS[language].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToSection(link.href);
                    }}
                    className="hover:text-brand-purple transition-colors flex items-center gap-2 group py-1.5"
                  >
                    <ArrowRight
                      size={14}
                      className="opacity-0 -ms-4 rtl:rotate-180 group-hover:opacity-100 group-hover:ms-0 transition-all duration-300 text-brand-purple"
                    />
                    {link.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/blog/"
                  className="hover:text-brand-purple transition-colors flex items-center gap-2 group py-1.5"
                >
                  <ArrowRight
                    size={14}
                    className="opacity-0 -ms-4 rtl:rotate-180 group-hover:opacity-100 group-hover:ms-0 transition-all duration-300 text-brand-purple"
                  />
                  {{ ar: 'مدونة', en: 'Blog', he: 'בלוג' }[language]}
                </a>
              </li>
            </ul>

            {/* Service Areas — internal links to local SEO landing pages */}
            <h4 className="text-sm font-bold mt-8 mb-4 text-slate-900 dark:text-white">
              {{ ar: 'مناطق الخدمة', en: 'Service Areas', he: 'אזורי שירות' }[language]}
            </h4>
            <ul className="space-y-0.5 text-sm text-slate-600 dark:text-slate-400">
              {SERVICE_AREAS.map((area) => (
                <li key={area.slug}>
                  <a
                    href={language === 'ar' ? `/ar/${area.slug}/` : `/${area.slug}/`}
                    className="hover:text-brand-cyan transition-colors flex items-center gap-2 group py-1.5"
                  >
                    <ArrowRight
                      size={14}
                      className="opacity-0 -ms-4 rtl:rotate-180 group-hover:opacity-100 group-hover:ms-0 transition-all duration-300 text-brand-cyan"
                    />
                    {
                      {
                        ar: area.ar,
                        en: `Web Design ${area.en}`,
                        he: `בניית אתרים ${area.he}`,
                      }[language]
                    }
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">
              {t('footer_services')}
            </h4>
            <ul className="space-y-0.5 text-sm text-slate-600 dark:text-slate-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i}>
                  <a
                    href="/#what-i-do"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToSection('/#what-i-do');
                    }}
                    className="hover:text-brand-cyan transition-colors block py-1.5"
                  >
                    {t(`service_${i}_title`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        {/* The journey's epilogue: its particles settle here and rebuild the
            W. Sweep a cursor through them and they scatter, then drift back. */}
        <FooterConstellation />

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600 dark:text-slate-500">
          <p>
            © {currentYear} Waseem. {t('footer_rights')}
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6 font-medium justify-center">
            {/* Privacy is a full page (Amendment 13 comprehensive statement)
                so search engines can crawl and cite it. Terms stays as a
                lightweight modal for now — no full page yet. */}
            <Link
              to="/privacy"
              className="hover:text-brand-purple hover:underline underline-offset-4 transition-all duration-300"
            >
              {t('footer_privacy')}
            </Link>
            <Link
              to="/accessibility"
              className="hover:text-brand-purple hover:underline underline-offset-4 transition-all duration-300"
            >
              {t('footer_accessibility')}
            </Link>
            <button
              onClick={() => openLegal('terms')}
              className="hover:text-brand-cyan hover:underline underline-offset-4 transition-all duration-300"
            >
              {t('footer_terms')}
            </button>
            <Link
              to="/admin"
              className="flex items-center gap-1 text-slate-400 dark:text-slate-600 hover:text-brand-purple hover:underline underline-offset-4 transition-all duration-300"
              aria-label={t('aria_admin')}
            >
              <Lock size={12} aria-hidden="true" />
              Admin
            </Link>
          </div>
          <p className="flex items-center gap-1">
            {t('footer_made_with')} {t('footer_tel_aviv')}
          </p>
        </div>

        {/* Clearance for everything docked over the page bottom: the WhatsApp
            bar on the bottom edge, back-to-top and the accessibility button
            above it, and the classic-site pill above those. Without the room
            they cover the legal links and swallow clicks meant for them. */}
        <div aria-hidden="true" className="h-48" />
      </div>

      {/* Legal Modal */}
      <AnimatePresence>
        {legalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLegalModal(null)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`legal-${legalModal}-title`}
              className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <h3 id={`legal-${legalModal}-title`} className="text-2xl font-bold font-heading">
                  {legalModal === 'privacy' ? t('legal_privacy_title') : t('legal_terms_title')}
                </h3>
                <button
                  onClick={() => setLegalModal(null)}
                  aria-label={t('legal_close')}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {legalModal === 'privacy' ? t('legal_privacy_content') : t('legal_terms_content')}
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                <button
                  onClick={() => setLegalModal(null)}
                  className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold hover:bg-brand-purple dark:hover:bg-brand-purple dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
                >
                  {t('legal_close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
