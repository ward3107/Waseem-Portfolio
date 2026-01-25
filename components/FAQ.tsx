import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { FAQItem } from '../types';

const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const localizedFaqs: FAQItem[] = [
      { question: t('faq_q1'), answer: t('faq_a1') },
      { question: t('faq_q2'), answer: t('faq_a2') },
      { question: t('faq_q3'), answer: t('faq_a3') },
      { question: t('faq_q4'), answer: t('faq_a4') },
      { question: t('faq_q5'), answer: t('faq_a5') },
      { question: t('faq_q6'), answer: t('faq_a6') },
      { question: t('faq_q7'), answer: t('faq_a7') },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Clean Background */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-100/50 -skew-x-12"></div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* Left Column: Sticky Header & CTA */}
            <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-32">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-brand-purple text-xs font-bold uppercase tracking-wider mb-6 shadow-sm"
                    >
                        <Sparkles size={14} />
                        <span>{t('faq_badge')}</span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-6 leading-tight"
                    >
                        {t('faq_title_1')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">{t('faq_title_2')}</span>
                    </motion.h2>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-600 text-lg mb-10 leading-relaxed"
                    >
                        {t('faq_desc')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                         <a 
                            href="https://wa.me/972534260632" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-4 px-8 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold hover:border-brand-purple hover:shadow-xl hover:shadow-brand-purple/10 transition-all duration-300"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MessageCircle size={20} />
                            </div>
                            <div className="text-left rtl:text-right">
                                <span className="block text-xs text-slate-500 uppercase font-bold tracking-wide">{t('faq_cta_unsure')}</span>
                                <span className="block text-lg">{t('faq_cta_ask')}</span>
                            </div>
                            <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 text-slate-400 group-hover:text-brand-purple group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all" />
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Right Column: Clean Accordion Cards */}
            <div className="lg:col-span-7 space-y-4">
                {localizedFaqs.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
                                isOpen 
                                ? 'bg-white border-brand-purple shadow-lg shadow-brand-purple/10 ring-1 ring-brand-purple/20' 
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                            }`}
                        >
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left rtl:text-right focus:outline-none"
                            >
                                <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-brand-purple' : 'text-slate-800'}`}>
                                    {faq.question}
                                </span>
                                <div className={`flex-shrink-0 ml-4 rtl:mr-4 rtl:ml-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isOpen 
                                    ? 'bg-brand-purple text-white rotate-180' 
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                }`}>
                                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-6 pb-8 pt-0">
                                            <p className="text-slate-600 leading-relaxed">
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