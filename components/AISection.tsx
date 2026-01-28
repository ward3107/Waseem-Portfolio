import React from 'react';
import { Bot, MessageSquare, Calendar, Zap } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const AISection: React.FC = () => {
  const { t } = useLanguage();
  // Split words for animation
  const sentenceWords = t('ai_title_start').split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Very fast stagger
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <section id="ai-automation" className="py-24 bg-white dark:bg-slate-950 overflow-hidden relative transition-colors duration-300">
      {/* Background Gradients (Lighter) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-purple/5 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-cyan/5 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">

            {/* Eye-catching badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-900 border border-brand-cyan/30 text-brand-cyan text-sm font-bold shadow-lg shadow-brand-cyan/10 mb-8"
            >
              <Zap size={16} className="fill-brand-cyan" />
              <span>{t('ai_badge')}</span>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="mb-8"
            >
              <h2 className="text-4xl sm:text-5xl font-heading font-extrabold leading-tight tracking-tight flex flex-wrap gap-x-3 gap-y-1 mb-2 text-slate-900 dark:text-white">
                {sentenceWords.map((word, i) => (
                  <motion.span key={`word-${i}`} variants={wordVariants} className="inline-block">
                    {word}
                  </motion.span>
                ))}
              </h2>

              {/* Massive, High-Contrast Highlight */}
              <motion.div
                variants={wordVariants}
                className="relative inline-block mt-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 blur-xl opacity-50 rounded-lg"></div>
                <h2 className="relative text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan drop-shadow-sm">
                  {t('ai_title_highlight')}
                </h2>
                {/* Underline decoration */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="h-2 bg-brand-gold mt-2 rounded-full opacity-80"
                ></motion.div>
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-600 dark:text-slate-300 text-xl mb-10 leading-relaxed max-w-lg"
            >
              {t('ai_desc')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                <div className="p-3 bg-brand-purple/10 rounded-lg text-brand-purple mt-1">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">{t('ai_card_1_title')}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{t('ai_card_1_desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                <div className="p-3 bg-brand-cyan/10 rounded-lg text-brand-cyan mt-1">
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">{t('ai_card_2_title')}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{t('ai_card_2_desc')}</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl"
            >
              {/* Mock Chat Interface */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center animate-pulse">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t('ai_chat_name')}</p>
                    <p className="text-xs text-brand-green flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span> {t('ai_chat_status')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm font-medium">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-tr-xl rounded-bl-xl rounded-br-xl max-w-[85%] border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <p>{t('ai_chat_msg_1')}</p>
                  </div>
                  <div className="bg-brand-purple p-4 rounded-tl-xl rounded-bl-xl rounded-br-xl max-w-[85%] ml-auto text-white shadow-lg shadow-brand-purple/20">
                    <p>{t('ai_chat_msg_2')}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-tr-xl rounded-bl-xl rounded-br-xl max-w-[85%] border border-slate-100 text-slate-700">
                    <div className="flex gap-2 mb-2">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                    <p>{t('ai_chat_msg_3')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Background decorative elements for the graphic */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-gold/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-brand-purple/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISection;