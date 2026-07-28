import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { FAQItem } from '../types';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { CONTACT } from '../constants';
import Dimensional3DWord, { fontForLanguage } from './three/Dimensional3DWord';

const FAQ: React.FC = () => {
    const { t, dir, language } = useLanguage();
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Check for reduced motion preference
    const prefersReducedMotion = usePrefersReducedMotion();

    const localizedFaqs: FAQItem[] = [
        { question: t('faq_q1'), answer: t('faq_a1') },
        { question: t('faq_q2'), answer: t('faq_a2') },
        { question: t('faq_q3'), answer: t('faq_a3') },
        { question: t('faq_q4'), answer: t('faq_a4') },
        { question: t('faq_q5'), answer: t('faq_a5') },
        { question: t('faq_q6'), answer: t('faq_a6') },
        { question: t('faq_q7'), answer: t('faq_a7') },
    ];

    // Handle keyboard navigation for accordion
    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        // Per the WAI-ARIA accordion pattern, Arrow/Home/End move focus between
        // headers only — they must NOT expand/collapse panels (that's what
        // Enter/Space/click do). Mutating openIndex here made reading one answer
        // and arrowing to the next header silently collapse the first.
        switch (e.key) {
            case 'Home':
                e.preventDefault();
                buttonRefs.current[0]?.focus();
                break;
            case 'End': {
                e.preventDefault();
                const lastIndex = localizedFaqs.length - 1;
                buttonRefs.current[lastIndex]?.focus();
                break;
            }
            case 'ArrowDown': {
                e.preventDefault();
                const nextIndex = Math.min(index + 1, localizedFaqs.length - 1);
                buttonRefs.current[nextIndex]?.focus();
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                const prevIndex = Math.max(index - 1, 0);
                buttonRefs.current[prevIndex]?.focus();
                break;
            }
        }
    };

    return (
        <section id="faq" dir={dir} className="py-16 sm:py-20 md:py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
            {/* Clean Background */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-100/50 -skew-x-12"></div>

            <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

                    {/* Left Column: Sticky Header & CTA */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-32">
                            <motion.div
                                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={prefersReducedMotion ? { duration: 0 } : undefined}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-brand-purple text-xs font-bold uppercase tracking-wider mb-6 shadow-sm"
                            >
                                <Sparkles size={14} />
                                <span>{t('faq_badge')}</span>
                            </motion.div>

                            <motion.h2
                                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.1 }}
                                className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white mb-6 leading-tight"
                            >
                                {t('faq_title_1')} <br />
                                <Dimensional3DWord
                                    word={t('faq_title_2')}
                                    font={fontForLanguage(language)}
                                    color="#9683d6"
                                    depthColor="#2b2168"
                                    fallbackClassName="inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan"
                                />
                            </motion.h2>

                            <motion.p
                                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2 }}
                                className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed"
                            >
                                {t('faq_desc')}
                            </motion.p>

                            <motion.div
                                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3 }}
                            >
                                <a
                                    href={CONTACT.whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-800 rounded-xl sm:rounded-2xl font-bold hover:border-brand-purple hover:shadow-xl hover:shadow-brand-purple/10 transition-all duration-300"
                                >
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <MessageCircle size={16} className="sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="text-left rtl:text-right">
                                        <span className="block text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wide">{t('faq_cta_unsure')}</span>
                                        <span className="block text-base sm:text-lg">{t('faq_cta_ask')}</span>
                                    </div>
                                    <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 text-slate-600 dark:text-slate-400 group-hover:text-brand-purple group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all" />
                                </a>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column: Clean Accordion Cards */}
                    <div className="lg:col-span-7 space-y-4" role="list" aria-label={t('faq_title_1') + ' ' + t('faq_title_2')}>
                        {localizedFaqs.map((faq, index) => {
                            const isOpen = openIndex === index;
                            const panelId = `faq-panel-${index}`;
                            const buttonId = `faq-button-${index}`;
                            return (
                                <motion.div
                                    key={index}
                                    initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.1 }}
                                    className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen
                                            ? 'bg-white dark:bg-slate-900 border-brand-purple shadow-lg shadow-brand-purple/10 ring-1 ring-brand-purple/20'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                                        }`}
                                    role="listitem"
                                >
                                    <h3>
                                        <button
                                            ref={(el) => (buttonRefs.current[index] = el)}
                                            id={buttonId}
                                            onClick={() => setOpenIndex(isOpen ? null : index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            aria-expanded={isOpen}
                                            aria-controls={panelId}
                                            className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 text-left rtl:text-right focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-inset rounded-2xl"
                                        >
                                            <span className={`text-base sm:text-lg font-bold transition-colors ${isOpen ? 'text-brand-purple' : 'text-slate-800 dark:text-slate-200'}`}>
                                                {faq.question}
                                            </span>
                                            <div className={`flex-shrink-0 ml-3 rtl:mr-3 rtl:ml-0 sm:ml-4 rtl:sm:mr-4 rtl:sm:ml-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen
                                                    ? 'bg-brand-purple text-white rotate-180 rtl:rotate-0'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                                                }`} aria-hidden="true">
                                                {isOpen ? <Minus size={14} className="sm:size-[18px]" /> : <Plus size={14} className="sm:size-[18px]" />}
                                            </div>
                                        </button>
                                    </h3>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                id={panelId}
                                                role="region"
                                                aria-labelledby={buttonId}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeInOut" }}
                                            >
                                                <div className="px-4 sm:px-5 md:px-6 pb-6 sm:pb-7 md:pb-8 pt-0">
                                                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;