import { motion, useMotionValue, useSpring, useTransform, Variants, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, MousePointer2, Calendar, Heart, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import { getPrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const Hero: React.FC = () => {
  const { t, language } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = getPrefersReducedMotion();

  // Helper function to split text for animation
  // For Arabic, split by words to preserve letter connections
  // For other languages, split by characters
  const splitForAnimation = (text: string) => {
    if (language === 'ar') {
      return text.split(' ');
    }
    return Array.from(text);
  };
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
    if (prefersReducedMotion) return; // Skip mouse tracking for reduced motion

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
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion ? {
        duration: 0
      } : {
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
      scale: prefersReducedMotion ? 1 : 5,
      y: 0,
      filter: prefersReducedMotion ? "blur(0px)" : "blur(10px)",
    },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: prefersReducedMotion ? {
        duration: 0
      } : {
        delay: 0.4 + (i * 0.04), // Faster: Start after "I craft digital"
        type: "spring",
        damping: 15,
        stiffness: 250, // Snappy spring
        mass: 0.5
      }
    }),
  };

  // Part 3 animation - delayed after "experiences"
  const part3Variants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion ? {
        duration: 0
      } : {
        delay: 1.0 + (i * 0.02), // Faster: Start after "experiences" finishes
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
      className="relative min-h-screen flex items-center pt-20 overflow-visible bg-slate-50 dark:bg-slate-950 perspective-1000 transition-colors duration-300"
    >
      {/* Dynamic Background Spotlight & Waves */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Base Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Original Purple Mouse Follower */}
        <motion.div
          style={{
            left: useTransform(mouseX, [-0.5, 0.5], ['40%', '60%']),
            top: useTransform(mouseY, [-0.5, 0.5], ['40%', '60%']),
            willChange: 'left, top'
          }}
          className="absolute w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
        />

        {/* Fresh Green Wave on the Right Side */}
        {!prefersReducedMotion && (
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
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* Text Content */}
        <div className="relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center px-3 py-1 rounded-full border border-brand-green/30 bg-green-50 dark:bg-green-900/20 text-brand-green text-xs font-bold uppercase tracking-wider mb-6 shadow-sm"
          >
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            {t('hero_badge')}
          </motion.div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold leading-tight mb-4 md:mb-6 lg:mb-8 text-slate-900 dark:text-white tracking-tight break-words hyphens-auto overflow-wrap-anywhere">
            {/* Part 1: I craft digital */}
            {splitForAnimation(t('hero_title_1')).map((char, index) => (
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
            <br />

            {/* Part 2: experiences - The "Zoom In" Effect */}
            {/* Using solid color to ensure visibility, z-index to stay on top */}
            <span className="relative inline-block z-50 mr-2">
              <span className="relative z-50 text-brand-purple">
                {splitForAnimation(t('hero_title_2')).map((char, index) => (
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
                transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
                className="absolute -bottom-2 left-0 right-0 h-3 md:h-5 bg-brand-gold/30 -skew-x-12 -z-10 rounded-full blur-sm origin-left"
              ></motion.span>
            </span>

            {/* Part 3: that feel alive. */}
            <br className="hidden md:inline" />

            {/* "that " - Standard */}
            {splitForAnimation(t('hero_title_3')).map((char, index) => (
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
              {!prefersReducedMotion && (
                <motion.span
                  animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-brand-purple/20 blur-xl rounded-full"
                ></motion.span>
              )}

              {splitForAnimation(t('hero_title_4')).map((char, index) => (
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
            transition={{ delay: 1.4, duration: 0.5 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-6 md:mb-10 max-w-lg leading-relaxed font-medium break-words"
          >
            {t('hero_subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="flex flex-wrap gap-3 md:gap-4"
          >
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#contact"
              onClick={handleStartProject}
              className="group px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-slate-900 dark:bg-brand-purple text-white rounded-full font-bold text-xs sm:text-sm md:text-base shadow-xl hover:shadow-2xl shadow-brand-purple/20 transition-all flex items-center gap-1.5 sm:gap-2 md:gap-3"
            >
              {t('hero_cta_start')}
              {language === 'he' || language === 'ar' ? (
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#projects"
              className="px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-white dark:bg-transparent text-slate-800 dark:text-white border-2 border-slate-100 dark:border-slate-700 rounded-full font-bold text-xs sm:text-sm md:text-base hover:border-brand-purple/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 sm:gap-2"
            >
              {t('hero_cta_view')}
            </motion.a>
          </motion.div>

          {/* Trust Indicators - Simple version without placeholder images */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            className="mt-6 sm:mt-8 md:mt-12 flex items-center gap-3 sm:gap-4 border-t border-slate-200/60 dark:border-slate-800 pt-4 sm:pt-6 md:pt-8"
          >
            <div>
              <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-brand-gold text-[10px] sm:text-xs md:text-sm">★</span>)}
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">{t('hero_trust')}</p>
            </div>
          </motion.div>
        </div>

        {/* 3D Interactive Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative lg:h-[500px] h-[280px] sm:h-[350px] flex items-center justify-center [perspective:2000px]"
        >
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              willChange: 'transform'
            }}
            initial={{ rotateY: [-5, 5, -5, 0] }}
            animate={{ rotateY: [0, 0, 0, isFlipped ? 180 : 0] }}
            transition={{
              rotateY: {
                times: [0, 0.2, 0.4, 1],
                duration: 2,
                ease: "easeInOut",
                repeat: 1,
                repeatDelay: 3
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={isFlipped ? t('hero_card_front_aria') : t('hero_card_back_aria')}
            aria-pressed={isFlipped}
            className="relative w-44 sm:w-56 md:w-64 lg:w-72 h-[260px] sm:h-[320px] md:h-[380px] lg:h-[420px] cursor-pointer group focus:outline-none focus:ring-4 focus:ring-brand-purple/50 rounded-3xl"
            onClick={() => setIsFlipped(!isFlipped)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsFlipped(!isFlipped);
              }
            }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full h-full"
            >
              {/* Front of Card */}
              <div className="absolute inset-0 w-full h-full bg-slate-900 rounded-3xl p-1 shadow-2xl backface-hidden">
                {/* Glossy Reflection overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-50 mix-blend-overlay"></div>

                <div className="w-full h-full bg-slate-800 rounded-[20px] overflow-hidden relative">
                  <img
                    src="/assets/waseem-profile.webp"
                    alt={t('hero_profile_alt')}
                    loading="lazy"
                    className="object-cover w-full h-full opacity-90 group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Card Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pt-20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-brand-cyan/20 text-brand-cyan text-[10px] font-bold uppercase tracking-wider rounded border border-brand-cyan/20 backdrop-blur-md">
                        {t('hero_card_role')}
                      </span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="flex items-center gap-1 text-white/70 text-xs"
                      >
                        <span>Click to flip</span>
                        <MousePointer2 size={14} />
                      </motion.div>
                    </div>
                    <h3 className="text-white text-3xl font-heading font-bold">Waseem</h3>
                    <p className="text-slate-300 text-sm">{t('hero_card_desc')}</p>
                  </div>
                </div>
              </div>

              {/* Back of Card - Personal Details */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-brand-purple rounded-3xl p-6 shadow-2xl backface-hidden"
                style={{ transform: "rotateY(180deg)" }}
              >
                <div className="h-full flex flex-col justify-center">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-purple to-brand-cyan flex items-center justify-center">
                      <span className="text-3xl">👨‍💻</span>
                    </div>
                    <h3 className="text-white text-2xl font-heading font-bold mb-2">About Me</h3>
                    <div className="w-16 h-1 bg-brand-gold mx-auto rounded-full"></div>
                  </div>

                  <div className="space-y-4">
                    {/* Birthday */}
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 backdrop-blur-sm">
                      <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center">
                        <Calendar size={18} className="text-brand-purple" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Born</p>
                        <p className="text-white font-bold text-sm">June 6, 1984</p>
                      </div>
                    </div>

                    {/* Passion */}
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 backdrop-blur-sm">
                      <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center">
                        <Heart size={18} className="text-brand-cyan" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Passion</p>
                        <p className="text-white font-bold text-sm">Coding & Building Digital Worlds</p>
                      </div>
                    </div>

                    {/* Motivation */}
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 backdrop-blur-sm">
                      <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center">
                        <Sparkles size={18} className="text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Powered By</p>
                        <p className="text-white font-bold text-sm">Learning & Evolving with AI</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-slate-400 text-xs mt-6 italic">{t('hero_card_flip_hint')}</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Parallax Elements (Pop out of card) - Disabled for reduced motion */}
            {!prefersReducedMotion && (
              <>
                {/* Element 1: Top Right Badge */}
                <motion.div
                  style={{ x: layer2X, y: layer2Y, z: 50 }}
                  className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-white p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-100 flex flex-col items-center gap-1 sm:gap-2 transform translate-z-20"
                >
                  <span className="text-xl sm:text-2xl md:text-3xl">🚀</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-900">{t('hero_badge_perf')}</span>
                </motion.div>

                {/* Element 2: Bottom Left Stat */}
                <motion.div
                  style={{ x: layer1X, y: layer1Y, z: 30 }}
                  className="absolute -bottom-6 sm:-bottom-8 -left-6 sm:-left-8 bg-slate-800 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl border border-slate-700 flex items-center gap-2 sm:gap-3 transform translate-z-10"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-purple flex items-center justify-center text-white">
                    <span className="font-bold text-xs sm:text-sm">AI</span>
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-wider">{t('services_badge')}</p>
                    <p className="text-white font-bold text-xs sm:text-sm">{t('hero_badge_ai')}</p>
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
              </>
            )}

          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;