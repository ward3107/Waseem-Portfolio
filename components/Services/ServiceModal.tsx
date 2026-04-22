import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { Service } from '../../types';
import { useFocusTrap, useEscapeKey } from '../../hooks/useFocusTrap';
import { CONTACT } from '../../constants';

interface ServiceModalProps {
  service: Service | null;
  onClose: () => void;
  onCTA: () => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose, onCTA, t, dir }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useFocusTrap(modalRef, service !== null);
  useEscapeKey(service !== null, onClose);

  useEffect(() => {
    if (service && modalRef.current) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
        previousActiveElementRef.current?.focus();
      };
    }
  }, [service]);

  return (
    <AnimatePresence>
      {service && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            aria-hidden="true"
          />
          <motion.div
            ref={modalRef}
            layoutId={`service-${service.title}`}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div
              className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"
              aria-hidden="true"
            ></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <button
                onClick={onClose}
                aria-label={t('legal_close')}
                className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 p-1.5 sm:p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple"
              >
                <X size={16} aria-hidden="true" />
              </button>

              <div
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 sm:mb-6 border border-slate-200 dark:border-slate-700 shadow-[0_0_30px_rgba(72,58,160,0.3)]"
                aria-hidden="true"
              >
                <service.icon size={28} />
              </div>

              <h3
                id="service-modal-title"
                className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2"
              >
                {service.title}
              </h3>

              <div
                className="h-1 w-16 sm:w-20 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-full mb-4 sm:mb-6"
                aria-hidden="true"
              ></div>

              <div
                className={`text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-5 sm:mb-6 md:mb-8 whitespace-pre-wrap ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
              >
                {service.modalDescription || service.description}
              </div>

              <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
                <button
                  onClick={onCTA}
                  className="w-full px-6 sm:px-8 py-2.5 sm:py-3 bg-brand-purple hover:bg-brand-purpleLight text-white font-bold rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-brand-purple/40 transform hover:-translate-y-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
                >
                  {t('modal_btn')}
                </button>

                <a
                  href={`${CONTACT.whatsappUrl}?text=${encodeURIComponent(`Hi, I'm interested in ${service.title}...`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-slate-400 hover:text-green-500 text-xs sm:text-sm font-bold transition-colors py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <MessageCircle size={14} aria-hidden="true" />
                  {t('modal_whatsapp')}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ServiceModal;
