import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

const ProjectWizard: React.FC = () => {
    const { t } = useLanguage();
    const [step, setStep] = useState(0);
    const [selections, setSelections] = useState({
        type: '',
        vibe: '',
        budget: '',
        details: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    // Mock Steps Data
    const steps = [
        {
            id: 'type',
            title: t('wizard_step1_title'),
            options: [
                { id: 'web', label: t('wizard_opt_web'), icon: '🌐' },
                { id: 'app', label: t('wizard_opt_app'), icon: '📱' },
                { id: 'ai', label: t('wizard_opt_ai'), icon: '🤖' },
                { id: 'ecommerce', label: t('wizard_opt_ecom'), icon: '🛍️' }
            ]
        },
        {
            id: 'vibe',
            title: t('wizard_step2_title'),
            options: [
                { id: 'minimal', label: t('wizard_opt_minimal'), icon: '⚪' },
                { id: 'bold', label: t('wizard_opt_bold'), icon: '🔥' },
                { id: 'corporate', label: t('wizard_opt_corp'), icon: '🏢' },
                { id: 'future', label: t('wizard_opt_future'), icon: '🚀' }
            ]
        },
        {
            id: 'budget',
            title: t('wizard_step3_title'),
            options: [
                { id: 'small', label: t('wizard_opt_small'), icon: '💰' },
                { id: 'medium', label: t('wizard_opt_medium'), icon: '💰💰' },
                { id: 'large', label: t('wizard_opt_large'), icon: '💰💰💰' },
                { id: 'enterprise', label: t('wizard_opt_ent'), icon: '🏦' }
            ]
        }
    ];

    const handleSelect = (key: string, value: string) => {
        setSelections({ ...selections, [key]: value });
        if (step < steps.length) {
            setTimeout(() => setStep(step + 1), 300); // Auto advance for smoother UX
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSent(true);
        }, 1500);
    };

    if (isSent) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-brand-purple/20 text-center min-h-[400px] flex flex-col items-center justify-center"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                    <Check size={40} />
                </div>
                <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">{t('wizard_success_title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8">{t('wizard_success_desc')}</p>
                <button
                    onClick={() => { setIsSent(false); setStep(0); setSelections({ type: '', vibe: '', budget: '', details: '' }); }}
                    className="text-brand-purple font-bold hover:underline"
                >
                    {t('wizard_start_over')}
                </button>
            </motion.div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[500px] flex flex-col relative">
            {/* Progress Bar */}
            <div className="h-2 bg-slate-50 dark:bg-slate-800 w-full flex">
                <motion.div
                    className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan"
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / (steps.length + 1)) * 100}%` }}
                ></motion.div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    {step > 0 ? (
                        <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                    ) : <div></div>}
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600">
                        {t('wizard_step_count').replace('{current}', (step + 1).toString()).replace('{total}', (steps.length + 1).toString())}
                    </span>
                </div>

                <AnimatePresence mode="wait">
                    {step < steps.length ? (
                        <motion.div
                            key={steps[step].id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="flex-1 flex flex-col"
                        >
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{steps[step].title}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {steps[step].options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSelect(steps[step].id, option.id)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 group
                                            ${selections[steps[step].id as keyof typeof selections] === option.id
                                                ? 'border-brand-purple bg-brand-purple/5 dark:bg-brand-purple/20 ring-4 ring-brand-purple/10'
                                                : 'border-slate-100 dark:border-slate-800 hover:border-brand-purple/50 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{option.icon}</span>
                                        <span className={`font-bold ${selections[steps[step].id as keyof typeof selections] === option.id ? 'text-brand-purple' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {option.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="final"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="flex-1 flex flex-col"
                        >
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('wizard_final_title')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{t('wizard_final_desc')}</p>

                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
                                <textarea
                                    className="w-full flex-1 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple resize-none min-h-[120px] text-slate-900 dark:text-white"
                                    placeholder={t('wizard_detail_placeholder')}
                                    value={selections.details}
                                    onChange={(e) => setSelections({ ...selections, details: e.target.value })}
                                    required
                                ></textarea>

                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="email"
                                        placeholder={t('emailLabel')}
                                        className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple text-slate-900 dark:text-white"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder={t('nameLabel')}
                                        className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple text-slate-900 dark:text-white"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-2 w-full py-4 bg-slate-900 dark:bg-brand-purple text-white rounded-xl font-bold text-lg hover:bg-brand-purple dark:hover:bg-brand-purpleLight transition-all shadow-lg hover:shadow-brand-purple/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? (
                                        t('sending')
                                    ) : (
                                        <>
                                            <Sparkles size={20} className="text-brand-gold group-hover:animate-spin-slow" />
                                            {t('wizard_btn_send')}
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProjectWizard;
