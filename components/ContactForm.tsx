import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Zap, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ContactForm: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
        newErrors.email = 'required';
    } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'invalidEmail';
    }

    if (!formData.message.trim()) {
        newErrors.message = 'required';
    } else if (formData.message.trim().length < 10) {
        newErrors.message = 'tooShort';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    // Simulate API call and network delay
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', projectType: '', budget: '', message: '' });
      setErrors({});
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 h-full flex flex-col items-center justify-center text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-green/10 rounded-full blur-3xl -z-10"></div>
        
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-brand-green"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('successMessage')}</h3>
        <p className="text-slate-600 mb-8 max-w-xs mx-auto">{t('successDescription')}</p>
        
        <button 
          onClick={() => setIsSuccess(false)}
          className="px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
        >
          {t('sendAnother')}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
      {/* Purple Glow Effect */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-purple/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Send size={24} className="text-brand-purple" />
                {t('formTitle')}
            </h3>
            <p className="text-slate-500 mb-4">{t('formSubtitle')}</p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-emerald-600">
                <span className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    <CheckCircle2 size={12} /> {t('secureForm')}
                </span>
                <span className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    <Zap size={12} /> {t('autoReply')}
                </span>
                <span className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    <Mail size={12} /> {t('noSpam')}
                </span>
            </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} noValidate aria-label="Contact form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-bold text-slate-700 flex justify-between">
                <span>{t('nameLabel')} <span className="text-red-500">*</span></span>
                {errors.name && <span className="text-red-500 text-xs font-normal flex items-center gap-1"><AlertCircle size={10} /> {t(errors.name)}</span>}
              </label>
              <input 
                type="text" 
                id="name" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-brand-blue focus:ring-brand-blue/30'} focus:ring-4 outline-none transition-all duration-300`} 
                aria-invalid={!!errors.name}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-slate-700 flex justify-between">
                <span>{t('emailLabel')} <span className="text-red-500">*</span></span>
                {errors.email && <span className="text-red-500 text-xs font-normal flex items-center gap-1"><AlertCircle size={10} /> {t(errors.email)}</span>}
              </label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-brand-blue focus:ring-brand-blue/30'} focus:ring-4 outline-none transition-all duration-300`} 
                aria-invalid={!!errors.email}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label htmlFor="projectType" className="text-sm font-bold text-slate-700">{t('projectTypeLabel')}</label>
                <div className="relative">
                    <select 
                        id="projectType" 
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/30 outline-none transition-all duration-300 appearance-none"
                    >
                        <option value="">{t('selectOption')}</option>
                        <option value="website">{t('optWebsite')}</option>
                        <option value="landing-page">{t('optLanding')}</option>
                        <option value="full-stack-app">{t('optFullStack')}</option>
                        <option value="ai-tool">{t('optAI')}</option>
                        <option value="maintenance">{t('optMaintenance')}</option>
                        <option value="other">{t('optOther')}</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 left-auto rtl:right-auto rtl:left-0 flex items-center px-4 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="budget" className="text-sm font-bold text-slate-700">{t('budgetLabel')}</label>
                <div className="relative">
                    <select 
                        id="budget" 
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/30 outline-none transition-all duration-300 appearance-none"
                    >
                        <option value="">{t('selectOption')}</option>
                        <option value="under-5k">{t('budgetUnder5k')}</option>
                        <option value="5k-10k">{t('budget5k10k')}</option>
                        <option value="10k-25k">{t('budget10k25k')}</option>
                        <option value="25k-50k">{t('budget25k50k')}</option>
                        <option value="50k-plus">{t('budget50kPlus')}</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 left-auto rtl:right-auto rtl:left-0 flex items-center px-4 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label htmlFor="message" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    {t('messageLabel')} <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs ${formData.message.length >= 10 ? 'text-green-600' : 'text-slate-400'}`}>
                    {formData.message.length} / 10 {t('minChars')}
                </span>
            </div>
            <textarea 
                id="message" 
                name="message"
                rows={5} 
                value={formData.message}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${errors.message ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-brand-blue focus:ring-brand-blue/30'} focus:ring-4 outline-none transition-all duration-300 resize-none`} 
                aria-invalid={!!errors.message}
                aria-describedby="message-hint"
            ></textarea>
            {errors.message && <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle size={10} /> {t(errors.message)}</p>}
          </div>

          <motion.button 
            type="submit" 
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-brand-purple text-white rounded-xl font-bold hover:bg-brand-purpleDark transition-all shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-2 group relative overflow-hidden"
          >
             {/* Shine Effect */}
             <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
             
             {isLoading ? (
                 <>
                    <Loader2 size={20} className="animate-spin" />
                    {t('sending')}
                 </>
             ) : (
                 <>
                    {t('sendMessage')}
                    <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                 </>
             )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;