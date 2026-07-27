import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Bug } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { playSound } from './audio';

interface BossProps {
  onDefeat: () => void;
  health: number;
}

const BossOverlay: React.FC<BossProps> = ({ onDefeat, health: initialHealth }) => {
  const [currentHealth, setCurrentHealth] = useState(initialHealth);
  const controls = useAnimation();
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Trap Tab within the dialog so a keyboard user can't tab onto the dimmed
  // marquee cards behind it (they stay tabbable under pointer-events-none).
  useFocusTrap(dialogRef, true);

  // Fire defeat exactly once, when health crosses zero — derived from state so
  // rapid clicks can't miss it via a stale local read.
  useEffect(() => {
    if (currentHealth <= 0) {
      playSound('bomb');
      onDefeat();
    }
    // onDefeat is stable enough for the game's lifetime; health only reaches 0 once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHealth]);

  // No custom onKeyDown: the native <button> already synthesizes a click for
  // Enter/Space. A manual keydown handler double-counted Space (keydown hit +
  // keyup-synthesized click = -2 health per press). Functional update avoids
  // collapsing fast successive clicks into one decrement.
  const handleHit = () => {
    playSound('shatter');
    controls.start({
      x: [0, -20, 20, -10, 10, 0],
      transition: { duration: 0.1 },
    });
    setCurrentHealth((h) => Math.max(0, h - 1));
  };

  return (
    <div
      ref={dialogRef}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="boss-title"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="relative bg-slate-900/90 border-2 border-red-500 rounded-lg p-6 sm:p-8 max-w-sm w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.4)] overflow-hidden"
        style={{ willChange: 'transform, opacity' }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent h-full w-full animate-[scan_2s_linear_infinite] pointer-events-none"
          aria-hidden="true"
          style={{ willChange: 'transform' }}
        ></div>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-mono font-bold px-4 py-1 rounded-b-lg border border-red-400">
          ⚠ {t('tech_boss_anomaly')}
        </div>

        <motion.button
          animate={controls}
          onClick={handleHit}
          className="cursor-crosshair active:scale-95 transition-transform inline-block mt-6 relative group bg-transparent border-0 p-0 rounded-full focus:outline-none focus:ring-4 focus:ring-red-500/50"
          aria-label={`Attack boss! ${Math.ceil((currentHealth / initialHealth) * 100)}% health remaining`}
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/40 transition-colors"></div>
            <Bug size={100} className="text-red-500 drop-shadow-2xl relative z-10" />
          </div>
        </motion.button>

        <h3
          id="boss-title"
          className="text-2xl sm:text-3xl font-black mt-4 sm:mt-6 font-heading uppercase tracking-widest text-red-500 glitch-text"
        >
          {t('tech_boss_name')}
        </h3>

        <div className="mt-4 sm:mt-6">
          <div className="flex justify-between text-xs font-mono text-red-400 mb-1 uppercase">
            <span>Integrity</span>
            <span aria-live="polite">{Math.ceil((currentHealth / initialHealth) * 100)}%</span>
          </div>
          <div
            className="w-full h-5 sm:h-6 bg-slate-950 rounded-sm border border-slate-700 p-1 relative"
            role="progressbar"
            aria-valuenow={currentHealth}
            aria-valuemin={0}
            aria-valuemax={initialHealth}
          >
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${(currentHealth / initialHealth) * 100}%` }}
              className="h-full bg-gradient-to-r from-red-600 to-orange-600"
              style={{ willChange: 'width' }}
            />
          </div>
          <p className="text-slate-400 text-[10px] mt-2 font-mono blink">{t('tech_boss_eliminate')}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default BossOverlay;
