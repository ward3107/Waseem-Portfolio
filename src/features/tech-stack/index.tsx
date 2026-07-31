import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { TECH_STACK } from '@/constants';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Gift, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInView } from '@/shared/hooks/useInView';
import { TIERS, WIN_CLICKS, tierForClicks, bossForClicks, type Tier } from './config';
import { playSound } from './audio';
import BossOverlay from './BossOverlay';
import DiscountReward from './DiscountReward';
import TechCard from './TechCard';
import FlashMessage from './FlashMessage';

const BURST_COLORS = ['#f5c518', '#22d3ee', '#a78bfa', '#f472b6', '#ffffff'];

const formatPercent = (p: number): string => `${p}%`;

const MilestoneBurst: React.FC = () => (
  <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
    {Array.from({ length: 28 }).map((_, i) => {
      const angle = (i / 28) * Math.PI * 2;
      const dist = 180 + Math.random() * 120;
      return (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            opacity: 0,
            scale: 0.4,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="absolute w-2 h-3 rounded-sm"
          style={{
            backgroundColor: BURST_COLORS[i % BURST_COLORS.length],
            willChange: 'transform, opacity',
          }}
        />
      );
    })}
  </div>
);

const TechStack: React.FC = () => {
  const { t } = useLanguage();
  const row = [...TECH_STACK, ...TECH_STACK, ...TECH_STACK];

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState(0);
  const [currentTier, setCurrentTier] = useState<Tier | null>(null);

  const [activeBoss, setActiveBoss] = useState<{ health: number } | null>(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [autoOpenedFinal, setAutoOpenedFinal] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [redeemPulseKey, setRedeemPulseKey] = useState(0);
  const [flashMsg, setFlashMsg] = useState<{ title: string; sub: string; color: string } | null>(
    null
  );

  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clicksRef = useRef(0);

  const showFlash = (msg: { title: string; sub: string; color: string }, ms: number) => {
    setFlashMsg(msg);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => {
      setFlashMsg(null);
      flashTimerRef.current = null;
    }, ms);
  };

  const fireBurst = () => {
    setBurstKey((k) => k + 1);
    if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    burstTimerRef.current = setTimeout(() => {
      burstTimerRef.current = null;
    }, 1200);
  };

  useEffect(
    () => () => {
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    },
    []
  );

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const gridBackgroundPositionY = useTransform(scrollYProgress, [0, 1], ['0px', '320px']);
  const inView = useInView(sectionRef, '150px');
  const marqueePlayState = inView ? 'running' : 'paused';

  const stage = currentTier?.stage ?? 1;
  const marqueeDuration = currentTier?.marqueeSpeed ?? '60s';

  const triggerShake = () => {
    setShake(10);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(() => {
      setShake(0);
      shakeTimerRef.current = null;
    }, 200);
  };

  const checkEvents = useCallback(
    (currentClicks: number) => {
      const newTier = TIERS.find((tier) => tier.clicks === currentClicks);
      if (newTier) {
        setCurrentTier(newTier);
        setRedeemPulseKey((k) => k + 1);

        const isFinal = currentClicks === WIN_CLICKS;
        if (isFinal) {
          if (!autoOpenedFinal) {
            setShowDiscount(true);
            setAutoOpenedFinal(true);
          }
          playSound('finale');
          fireBurst();
          showFlash(
            {
              title: t('tech_win_title'),
              sub: formatPercent(newTier.percent),
              color: 'border-brand-gold',
            },
            3200
          );
        } else if (newTier.isMajor) {
          playSound('milestone');
          fireBurst();
          showFlash(
            {
              title: t('tech_milestone_flash_title'),
              sub: `${t('tech_milestone_flash_sub')} · ${formatPercent(newTier.percent)}`,
              color: 'border-brand-gold',
            },
            2600
          );
        } else {
          playSound('tier');
          showFlash(
            {
              title: `${t('tech_tier_flash_title')} · ${formatPercent(newTier.percent)}`,
              sub: t('tech_tier_flash_sub'),
              color: 'border-brand-cyan',
            },
            1500
          );
        }
      }

      const boss = bossForClicks(currentClicks);
      if (boss) {
        setActiveBoss({ health: boss.health });
      }
    },
    [autoOpenedFinal, t]
  );

  const handlePop = useCallback(() => {
    setScore((s) => s + stage * 100);
    clicksRef.current += 1;
    checkEvents(clicksRef.current);
    setCombo((c) => c + 1);

    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => setCombo(0), 1500);
  }, [stage, checkEvents]);

  const handleBossDefeat = () => {
    setActiveBoss(null);
    setScore((s) => s + 5000);
    showFlash(
      {
        title: 'THREAT NEUTRALIZED',
        sub: '+5000 POINTS',
        color: 'border-brand-gold',
      },
      2500
    );
  };

  const openRedeem = () => {
    if (!currentTier) return;
    setShowDiscount(true);
  };

  const chaosStyle = stage >= 2 ? { transform: 'perspective(1000px) rotateX(10deg)' } : {};

  const displayedTier = useMemo(() => currentTier ?? tierForClicks(clicksRef.current), [
    currentTier,
  ]);

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 md:py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col justify-center border-t border-slate-200 dark:border-slate-900 min-h-[500px] sm:min-h-[600px] transition-colors duration-300">
      <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 overflow-hidden" aria-hidden="true">
        <motion.div
          className={`absolute inset-0 bg-[linear-gradient(rgba(72,58,160,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(72,58,160,0.22)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(140,120,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(140,120,255,0.12)_1px,transparent_1px)] bg-[size:40px_40px] [transform-style:preserve-3d] [perspective:1000px] opacity-40 dark:opacity-30 ${stage >= 2 ? 'animate-pulse' : ''}`}
          style={{ willChange: 'opacity, background-position', backgroundPositionY: gridBackgroundPositionY }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-slate-50 dark:to-slate-950"></div>
        </motion.div>
      </div>

      <AnimatePresence>
        {activeBoss && <BossOverlay health={activeBoss.health} onDefeat={handleBossDefeat} />}
      </AnimatePresence>
      <AnimatePresence>
        {showDiscount && displayedTier && (
          <DiscountReward
            onClose={() => setShowDiscount(false)}
            percent={displayedTier.percent}
            code={displayedTier.code}
            isFinal={displayedTier.clicks === WIN_CLICKS}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {flashMsg && (
          <FlashMessage text={flashMsg.title} subtext={flashMsg.sub} color={flashMsg.color} />
        )}
      </AnimatePresence>
      {burstKey > 0 && <MilestoneBurst key={burstKey} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 text-center mb-8 sm:mb-10 md:mb-12 relative z-20">
        <motion.h2
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white text-center mb-3 sm:mb-4 font-heading uppercase tracking-widest dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        >
          {t('tech_title_1')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">
            {t('tech_title_2')}
          </span>{' '}
          {t('tech_title_3')}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-4 sm:mb-6"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 0 0 rgba(234, 179, 8, 0.7)',
                '0 0 20px 5px rgba(234, 179, 8, 0.4)',
                '0 0 0 0 rgba(234, 179, 8, 0)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-brand-gold via-amber-400 to-brand-gold rounded-full border-2 border-amber-300/50 shadow-lg"
            style={{ willChange: 'transform, box-shadow' }}
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="text-lg sm:text-xl"
            >
              ✨
            </motion.span>
            <span className="font-bold text-white text-xs sm:text-sm md:text-base drop-shadow-md">
              {t('tech_discount_badge')}
            </span>
            <motion.span
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="text-lg sm:text-xl"
            >
              🎁
            </motion.span>
          </motion.div>
        </motion.div>

        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
          <motion.div
            animate={{ x: shake ? [-shake, shake, -shake, shake, 0] : 0 }}
            className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-8 p-3 sm:p-4 bg-white dark:bg-slate-900/80 border-y border-slate-200 dark:border-slate-800 backdrop-blur-md w-full max-w-3xl rounded-xl relative"
            style={{ willChange: 'transform' }}
          >
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-cyan"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-cyan"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-cyan"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-cyan"></div>

            <div className="flex flex-col items-center min-w-[70px] sm:min-w-[100px] md:min-w-[120px]">
              <span className="text-[8px] sm:text-[10px] text-brand-purple uppercase tracking-widest font-bold">
                {t('tech_score')}
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-slate-900 dark:text-white dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                {String(score).padStart(6, '0')}
              </span>
            </div>

            <div className="flex flex-col items-center min-w-[70px] sm:min-w-[100px] md:min-w-[120px] border-x border-slate-200 dark:border-slate-800 px-3 sm:px-4 md:px-8">
              <span className="text-[8px] sm:text-[10px] text-brand-gold uppercase tracking-widest font-bold flex items-center gap-1 justify-center">
                <ShieldAlert size={8} /> {t('tech_weapon')}
              </span>
              <div className="text-sm sm:text-base md:text-lg font-bold font-mono mt-1 text-slate-900 dark:text-white">
                {stage === 1 ? (
                  'STD'
                ) : stage === 2 ? (
                  <span className="text-brand-cyan animate-pulse">RAPID</span>
                ) : (
                  <span className="text-red-500 animate-pulse">BOMB</span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center min-w-[70px] sm:min-w-[100px] md:min-w-[120px] relative">
              <span className="text-[8px] sm:text-[10px] text-brand-cyan uppercase tracking-widest font-bold">
                {t('tech_combo')}
              </span>
              <motion.span
                key={combo}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1.2 }}
                className={`text-xl sm:text-2xl md:text-3xl font-black italic font-heading ${combo > 5 ? 'text-brand-gold' : 'text-slate-600 dark:text-slate-400'}`}
              >
                x{combo}
              </motion.span>
            </div>

            <div className="flex flex-col items-center min-w-[70px] sm:min-w-[100px] md:min-w-[120px] border-l border-slate-200 dark:border-slate-800 pl-3 sm:pl-4 md:pl-8">
              <span className="text-[8px] sm:text-[10px] text-brand-gold uppercase tracking-widest font-bold">
                {t('tech_discount')}
              </span>
              <motion.span
                key={redeemPulseKey}
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.25, 1] }}
                transition={{ duration: 0.5 }}
                className={`text-xl sm:text-2xl md:text-3xl font-mono font-bold ${currentTier ? 'text-brand-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'text-slate-400 dark:text-slate-600'}`}
              >
                {currentTier ? formatPercent(currentTier.percent) : '—'}
              </motion.span>
              <button
                type="button"
                onClick={openRedeem}
                disabled={!currentTier}
                aria-label={
                  currentTier
                    ? `${t('tech_redeem')} ${formatPercent(currentTier.percent)}`
                    : t('tech_locked')
                }
                className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold/70 ${
                  currentTier
                    ? 'bg-brand-gold text-slate-900 hover:bg-yellow-400 shadow-[0_0_12px_rgba(212,175,55,0.5)] animate-pulse'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                <Gift size={9} />
                {currentTier ? t('tech_redeem') : t('tech_locked')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div
        className={`flex flex-col gap-6 sm:gap-8 md:gap-10 relative z-10 pb-6 sm:pb-8 md:pb-10 transition-all duration-200 ${activeBoss ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}
        style={chaosStyle}
        dir="ltr"
      >
        <div
          className="flex w-max hover:[animation-play-state:paused]"
          style={{
            animation: `scroll-left ${marqueeDuration} linear infinite`,
            animationPlayState: marqueePlayState,
          }}
        >
          {row.map((tech, index) => (
            <TechCard
              key={`r1-${index}`}
              tech={tech}
              stage={stage}
              onPop={handlePop}
              triggerShake={triggerShake}
            />
          ))}
        </div>

        <div
          className="flex w-max hover:[animation-play-state:paused]"
          style={{
            animation: `scroll-right ${marqueeDuration} linear infinite`,
            animationPlayState: marqueePlayState,
          }}
        >
          {row.map((tech, index) => (
            <TechCard
              key={`r2-${index}`}
              tech={tech}
              stage={stage}
              onPop={handlePop}
              triggerShake={triggerShake}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
