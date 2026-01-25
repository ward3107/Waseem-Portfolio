import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';
import { ArrowRight, Download, MousePointer2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Hero: React.FC = () => {
  const { t } = useLanguage();
  // Mouse position state for parallax
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring animation for the mouse values
  const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

  // Transformations for the 3D Card
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);
  
  // Transformations for Floating Elements (Parallax layers)
  const layer1X = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);
  const layer1Y = useTransform(mouseY, [-0.5, 0.5], [-20, 20]);
  
  const layer2X = useTransform(mouseX, [-0.5, 0.5], [30, -30]);
  const layer2Y = useTransform(mouseY, [-0.5, 0.5], [30, -30]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate normalized mouse position (-0.5 to 0.5)
    const normalizedX = (e.clientX - rect.left) / width - 0.5;
    const normalizedY = (e.clientY - rect.top) / height - 0.5;
    
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleStartProject = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      // Focus the name input after scroll
      setTimeout(() => {
        const nameInput = document.getElementById('name');
        if (nameInput) nameInput.focus();
      }, 1000);
    }
  };

  const handleViewWork = (e: React.MouseEvent) => {
    e.preventDefault();
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Standard letter animation
  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.03, // Fast typing
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }),
  };

  // "experiences" animation - Dramatic Zoom In Pop
  const emphasizedVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 5, // Start HUGE (5x size)
      y: 0, 
      filter: "blur(10px)", 
    },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: 0.8 + (i * 0.06), // Start after "I craft digital"
        type: "spring",
        damping: 15,
        stiffness: 250, // Snappy spring
        mass: 0.5
      }
    }),
  };

  // Part 3 animation - delayed after "experiences"
  const part3Variants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 2.0 + (i * 0.03), // Start after "experiences" finishes
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }),
  };

  return (
    <section 
      id="hero" 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center pt-20 overflow-visible bg-slate-50 perspective-1000"
    >
      {/* Dynamic Background Spotlight & Waves */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         {/* Base Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         
         {/* Original Purple Mouse Follower */}
         <motion.div 
            style={{ 
                left: useTransform(mouseX, [-0.5, 0.5], ['40%', '60%']), 
                top: useTransform(mouseY, [-0.5, 0.5], ['40%', '60%']) 
            }}
            className="absolute w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
         />

         {/* Fresh Green Wave on the Right Side */}
         <div className="absolute top-0 right-0 h-full w-[60%] pointer-events-none opacity-80">
            {/* Primary Wave */}
            <motion.div
                animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 3, 0],
                    x: [0, 20, 0]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[20%] -right-[20%] w-[900px] h-[1000px] bg-gradient-to-bl from-emerald-100/50 via-teal-50/30 to-transparent rounded-[40%] blur-[80px]"
            />
            {/* Secondary Wave for Depth */}
            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    y: [0, -40, 0]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[20%] -right-[30%] w-[700px] h-[700px] bg-gradient-to-bl from-brand-green/5 via-green-100/20 to-transparent rounded-full blur-[90px]"
            />
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Text Content */}
        <div className="relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center px-3 py-1 rounded-full border border-brand-green/30 bg-green-50 text-brand-green text-xs font-bold uppercase tracking-wider mb-6 shadow-sm"
          >
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            {t('hero_badge')}
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold leading-tight mb-8 text-slate-900 tracking-tight">
            {/* Part 1: I craft digital */}
            {Array.from(t('hero_title_1')).map((char, index) => (
                <motion.span
                    key={`p1-${index}`}
                    custom={index}
                    variants={letterVariants}
                    initial="hidden"
                    animate="visible"
                    className="inline-block whitespace-pre"
                >
                    {char}
                </motion.span>
            ))}
            <br/>
            
            {/* Part 2: experiences - The "Zoom In" Effect */}
            {/* Using solid color to ensure visibility, z-index to stay on top */}
            <span className="relative inline-block z-50 mr-2">
                <span className="relative z-50 text-brand-purple whitespace-nowrap">
                    {Array.from(t('hero_title_2')).map((char, index) => (
                        <motion.span
                            key={`p2-${index}`}
                            custom={index} 
                            variants={emphasizedVariants}
                            initial="hidden"
                            animate="visible"
                            className="inline-block"
                            style={{ transformOrigin: "center bottom" }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </span>
                {/* Underline Decoration */}
                <motion.span 
                    style={{ x: layer1X }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 2.2, duration: 0.8, ease: "easeOut" }}
                    className="absolute -bottom-2 left-0 right-0 h-3 md:h-5 bg-brand-gold/30 -skew-x-12 -z-10 rounded-full blur-sm origin-left"
                ></motion.span>
            </span>
            
            {/* Part 3: that feel alive. */}
            <br className="hidden md:inline" />
            
            {/* "that " - Standard */}
            {Array.from(t('hero_title_3')).map((char, index) => (
                <motion.span
                    key={`p3-a-${index}`}
                    custom={index}
                    variants={part3Variants}
                    initial="hidden"
                    animate="visible"
                    className="inline-block whitespace-pre"
                >
                    {char}
                </motion.span>
            ))}

            {/* "feel alive." - Soulful Gradient & Serif Font */}
            <span className="inline-block relative">
                {/* Breathing glow effect behind the text - Darker glow to fix "too light" issue */}
                <motion.span
                    animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-brand-purple/20 blur-xl rounded-full"
                ></motion.span>
                
                {Array.from(t('hero_title_4')).map((char, index) => (
                    <motion.span
                        key={`p3-b-${index}`}
                        custom={index + 5} // Offset for "that "
                        variants={part3Variants}
                        initial="hidden"
                        animate="visible"
                        className="inline-block whitespace-pre font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-brand-purpleDark via-fuchsia-600 to-brand-purpleDark bg-[length:200%_auto] relative z-10"
                    >
                        {char}
                    </motion.span>
                ))}
            </span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.6 }}
            className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg leading-relaxed font-medium"
          >
            {t('hero_subtitle')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.7, duration: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#contact"
              onClick={handleStartProject}
              className="group px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl shadow-brand-purple/20 transition-all flex items-center gap-3"
            >
              {t('hero_cta_start')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#projects"
              onClick={handleViewWork}
              className="px-8 py-4 bg-white text-slate-800 border-2 border-slate-100 rounded-full font-bold text-lg hover:border-brand-purple/30 hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              {t('hero_cta_view')}
            </motion.a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.9, duration: 0.8 }}
            className="mt-12 flex items-center gap-8 border-t border-slate-200/60 pt-8"
          >
             <div className="flex -space-x-3">
                {[1,2,3,4].map((i) => (
                    <img key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src={`https://picsum.photos/seed/user${i}/100`} alt="Client" />
                ))}
             </div>
             <div>
                <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map(i => <span key={i} className="text-brand-gold text-sm">★</span>)}
                </div>
                <p className="text-sm font-bold text-slate-700">{t('hero_trust')}</p>
             </div>
          </motion.div>
        </div>

        {/* 3D Interactive Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative lg:h-[600px] flex items-center justify-center [perspective:2000px]"
        >
          <motion.div
            style={{ 
                rotateX, 
                rotateY,
                transformStyle: "preserve-3d" 
            }}
            className="relative w-80 h-[480px] bg-slate-900 rounded-3xl p-1 shadow-2xl transition-shadow duration-300"
          >
            {/* Glossy Reflection overlay */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-50 mix-blend-overlay"></div>
            
            <div className="w-full h-full bg-slate-800 rounded-[20px] overflow-hidden relative">
              <img
                 src="https://picsum.photos/id/338/600/800"
                 alt="Waseem Profile"
                 className="object-cover w-full h-full opacity-90 hover:scale-105 transition-transform duration-700"
              />
              
              {/* Card Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pt-20">
                <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-brand-cyan/20 text-brand-cyan text-[10px] font-bold uppercase tracking-wider rounded border border-brand-cyan/20 backdrop-blur-md">
                        {t('hero_card_role')}
                    </span>
                    <MousePointer2 size={16} className="text-slate-400 animate-bounce" />
                </div>
                <h3 className="text-white text-3xl font-heading font-bold">Waseem</h3>
                <p className="text-slate-300 text-sm">{t('hero_card_desc')}</p>
              </div>
            </div>

            {/* Floating Parallax Elements (Pop out of card) */}
            
            {/* Element 1: Top Right Badge */}
            <motion.div 
                style={{ x: layer2X, y: layer2Y, z: 50 }}
                className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-2 transform translate-z-20"
            >
               <span className="text-3xl">🚀</span>
               <span className="text-xs font-bold text-slate-900">{t('hero_badge_perf')}</span>
            </motion.div>

            {/* Element 2: Bottom Left Stat */}
            <motion.div 
                style={{ x: layer1X, y: layer1Y, z: 30 }}
                className="absolute -bottom-8 -left-8 bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 transform translate-z-10"
            >
               <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white">
                 <span className="font-bold">AI</span>
               </div>
               <div>
                 <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t('services_badge')}</p>
                 <p className="text-white font-bold">{t('hero_badge_ai')}</p>
               </div>
            </motion.div>

             {/* Element 3: Decorative Floating Shapes */}
             <motion.div 
                style={{ x: layer2X, y: layer1Y, z: -20 }}
                className="absolute top-1/2 -right-20 w-16 h-16 bg-brand-gold rounded-full blur-2xl opacity-40 animate-pulse"
             />
             <motion.div 
                style={{ x: layer1X, y: layer2Y, z: -20 }}
                className="absolute -top-10 -left-10 w-32 h-32 bg-brand-purple rounded-full blur-3xl opacity-30"
             />

          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;