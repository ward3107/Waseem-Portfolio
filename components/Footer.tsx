import React, { useState, useEffect, useRef } from 'react';
import { Github, Linkedin, Twitter, ArrowRight, ArrowLeft, Heart, Mail, X } from 'lucide-react';
import { NAV_LINKS, SERVICES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { language, t } = useLanguage();
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Focus trap within legal modal
  useEffect(() => {
    if (legalModal && modalRef.current) {
      // Store the previously focused element
      previousActiveElementRef.current = document.activeElement as HTMLElement;

      // Find all focusable elements within the modal
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      // Focus the first focusable element
      firstFocusable?.focus();

      // Handle Tab key to trap focus
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleTabKey);
        document.body.style.overflow = '';

        // Return focus to the trigger element when modal closes
        previousActiveElementRef.current?.focus();
      };
    }
  }, [legalModal]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && legalModal) {
        setLegalModal(null);
      }
    };

    if (legalModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [legalModal]);

  return (
    <footer id="footer" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-gold"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="space-y-6">
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-brand-purple dark:text-brand-purpleLight">Waseem</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              {t('footer_desc')}
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/waseem-portfolio" target="_blank" rel="noopener noreferrer" aria-label="Visit Waseem's GitHub profile" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-purple dark:hover:text-white hover:border-brand-purple hover:bg-brand-purple/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2">
                <Github size={18} aria-hidden="true" />
              </a>
              <a href="https://linkedin.com/in/waseem-profile" target="_blank" rel="noopener noreferrer" aria-label="Visit Waseem's LinkedIn profile" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-white hover:border-brand-blue hover:bg-brand-blue/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2">
                <Linkedin size={18} aria-hidden="true" />
              </a>
              <a href="https://twitter.com/waseemdev" target="_blank" rel="noopener noreferrer" aria-label="Visit Waseem's Twitter profile" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-cyan dark:hover:text-white hover:border-brand-cyan hover:bg-brand-cyan/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2">
                <Twitter size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">{t('footer_links')}</h4>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              {NAV_LINKS[language].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:text-brand-purple transition-colors flex items-center gap-2 group">
                    <ArrowRight size={14} className="opacity-0 -ml-4 rtl:-mr-4 rtl:ml-0 rtl:rotate-180 group-hover:opacity-100 group-hover:ml-0 rtl:group-hover:mr-0 transition-all duration-300 text-brand-purple" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">{t('footer_services')}</h4>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i}>
                  <a href="#what-i-do" className="hover:text-brand-cyan transition-colors">
                    {t(`service_${i}_title`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Contact - Enhanced with highlighting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glowing background effect */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(147, 51, 234, 0.1)",
                  "0 0 40px rgba(147, 51, 234, 0.2)",
                  "0 0 20px rgba(147, 51, 234, 0.1)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -inset-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-gold rounded-2xl opacity-30 blur-sm"
            />

            <div className="relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-xl p-5 border-2 border-brand-purple/20 shadow-lg">
              {/* Animated badge */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-brand-gold to-amber-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-xs">✨</span>
              </motion.div>

              <h4 className="text-lg font-bold mb-2 bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
                {t('footer_stay_updated')}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                {t('footer_sub_text')}
              </p>

              {/* Lead Magnet Incentive */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="mb-4 p-3 bg-gradient-to-r from-brand-purple/10 to-brand-cyan/10 border border-brand-purple/30 rounded-lg relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/20 rounded-full blur-2xl group-hover:bg-brand-gold/30 transition-colors"></div>
                <div className="relative flex items-start gap-3">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl flex-shrink-0"
                  >
                    🎁
                  </motion.span>
                  <div className="text-sm">
                    <p className="font-bold text-slate-900 dark:text-white mb-1">{t('footer_lead_magnet_title')}</p>
                    <p className="text-slate-600 dark:text-slate-400">{t('footer_lead_magnet_desc')}</p>
                  </div>
                </div>
              </motion.div>

              {/* Success Message */}
              <AnimatePresence>
                {newsletterStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-400 rounded-lg flex items-center gap-2"
                  >
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      {language === 'he' ? 'נרשמת בהצלחה!' : language === 'ar' ? 'تم الاشتراك بنجاح!' : 'Successfully subscribed!'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                className="flex flex-col gap-3"
                action="https://formspree.io/f/YOUR_FORM_ID"
                method="POST"
                onSubmit={(e) => {
                  // Handle client-side submission tracking
                  const formData = new FormData(e.currentTarget);
                  fetch(e.currentTarget.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                  }).then(response => {
                    if (response.ok) {
                      setNewsletterStatus('success');
                      // Track signup event
                      if (typeof window !== 'undefined' && (window as any).gtag) {
                        (window as any).gtag('event', 'sign_up', { form_type: 'newsletter' });
                      }
                    } else {
                      setNewsletterStatus('error');
                    }
                  });
                }}
              >
                <input type="hidden" name="subject" value="Newsletter Subscription from Portfolio" />
                <motion.div
                  className="relative"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(147, 51, 234, 0)",
                      "0 0 0 8px rgba(147, 51, 234, 0.1)",
                      "0 0 0 16px rgba(147, 51, 234, 0.05)",
                      "0 0 0 0 rgba(147, 51, 234, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Mail size={16} className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-500 z-10" />
                  <motion.input
                    type="email"
                    name="email"
                    placeholder={t('footer_email_placeholder')}
                    required
                    animate={{
                      borderColor: [
                        "rgb(226, 232, 240)",
                        "rgb(168, 85, 247)",
                        "rgb(226, 232, 240)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    disabled={newsletterStatus === 'success'}
                    className="w-full bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-lg pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 text-sm focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </motion.div>
                <motion.button
                  whileHover={{ scale: newsletterStatus === 'success' ? 1 : 1.02 }}
                  whileTap={{ scale: newsletterStatus === 'success' ? 1 : 0.98 }}
                  disabled={newsletterStatus === 'success'}
                  className="w-full bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-brand-purple/30 transition-all duration-300 text-sm relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {newsletterStatus === 'success'
                      ? (language === 'he' ? 'נרשמת!' : language === 'ar' ? 'مشترك!' : 'Subscribed!')
                      : <>
                        {t('footer_sub_btn')}
                        {language === 'he' || language === 'ar' ? (
                          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        ) : (
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        )}
                      </>
                    }
                  </span>
                  {newsletterStatus !== 'success' && (
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    />
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {currentYear} Waseem. {t('footer_rights')}</p>
          <div className="flex gap-8 font-medium">
            <button onClick={() => setLegalModal('privacy')} className="hover:text-brand-purple hover:underline underline-offset-4 transition-all duration-300">
              {t('footer_privacy')}
            </button>
            <button onClick={() => setLegalModal('terms')} className="hover:text-brand-cyan hover:underline underline-offset-4 transition-all duration-300">
              {t('footer_terms')}
            </button>
          </div>
          <p className="flex items-center gap-1">
            {t('footer_made_with')} {t('footer_tel_aviv')}
          </p>
        </div>
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
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-purple"
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