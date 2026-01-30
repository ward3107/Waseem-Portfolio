import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TECH_STACK } from '../constants';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Code2, Database, Globe, Cpu, Cloud, Gift, Bug, ShieldAlert } from 'lucide-react';
import { TechItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// --- Game Constants ---
const STAGE_THRESHOLDS = {
  STAGE_2: 20, // Unlocks Rapid Fire & Chaos Movement
  STAGE_3: 50, // Unlocks Bombs
  WIN: 100     // Unlocks Discount
};

// --- Audio Helper ---
const playSound = (type: 'pop' | 'hit' | 'win' | 'boss' | 'shatter' | 'laser' | 'bomb') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();

    // Global volume
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(ctx.destination);
    gainNode.connect(masterGain);

    if (type === 'pop') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'laser') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'bomb') {
      // Deep explosion noise
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * i / bufferSize); // Decay
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      // Lowpass filter for "thud"
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.gain.setValueAtTime(0.8, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      noise.start(now);
    } else if (type === 'shatter') {
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      noise.connect(gainNode);
      noise.start(now);
    } else if (type === 'win') {
      // Victory jingle
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gn.gain.setValueAtTime(0.1, now + i * 0.1);
        gn.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
        osc.connect(gn);
        gn.connect(masterGain);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.3);
      });
    }
  } catch (e) {
    // Ignore audio errors
  }
};

// --- Boss Component ---
interface BossProps {
  onDefeat: () => void;
  health: number;
}

