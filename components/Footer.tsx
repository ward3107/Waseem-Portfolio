import React, { useState } from 'react';
import { Github, Linkedin, Twitter, ArrowRight, Heart, Mail, X } from 'lucide-react';
import { LOGO_SRC, NAV_LINKS, SERVICES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { language, t } = useLanguage();
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

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
            <img src={LOGO_SRC} alt="Waseem Logo" className="h-10 w-auto object-contain" />
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              {t('footer_desc')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-purple dark:hover:text-white hover:border-brand-purple hover:bg-brand-purple/10 transition-all duration-300">
                <Github size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-white hover:border-brand-blue hover:bg-brand-blue/10 transition-all duration-300">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-cyan dark:hover:text-white hover:border-brand-cyan hover:bg-brand-cyan/10 transition-all duration-300">
                <Twitter size={18} />
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

          {/* Newsletter / Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">{t('footer_stay_updated')}</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              {t('footer_sub_text')}
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Mail size={16} className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder={t('footer_email_placeholder')}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 text-sm focus:outline-none focus:border-brand-purple transition-colors text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600"
                />
              </div>
              <button className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg hover:bg-brand-purple hover:text-white transition-all duration-300 text-sm">
                {t('footer_sub_btn')}
              </button>
            </form>
          </div>
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
            {t('footer_made_with')} <Heart size={12} className="text-red-500 fill-red-500" /> {t('footer_tel_aviv')}
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
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-2xl font-bold font-heading">
                  {legalModal === 'privacy' ? t('legal_privacy_title') : t('legal_terms_title')}
                </h3>
                <button
                  onClick={() => setLegalModal(null)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
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
                  className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold hover:bg-brand-purple dark:hover:bg-brand-purple dark:hover:text-white transition-colors"
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