import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { trackEvent } from '../utils';

interface ProjectWizardProps {}

const ProjectWizard: React.FC<ProjectWizardProps> = () => {
    const { t, language } = useLanguage();
    const [step, setStep] = useState(0);
    const [selections, setSelections] = useState({
        type: '',
        vibe: '',
        budget: '',
        details: '',
        email: '',
        name: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; name?: string; general?: string }>({});
    const honeypotRef = useRef<HTMLInputElement>(null);

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
            // Functional update avoids advancing from a stale `step` capture.
            setTimeout(() => setStep((s) => s + 1), 300); // Auto advance for smoother UX
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({}); // Clear previous errors

        // Validate required fields
        const newErrors: { email?: string; name?: string; general?: string } = {};

        if (!selections.email) {
            newErrors.email = t('required');
        } else {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(selections.email)) {
                newErrors.email = t('invalidEmail');
            }
        }

        if (!selections.name) {
            newErrors.name = t('required');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        // Honeypot — if filled, silently pretend success without sending.
        if (honeypotRef.current?.value) {
            setIsSent(true);
            setIsSubmitting(false);
            return;
        }

        const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;
        if (!accessKey) {
            setErrors({ general: t('error_submission_failed') });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: accessKey,
                    subject: 'New Project Request from Portfolio Wizard',
                    from_name: selections.name,
                    reply_to: selections.email,
                    project_type: selections.type,
                    vibe: selections.vibe,
                    budget: selections.budget,
                    botcheck: '',
                    message: `
Name: ${selections.name}
Email: ${selections.email}
Project Type: ${selections.type}
Vibe/Style: ${selections.vibe}
Budget Range: ${selections.budget}

Details:
${selections.details}
                    `.trim()
                }),
            });

            const result = await response.json();
            if (result.success) {
                setIsSent(true);
                // Track analytics event
                trackEvent('generate_lead', {
                    form_type: 'project_wizard'
                });
            } else {
                setErrors({ general: result.message || t('error_submission_failed') });
            }
        } catch {
            setErrors({ general: t('error_network') });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSent) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-purple/20 text-center min-h-[350px] sm:min-h-[400px] flex flex-col items-center justify-center"
            >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4 sm:mb-6">
                    <Check size={28} className="sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">{t('wizard_success_title')}</h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6 sm:mb-8">{t('wizard_success_desc')}</p>
                <button
                    onClick={() => { setIsSent(false); setStep(0); setSelections({ type: '', vibe: '', budget: '', details: '', email: '', name: '' }); }}
                    className="text-brand-purple font-bold hover:underline text-sm sm:text-base"
                >
                    {t('wizard_start_over')}
                </button>
            </motion.div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[400px] sm:min-h-[500px] flex flex-col relative">
            {/* Progress Bar */}
            <div className="h-2 bg-slate-50 dark:bg-slate-800 w-full flex">
                <motion.div
                    className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan"
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / (steps.length + 1)) * 100}%` }}
                ></motion.div>
            </div>

            <div className="p-5 sm:p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6 sm:mb-8">
                    {step > 0 ? (
                        <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                        </button>
                    ) : <div></div>}
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
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
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">{steps[step].title}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {steps[step].options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSelect(steps[step].id, option.id)}
                                        className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 sm:gap-4 group
                                            ${selections[steps[step].id as keyof typeof selections] === option.id
                                                ? 'border-brand-purple bg-brand-purple/5 dark:bg-brand-purple/20 ring-4 ring-brand-purple/10'
                                                : 'border-slate-100 dark:border-slate-800 hover:border-brand-purple/50 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                    >
                                        <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-200">{option.icon}</span>
                                        <span className={`text-sm sm:text-base font-bold ${selections[steps[step].id as keyof typeof selections] === option.id ? 'text-brand-purple' : 'text-slate-600 dark:text-slate-300'}`}>
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
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('wizard_final_title')}</h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-6">{t('wizard_final_desc')}</p>

                            {/* noValidate: use the component's own translated,
                                styled validation instead of the browser's native
                                bubbles (which would otherwise preempt handleSubmit
                                and show untranslated, off-theme messages). */}
                            <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col gap-3 sm:gap-4">
                                {/* Honeypot — invisible to humans, bots fill it and get silently rejected. */}
                                <input
                                    ref={honeypotRef}
                                    type="text"
                                    name="botcheck"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    aria-hidden="true"
                                    style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
                                />
                                <textarea
                                    className="w-full flex-1 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple resize-none min-h-[100px] sm:min-h-[120px] text-sm sm:text-base text-slate-900 dark:text-white"
                                    placeholder={t('wizard_detail_placeholder')}
                                    value={selections.details}
                                    onChange={(e) => setSelections({ ...selections, details: e.target.value })}
                                    required
                                ></textarea>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            id="wizard-email"
                                            placeholder={t('emailLabel')}
                                            value={selections.email}
                                            onChange={(e) => { setSelections({ ...selections, email: e.target.value }); setErrors({ ...errors, email: undefined }); }}
                                            className={`w-full p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 border ${errors.email ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-brand-purple/20 focus:border-brand-purple'} rounded-xl focus:outline-none focus:ring-2 text-sm sm:text-base text-slate-900 dark:text-white`}
                                            required
                                            aria-invalid={errors.email ? 'true' : 'false'}
                                            aria-describedby={errors.email ? 'email-error' : undefined}
                                        />
                                        {errors.email && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                id="email-error"
                                                className="text-red-500 text-xs mt-1 flex items-center gap-1"
                                                role="alert"
                                            >
                                                <span>⚠️</span> {errors.email}
                                            </motion.p>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="wizard-name"
                                            placeholder={t('nameLabel')}
                                            value={selections.name}
                                            onChange={(e) => { setSelections({ ...selections, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                                            className={`w-full p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 border ${errors.name ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-brand-purple/20 focus:border-brand-purple'} rounded-xl focus:outline-none focus:ring-2 text-sm sm:text-base text-slate-900 dark:text-white`}
                                            required
                                            aria-invalid={errors.name ? 'true' : 'false'}
                                            aria-describedby={errors.name ? 'name-error' : undefined}
                                        />
                                        {errors.name && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                id="name-error"
                                                className="text-red-500 text-xs mt-1 flex items-center gap-1"
                                                role="alert"
                                            >
                                                <span>⚠️</span> {errors.name}
                                            </motion.p>
                                        )}
                                    </div>
                                </div>

                                {errors.general && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                                        role="alert"
                                        aria-live="assertive"
                                    >
                                        <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                            <span>⚠️</span> {errors.general}
                                        </p>
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-1 sm:mt-2 w-full py-3 sm:py-4 bg-slate-900 dark:bg-brand-purple text-white rounded-xl font-bold text-base sm:text-lg hover:bg-brand-purple dark:hover:bg-brand-purpleLight transition-all shadow-lg hover:shadow-brand-purple/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? (
                                        t('sending')
                                    ) : (
                                        <>
                                            <Sparkles size={18} className="sm:w-5 sm:h-5 text-brand-gold group-hover:animate-spin-slow" />
                                            <span className="text-sm sm:text-base">{t('wizard_btn_send')}</span>
                                            {language === 'he' || language === 'ar' ? (
                                                <ArrowLeft size={16} className="sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                                            ) : (
                                                <ArrowRight size={16} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                            )}
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