const BossOverlay: React.FC<BossProps> = ({ onDefeat, health: initialHealth }) => {
  const [currentHealth, setCurrentHealth] = useState(initialHealth);
  const controls = useAnimation();
  const { t } = useLanguage();

  const handleHit = async () => {
    const newHealth = currentHealth - 1;
    setCurrentHealth(newHealth);
    playSound('shatter'); // Boss hit sound

    // Shake animation
    await controls.start({
      x: [0, -20, 20, -10, 10, 0],
      transition: { duration: 0.1 }
    });

    if (newHealth <= 0) {
      playSound('bomb'); // Boss death sound
      onDefeat();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="relative bg-slate-900/90 border-2 border-red-500 rounded-lg p-8 max-w-sm w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.4)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent h-full w-full animate-[scan_2s_linear_infinite] pointer-events-none"></div>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-mono font-bold px-4 py-1 rounded-b-lg border border-red-400">
          ⚠ {t('tech_boss_anomaly')}
        </div>

        <motion.div
          animate={controls}
          onClick={handleHit}
          className="cursor-crosshair active:scale-95 transition-transform inline-block mt-6 relative group"
        >
          <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/40 transition-colors"></div>
          <Bug size={140} className="text-red-500 drop-shadow-2xl relative z-10" />
        </motion.div>

        <h3 className="text-3xl font-black text-white mt-6 font-heading uppercase tracking-widest text-red-500 glitch-text">
          {t('tech_boss_name')}
        </h3>

        <div className="mt-6">
          <div className="flex justify-between text-xs font-mono text-red-400 mb-1 uppercase">
            <span>Integrity</span>
            <span>{Math.ceil((currentHealth / initialHealth) * 100)}%</span>
          </div>
          <div className="w-full h-6 bg-slate-950 rounded-sm border border-slate-700 p-1 relative">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${(currentHealth / initialHealth) * 100}%` }}
              className="h-full bg-gradient-to-r from-red-600 to-orange-600"
            />
          </div>
          <p className="text-slate-400 text-[10px] mt-2 font-mono blink">{t('tech_boss_eliminate')}</p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Win Modal Component ---
const DiscountReward = ({ onClose }: { onClose: () => void }) => {
  const { t } = useLanguage();
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateX: 90 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        className="bg-slate-900 border-2 border-brand-gold p-1 rounded-2xl shadow-[0_0_60px_rgba(212,175,55,0.3)] max-w-md w-full relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent"></div>
        <div className="p-8 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(212,175,55,0.1)_0deg,transparent_60deg,rgba(212,175,55,0.1)_120deg,transparent_180deg)] animate-[spin_10s_linear_infinite] pointer-events-none"></div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-24 bg-gradient-to-br from-brand-gold to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-yellow-300 rotate-3 relative z-10"
          >
            <Gift size={48} className="text-slate-900" />
          </motion.div>

          <h2 className="text-4xl font-black text-white mb-2 font-heading tracking-tight relative z-10">
            {t('tech_win_title')}
          </h2>
          <p className="text-slate-300 mb-8 font-mono text-sm relative z-10">
            {t('tech_win_desc')}
          </p>

          <div className="bg-slate-950 border border-slate-700 rounded-lg p-6 mb-8 relative z-10">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2">{t('tech_win_code')}</p>
            <div className="text-3xl font-mono font-bold text-brand-cyan tracking-widest select-all drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              VIBE10
            </div>
          </div>

          <button onClick={onClose} className="w-full py-4 bg-brand-gold hover:bg-yellow-400 text-slate-900 font-bold uppercase tracking-wider rounded-lg shadow-lg relative z-10">
            {t('tech_win_btn')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// --- Tech Card (Physics Object) ---
interface TechCardProps {
  tech: TechItem;
  stage: number;
  onPop: () => void;
  triggerShake: () => void;
}

const TechCard: React.FC<TechCardProps> = ({ tech, stage, onPop, triggerShake }) => {
  const [isBroken, setIsBroken] = useState(false);
  const particleColors = ['bg-brand-purple', 'bg-brand-cyan', 'bg-brand-gold', 'bg-white'];

  const handleInteraction = (e?: React.MouseEvent) => {
    if (isBroken) return;

    setIsBroken(true);
    onPop();

    // Sound logic based on stage
    if (stage >= 3) {
      playSound('bomb'); // Heavy sound
      triggerShake();
    } else if (stage >= 2) {
      playSound('laser'); // Laser sound
    } else {
      playSound('pop'); // Normal pop
    }

    if (navigator.vibrate) navigator.vibrate(stage * 20);

    // Respawn logic (Faster respawn in higher stages)
    const respawnTime = stage >= 2 ? 1000 : 2500;
    setTimeout(() => {
      setIsBroken(false);
    }, respawnTime);
  };

  const handleMouseEnter = () => {
    // Stage 2+ Feature: Auto-fire / Rapid Fire on Hover
    if (stage >= 2) {
      handleInteraction();
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'Frontend': return <Globe size={10} />;
      case 'Backend': return <Database size={10} />;
      case 'AI': return <Cpu size={10} />;
      case 'DevOps': return <Cloud size={10} />;
      default: return <Code2 size={10} />;
    }
  };

  return (
    <div className="mx-4 relative min-w-[200px] h-[90px] perspective-500 group">
      <AnimatePresence>
        {!isBroken ? (
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.05, y: -5 }}
            onClick={handleInteraction}
            onMouseEnter={handleMouseEnter}
            className={`w-full h-full cursor-crosshair relative flex items-center gap-4 px-6 py-4 backdrop-blur-sm border rounded-lg transition-all duration-200 select-none overflow-hidden
                ${stage >= 3 ? 'bg-red-900/40 border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]' :
                stage >= 2 ? 'bg-cyan-900/40 border-brand-cyan/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]' :
                  'bg-slate-900/80 border-brand-purple/30 hover:border-brand-cyan'}`}
          >
            {/* Stage-based Visuals */}
            {stage >= 2 && <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[scan_0.5s_linear_infinite]"></div>}

            <div className="relative z-10 w-12 h-12 flex items-center justify-center bg-slate-800 rounded-md border border-slate-700">
              <span className="text-2xl">{tech.icon}</span>
            </div>

            <div className="flex flex-col relative z-10">
              <span className="font-bold text-slate-200 text-sm tracking-wide font-mono">{tech.name}</span>
              <span className="text-[10px] text-brand-purple font-medium uppercase tracking-wider flex items-center gap-1 mt-1">
                {getIcon(tech.category)} {tech.category}
              </span>
            </div>
          </motion.div>
        ) : (
          /* EXPLOSION EFFECTS */
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Stage 3: Bigger explosion */}
            {[...Array(stage >= 3 ? 20 : 12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: '50%', y: '50%', opacity: 1, scale: 1 }}
                animate={{
                  x: `${(Math.random() - 0.5) * (stage >= 3 ? 300 : 150)}%`,
                  y: `${(Math.random() - 0.5) * (stage >= 3 ? 300 : 150)}%`,
                  opacity: 0,
                  rotate: Math.random() * 720,
                  scale: 0
                }}
                transition={{ duration: stage >= 3 ? 0.4 : 0.8, ease: "easeOut" }}
                className={`absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full ${particleColors[Math.floor(Math.random() * particleColors.length)]}`}
                style={{ left: 0, top: 0 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Motivation/Stage Flash ---
const FlashMessage = ({ text, subtext, color }: { text: string, subtext: string, color: string }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
    transition={{ duration: 2.5, times: [0, 0.1, 1] }}
    className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none"
  >
    <div className={`relative px-12 py-6 bg-slate-900/80 border-y-4 ${color} backdrop-blur-xl transform -skew-x-12`}>
      <h2 className={`text-5xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tighter drop-shadow-2xl`}>
        {text}
      </h2>
      <p className="text-white font-mono font-bold tracking-[0.5em] text-center mt-2">{subtext}</p>
    </div>
  </motion.div>
)

const TechStack: React.FC = () => {
  const { t } = useLanguage();
  const row1 = [...TECH_STACK, ...TECH_STACK, ...TECH_STACK]; // Tripled for seamless scroll

  const [score, setScore] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [combo, setCombo] = useState(0);
  const [stage, setStage] = useState(1);
  const [shake, setShake] = useState(0);

  const [activeBoss, setActiveBoss] = useState<{ health: number } | null>(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [hasClaimedDiscount, setHasClaimedDiscount] = useState(false);
  const [flashMsg, setFlashMsg] = useState<{ title: string, sub: string, color: string } | null>(null);

  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerShake = () => {
    setShake(10);
    setTimeout(() => setShake(0), 200);
  };

  const handlePop = useCallback(() => {
    setScore(s => s + (stage * 100)); // More points in higher stages
    setClicks(c => {
      const newClicks = c + 1;
      checkEvents(newClicks);
      return newClicks;
    });
    setCombo(c => c + 1);

    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => {
      setCombo(0);
    }, 1500);
  }, [stage, hasClaimedDiscount]);

  const checkEvents = (currentClicks: number) => {
    // Stage Transitions
    if (currentClicks === STAGE_THRESHOLDS.STAGE_2) {
      setStage(2);
      setFlashMsg({ title: "SYSTEM OVERCLOCK", sub: "AUTO-FIRE ENABLED", color: "border-brand-cyan" });
      playSound('win');
      setTimeout(() => setFlashMsg(null), 3000);
    }
    if (currentClicks === STAGE_THRESHOLDS.STAGE_3) {
      setStage(3);
      setFlashMsg({ title: "WEAPON UPGRADE", sub: "BOMB MODE ACTIVE", color: "border-red-500" });
      playSound('win');
      setTimeout(() => setFlashMsg(null), 3000);
    }
    if (currentClicks === STAGE_THRESHOLDS.WIN && !hasClaimedDiscount) {
      setShowDiscount(true);
      setHasClaimedDiscount(true);
      playSound('win');
    }

    // Random Boss
    if ([10, 40, 80].includes(currentClicks)) {
      setActiveBoss({ health: currentClicks === 10 ? 5 : 15 });
    }
  };

  const handleBossDefeat = () => {
    setActiveBoss(null);
    setScore(s => s + 5000);
    setFlashMsg({ title: "THREAT NEUTRALIZED", sub: "+5000 POINTS", color: "border-brand-gold" });
    setTimeout(() => setFlashMsg(null), 2500);
  };

  // Dynamic Styles based on Stage
  const containerStyle = {
    animationDuration: stage === 1 ? '60s' : stage === 2 ? '30s' : '15s', // Faster scroll
  };

  const chaosStyle = stage >= 2 ? {
    transform: 'perspective(1000px) rotateX(10deg)', // 3D tilt
  } : {};

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col justify-center border-t border-slate-200 dark:border-slate-900 min-h-[600px] transition-colors duration-300">

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {/* Moving Grid Floor - Faster in higher stages */}
        <div className={`absolute inset-0 bg-[linear-gradient(rgba(72,58,160,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(72,58,160,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [transform-style:preserve-3d] [perspective:1000px] opacity-30 ${stage >= 2 ? 'animate-pulse' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-slate-50 dark:to-slate-950"></div>
        </div>

        {/* Stars / Speed Lines */}
        <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 ${stage >= 3 ? 'animate-[ping_0.5s_infinite]' : 'animate-pulse'}`}></div>
      </div>

      {/* Overlays */}
      <AnimatePresence>{activeBoss && <BossOverlay health={activeBoss.health} onDefeat={handleBossDefeat} />}</AnimatePresence>
      <AnimatePresence>{showDiscount && <DiscountReward onClose={() => setShowDiscount(false)} />}</AnimatePresence>
      <AnimatePresence>{flashMsg && <FlashMessage text={flashMsg.title} subtext={flashMsg.sub} color={flashMsg.color} />}</AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 text-center mb-12 relative z-20">

        {/* New Title */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white text-center mb-4 font-heading uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        >
          {t('tech_title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">{t('tech_title_2')}</span> {t('tech_title_3')}
        </motion.h2>

        {/* Discount Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 0 0 rgba(234, 179, 8, 0.7)",
                "0 0 20px 5px rgba(234, 179, 8, 0.4)",
                "0 0 0 0 rgba(234, 179, 8, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-brand-gold via-amber-400 to-brand-gold rounded-full border-2 border-amber-300/50 shadow-lg"
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="text-xl"
            >
              ✨
            </motion.span>
            <span className="font-bold text-white text-sm md:text-base drop-shadow-md">
              {t('tech_discount_badge')}
            </span>
            <motion.span
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="text-xl"
            >
              🎁
            </motion.span>
          </motion.div>
        </motion.div>

        {/* HUD */}
        <div className="flex flex-col items-center justify-center gap-6">
          <motion.div
            animate={{ x: shake ? [-shake, shake, -shake, shake, 0] : 0 }}
            className="flex flex-wrap justify-center items-center gap-4 md:gap-8 p-4 bg-white dark:bg-slate-900/80 border-y border-slate-200 dark:border-slate-800 backdrop-blur-md w-full max-w-3xl rounded-xl relative"
          >
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-cyan"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-cyan"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-cyan"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-cyan"></div>

            <div className="flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] text-brand-purple uppercase tracking-widest font-bold">{t('tech_score')}</span>
              <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                {score.toLocaleString().padStart(6, '0')}
              </span>
            </div>

            <div className="flex flex-col items-center min-w-[120px] border-x border-slate-200 dark:border-slate-800 px-8">
              <span className="text-[10px] text-brand-gold uppercase tracking-widest font-bold flex items-center gap-1">
                <ShieldAlert size={10} /> {t('tech_weapon')}
              </span>
              <div className="text-lg font-bold font-mono mt-1 text-slate-900 dark:text-white">
                {stage === 1 ? 'STANDARD' : stage === 2 ? <span className="text-brand-cyan animate-pulse">RAPID FIRE</span> : <span className="text-red-500 animate-pulse">BOMB MODE</span>}
              </div>
            </div>

            <div className="flex flex-col items-center min-w-[120px] relative">
              <span className="text-[10px] text-brand-cyan uppercase tracking-widest font-bold">{t('tech_combo')}</span>
              <motion.span key={combo} initial={{ scale: 0.8 }} animate={{ scale: 1.2 }} className={`text-3xl font-black italic font-heading ${combo > 5 ? 'text-brand-gold' : 'text-slate-400'}`}>
                x{combo}
              </motion.span>
            </div>
          </motion.div>
        </div>
      </div>

      <div
        className={`flex flex-col gap-10 relative z-10 pb-10 transition-all duration-200 ${activeBoss ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}
        style={chaosStyle}
        dir="ltr"
      >

        {/* Top Row - Scrolls Left */}
        <div
          className="flex w-max hover:[animation-play-state:paused]"
          style={{ animation: `scroll-left ${containerStyle.animationDuration} linear infinite` }}
        >
          {row1.map((tech, index) => (
            <TechCard key={`r1-${index}`} tech={tech} stage={stage} onPop={() => { handlePop(); if (stage >= 3) triggerShake(); }} triggerShake={triggerShake} />
          ))}
        </div>

        {/* Bottom Row - Scrolls Right */}
        <div
          className="flex w-max hover:[animation-play-state:paused]"
          style={{ animation: `scroll-right ${containerStyle.animationDuration} linear infinite` }}
        >
          {row1.map((tech, index) => (
            <TechCard key={`r2-${index}`} tech={tech} stage={stage} onPop={() => { handlePop(); if (stage >= 3) triggerShake(); }} triggerShake={triggerShake} />
          ))}
        </div>

      </div>

      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0); }
        }
        @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
        .glitch-text { text-shadow: 2px 0 #fff, -2px 0 #ff00c1; }
        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </section>
  );
};

export default TechStack;