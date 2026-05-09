import React, { useState } from 'react';
import { motion, MotionValue } from 'framer-motion';
import { MousePointer2, Calendar, Heart, Sparkles } from 'lucide-react';

interface ProfileCardProps {
  t: (key: string) => string;
  prefersReducedMotion: boolean;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  layer1X: MotionValue<number>;
  layer1Y: MotionValue<number>;
  layer2X: MotionValue<number>;
  layer2Y: MotionValue<number>;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  t,
  prefersReducedMotion,
  rotateX,
  rotateY,
  layer1X,
  layer1Y,
  layer2X,
  layer2Y,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative lg:h-[500px] h-[280px] sm:h-[350px] flex items-center justify-center [perspective:2000px]"
    >
      <motion.div
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        animate={
          prefersReducedMotion
            ? { rotateY: isFlipped ? 180 : 0 }
            : { rotateY: [0, 0, 0, isFlipped ? 180 : 0] }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                rotateY: {
                  times: [0, 0.2, 0.4, 1],
                  duration: 2,
                  ease: 'easeInOut',
                  repeat: 1,
                  repeatDelay: 3,
                },
              }
        }
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
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.6, type: 'spring', stiffness: 100 }
          }
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full"
        >
          {/* Front */}
          <div className="absolute inset-0 w-full h-full bg-slate-900 rounded-3xl p-1 shadow-2xl backface-hidden">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-50 mix-blend-overlay"></div>
            <div className="w-full h-full bg-slate-800 rounded-[20px] overflow-hidden relative">
              <img
                src="/assets/waseem-profile.webp"
                alt={t('hero_profile_alt')}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                width="512"
                height="640"
                className="object-cover w-full h-full opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pt-20">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-brand-cyan/20 text-brand-cyan text-[10px] font-bold uppercase tracking-wider rounded border border-brand-cyan/20 backdrop-blur-md">
                    {t('hero_card_role')}
                  </span>
                  <motion.div
                    animate={prefersReducedMotion ? {} : { x: [0, 5, 0] }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                    }
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

          {/* Back */}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-brand-purple rounded-3xl p-3 sm:p-4 md:p-6 shadow-2xl backface-hidden"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-3 md:mb-6">
                <div className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-2 md:mb-4 rounded-full bg-gradient-to-br from-brand-purple to-brand-cyan flex items-center justify-center">
                  <span className="text-xl md:text-3xl">👨‍💻</span>
                </div>
                <h3 className="text-white text-lg md:text-2xl font-heading font-bold mb-1 md:mb-2">About Me</h3>
                <div className="w-12 md:w-16 h-1 bg-brand-gold mx-auto rounded-full"></div>
              </div>

              <div className="space-y-2 md:space-y-4">
                <div className="flex items-center gap-2 md:gap-3 bg-white/5 rounded-xl p-2 md:p-3 backdrop-blur-sm">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-purple/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="text-brand-purple w-4 h-4 md:w-[18px] md:h-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-wider">Born</p>
                    <p className="text-white font-bold text-xs md:text-sm">June 6, 1984</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 bg-white/5 rounded-xl p-2 md:p-3 backdrop-blur-sm">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center flex-shrink-0">
                    <Heart className="text-brand-cyan w-4 h-4 md:w-[18px] md:h-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-wider">Passion</p>
                    <p className="text-white font-bold text-xs md:text-sm leading-tight">Coding & Building Digital Worlds</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 bg-white/5 rounded-xl p-2 md:p-3 backdrop-blur-sm">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="text-brand-gold w-4 h-4 md:w-[18px] md:h-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-wider">Powered By</p>
                    <p className="text-white font-bold text-xs md:text-sm leading-tight">Learning & Evolving with AI</p>
                  </div>
                </div>
              </div>

              <p className="hidden md:block text-center text-slate-400 text-xs mt-6 italic">{t('hero_card_flip_hint')}</p>
            </div>
          </div>
        </motion.div>

        {!prefersReducedMotion && (
          <>
            <motion.div
              style={{ x: layer2X, y: layer2Y, z: 50 }}
              className="hidden md:flex absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-white p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-100 flex-col items-center gap-1 sm:gap-2 transform translate-z-20"
            >
              <span className="text-xl sm:text-2xl md:text-3xl">🚀</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-900">{t('hero_badge_perf')}</span>
            </motion.div>

            <motion.div
              style={{ x: layer1X, y: layer1Y, z: 30 }}
              className="hidden md:flex absolute -bottom-6 sm:-bottom-8 -left-6 sm:-left-8 bg-slate-800 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl border border-slate-700 items-center gap-2 sm:gap-3 transform translate-z-10"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-purple flex items-center justify-center text-white">
                <span className="font-bold text-xs sm:text-sm">AI</span>
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-wider">
                  {t('services_badge')}
                </p>
                <p className="text-white font-bold text-xs sm:text-sm">{t('hero_badge_ai')}</p>
              </div>
            </motion.div>

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
  );
};

export default ProfileCard;
