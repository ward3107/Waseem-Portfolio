import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import ContactForm from './ContactForm';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const Contact: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-purple/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Copy & Info */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-600 text-xs font-bold uppercase tracking-wider mb-8 w-fit"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {t('contact_avail')}
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-heading font-bold text-slate-900 mb-6 leading-tight"
            >
              {t('contact_title_1')} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">{t('contact_title_2')}</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 mb-10 text-lg leading-relaxed max-w-lg"
            >
              {t('contact_desc')}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <a href="mailto:waseem@example.com" className="group flex flex-col p-6 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 hover:border-brand-purple/20 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-brand-purple group-hover:text-white transition-colors mb-4 shadow-sm">
                  <Mail size={20} />
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('contact_email_btn')}</p>
                <p className="font-bold text-slate-900 text-lg group-hover:text-brand-purple transition-colors">waseem@example.com</p>
              </a>

              {/* Updated WhatsApp Block to be Green */}
              <a href="https://wa.me/972534260632" className="group flex flex-col p-6 bg-green-50/50 hover:bg-green-50 rounded-2xl border border-green-100 hover:border-green-300 hover:shadow-xl hover:shadow-green-100 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-white border border-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors mb-4 shadow-sm">
                  <MessageSquare size={20} />
                </div>
                <p className="text-xs text-green-600/80 font-bold uppercase tracking-wider mb-1">{t('contact_whatsapp_btn')}</p>
                <p className="font-bold text-slate-900 text-lg group-hover:text-green-700 transition-colors">+972 53 426 0632</p>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
             {/* Decorative element behind form */}
             <div className="absolute inset-0 bg-gradient-to-tr from-brand-purple/20 to-brand-cyan/20 rounded-3xl blur-2xl transform rotate-3 scale-95 -z-10"></div>
             <ContactForm />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Contact;