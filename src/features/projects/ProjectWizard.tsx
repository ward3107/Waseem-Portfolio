import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { trackEvent } from '@/lib/browser';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import { getAttribution } from '@/lib/attribution';

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

    // Tracked so the 300ms auto-advance can't fire after unmount (nav
    // change, language switch that remounts) — otherwise React 18 warns
    // about setState on an unmounted component.
    const advanceTimerRef = useRef<number | null>(null);
    useEffect(
        () => () => {
            if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
        },
        []
    );

    const handleSelect = (key: string, value: string) => {
        setSelections({ ...selections, [key]: value });
        if (step < steps.length) {
            if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
            advanceTimerRef.current = window.setTimeout(() => {
                // Functional update avoids advancing from a stale `step` capture.
                setStep((s) => s + 1);
                advanceTimerRef.current = null;
            }, 300);
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

        // Attribution: what URL/UTMs did this visitor arrive on? Snapshotted
        // once on first paint (main.tsx → captureAttribution).
        const attrib = getAttribution();

        // Primary path: insert into the Supabase `leads` table so the data
        // lives in Waseem's own DB (queryable, attributable, exportable).
        // Fallback: Web3Forms — for the case where Supabase env isn't set
        // (dev / an unconfigured deployment) or the insert throws.
        const submitViaSupabase = async (): Promise<boolean> => {
            if (!isSupabaseConfigured) return false;
            // Imported here rather than at module scope: this wizard renders
            // inside <Contact>, which /contact loads eagerly, so a top-level
            // import put all of supabase-js (~56 KB gzipped) in the entry
            // chunk every visitor downloads — to serve a client that is only
            // ever used on this one form submission.
            const { supabase } = await import('@/lib/supabaseClient');
            const { error } = await supabase.from('leads').insert({
                name: selections.name,
                email: selections.email,
                project_type: selections.type || null,
                vibe: selections.vibe || null,
                budget: selections.budget || null,
                details: selections.details || null,
                language,
                utm_source: attrib.utm_source,
                utm_medium: attrib.utm_medium,
                utm_campaign: attrib.utm_campaign,
                referrer: attrib.referrer,
                landing_path: attrib.landing_path,
            });
            if (error) {
                // Log for debugging; return false so the caller falls back.
                console.warn('[leads] supabase insert failed, will fall back to Web3Forms:', error.message);
                return false;
            }
            return true;
        };

        const submitViaWeb3Forms = async (): Promise<{ ok: boolean; msg?: string }> => {
            const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;
            if (!accessKey) return { ok: false, msg: t('error_submission_failed') };

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        access_key: accessKey,
                        subject: 'New Project Request from Portfolio Wizard',
                        from_name: selections.name,
                        replyto: selections.email,
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
Language: ${language}
UTM: ${attrib.utm_source || '-'} / ${attrib.utm_medium || '-'} / ${attrib.utm_campaign || '-'}
Referrer: ${attrib.referrer || '-'}
Landing path: ${attrib.landing_path || '-'}

Details:
${selections.details}
                        `.trim(),
                    }),
                });
                const result = await response.json();
                return { ok: !!result.success, msg: result.message };
            } catch {
                return { ok: false, msg: t('error_network') };
            }
        };

        try {
            const supaOk = await submitViaSupabase();
            if (supaOk) {
                setIsSent(true);
                trackEvent('generate_lead', {
                    form_type: 'project_wizard',
                    sink: 'supabase',
                    utm_source: attrib.utm_source ?? 'direct',
                });
                return;
            }
            const web = await submitViaWeb3Forms();
            if (web.ok) {
                setIsSent(true);
                trackEvent('generate_lead', {
                    form_type: 'project_wizard',
                    sink: 'web3forms',
                    utm_source: attrib.utm_source ?? 'direct',
                });
            } else {
                setErrors({ general: web.msg || t('error_submission_failed') });
            }
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
        <div
            id="project-wizard"
            tabIndex={-1}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[400px] sm:min-h-[500px] flex flex-col relative focus:outline-none"
        >
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
                        <button
                            type="button"
                            aria-label={t('aria_back')}
                            onClick={() => {
                                // Cancel a pending auto-advance, otherwise tapping
                                // Back within 300ms of selecting an option gets
                                // overridden by the timer and bounces forward.
                                if (advanceTimerRef.current !== null) {
                                    window.clearTimeout(advanceTimerRef.current);
                                    advanceTimerRef.current = null;
                                }
                                setStep(step - 1);
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft size={18} className="sm:w-5 sm:h-5 rtl:rotate-180" aria-hidden="true" />
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
                                        className={`p-3 sm:p-4 rounded-xl border-2 text-start transition-all duration-200 flex items-center gap-3 sm:gap-4 group
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
                                    aria-label={t('form_message_label')}
                                    placeholder={t('wizard_detail_placeholder')}
                                    value={selections.details}
                                    onChange={(e) => setSelections({ ...selections, details: e.target.value })}
                                ></textarea>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            id="wizard-email"
                                            aria-label={t('form_email_label')}
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
                                            aria-label={t('form_name_label')}
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
