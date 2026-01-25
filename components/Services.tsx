import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, MessageCircle, Code, Globe, Bot, Layout, Box } from 'lucide-react';
import { Service } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const Services: React.FC = () => {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const localizedServices: Service[] = [
    {
      title: t('service_1_title'),
      description: t('service_1_desc'),
      icon: Code,
      color: 'text-brand-purple'
    },
    {
      title: t('service_2_title'),
      description: t('service_2_desc'),
      icon: Layout,
      color: 'text-brand-blue'
    },
    {
      title: t('service_3_title'),
      description: t('service_3_desc'),
      icon: Bot,
      color: 'text-brand-teal'
    },
    {
      title: t('service_4_title'),
      description: t('service_4_desc'),
      icon: Globe,
      color: 'text-brand-orange'
    },
    {
      title: t('service_5_title'),
      description: t('service_5_desc'),
      icon: Box,
      color: 'text-brand-gold'
    }
  ];

  const handleStartProject = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const nameInput = document.getElementById('name');
        if (nameInput) nameInput.focus();
      }, 800);
    }
  };

  const handleModalCTA = () => {
    setSelectedService(null);
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const nameInput = document.getElementById('name');
        if (nameInput) nameInput.focus();
      }, 800);
    }
  };

  return (
    <section 
      id="what-i-do" 
      className="py-24 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center"
    >
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10 w-full">
        
        {/* Header Section */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 shadow-sm mb-6"
          >
            <Sparkles size={14} className="text-brand-gold" />
            <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">{t('services_badge')}</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-bold text-white mb-6"
          >
            {t('services_title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">{t('services_title_2')}</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-slate-400 text-lg"
          >
            {t('services_subtitle')}
          </motion.p>
        </div>

        {/* Clean Uniform Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {localizedServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedService(service)}
                className="cursor-pointer group relative bg-slate-900 border border-slate-800 rounded-2xl p-8 overflow-hidden hover:border-brand-purple/50 transition-all duration-300 flex flex-col h-full"
              >
                {/* Internal Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-brand-purple group-hover:text-white transition-colors duration-300 ${service.color}`}>
                    <Icon size={28} />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-cyan transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                    {service.description}
                  </p>
                  
                  <div className="pt-4 border-t border-slate-800/50 flex items-center text-sm font-bold text-slate-500 group-hover:text-white transition-colors">
                    <span className="mr-2">Learn more</span>
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* CTA Card - Styled to match */}
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.5 }}
             onClick={handleStartProject}
             className="cursor-pointer group relative bg-gradient-to-br from-brand-purple to-brand-purpleDark rounded-2xl p-8 overflow-hidden flex flex-col items-center justify-center text-center h-full border border-brand-purpleLight/20 hover:scale-[1.02] transition-transform duration-300"
          >
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
                    <Sparkles size={32} className="text-brand-gold" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{t('services_cta_title')}</h3>
                <p className="text-purple-200 text-sm mb-6">{t('services_cta_desc')}</p>
                <span className="px-6 py-3 bg-white text-brand-purple font-bold rounded-full hover:shadow-lg transition-all inline-block text-sm">
                   {t('services_cta_btn')}
                </span>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Interactive Popup Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              layoutId={`service-${selectedService.title}`}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="relative w-full max-w-lg bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              {/* Fun Background Pattern */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                 <button 
                   onClick={() => setSelectedService(null)}
                   className="absolute -top-2 -right-2 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-red-500 transition-colors"
                 >
                   <X size={20} />
                 </button>

                 <div className={`w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 border border-slate-700 shadow-[0_0_30px_rgba(72,58,160,0.3)]`}>
                    <selectedService.icon size={40} className={selectedService.color} />
                 </div>
                 
                 <h3 className="text-3xl font-heading font-bold text-white mb-2">
                    {selectedService.title}
                 </h3>
                 
                 <div className="h-1 w-20 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-full mb-6"></div>
                 
                 <p className="text-lg text-slate-300 leading-relaxed font-medium mb-8">
                   {selectedService.description}
                 </p>

                 <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={handleModalCTA}
                        className="w-full px-8 py-3 bg-brand-purple hover:bg-brand-purpleLight text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-purple/40 transform hover:-translate-y-1"
                    >
                        {t('modal_btn')}
                    </button>
                    
                    <a 
                        href={`https://wa.me/972534260632?text=Hi, I'm interested in ${selectedService.title}...`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-slate-400 hover:text-green-500 text-sm font-bold transition-colors py-2"
                    >
                        <MessageCircle size={16} />
                        {t('modal_whatsapp')}
                    </a>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Services;