import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFocusTrap, useEscapeKey } from '@/shared/hooks/useFocusTrap';
import { playSound } from './audio';

interface DiscountRewardProps {
  onClose: () => void;
  percent: number;
  code: string;
  isFinal: boolean;
}

const formatPercent = (p: number): string => (Number.isInteger(p) ? `${p}%` : `${p}%`);

const DiscountReward: React.FC<DiscountRewardProps> = ({ onClose, percent, code, isFinal }) => {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(dialogRef, true);
  useEscapeKey(true, onClose);

  // Ka-ching on open — sound distinct from the milestone chime so the reward
  // moment reads as its own event, not a repeat of the tier-unlock cue.
  useEffect(() => {
    playSound(isFinal ? 'finale' : 'redeem');
  }, [isFinal]);

  return (
    <div
      ref={dialogRef}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-title"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateX: 90 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        className="bg-slate-900 border-2 border-brand-gold p-1 rounded-2xl shadow-[0_0_60px_rgba(212,175,55,0.3)] max-w-md w-full relative"
        style={{ willChange: 'transform, opacity' }}
      >
        <div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent"
          aria-hidden="true"
        ></div>
        <div className="p-6 sm:p-8 text-center relative overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(212,175,55,0.1)_0deg,transparent_60deg,rgba(212,175,55,0.1)_120deg,transparent_180deg)] animate-[spin_10s_linear_infinite] pointer-events-none"
            style={{ willChange: 'transform' }}
            aria-hidden="true"
          ></div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-brand-gold to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl border border-yellow-300 rotate-3 relative z-10"
          >
            <Gift size={36} className="text-slate-900" />
          </motion.div>

          <h2
            id="win-title"
            className="text-3xl sm:text-4xl font-black text-white mb-2 font-heading tracking-tight relative z-10"
          >
            {isFinal ? t('tech_win_title') : t('tech_reward_title')}
          </h2>
          <p className="text-slate-300 mb-4 sm:mb-6 font-mono text-sm relative z-10">
            {isFinal ? t('tech_win_desc') : t('tech_reward_desc')}
          </p>

          <div className="text-5xl sm:text-6xl font-black text-brand-gold mb-6 relative z-10 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]">
            {formatPercent(percent)}
          </div>

          <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 relative z-10">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2">
              {t('tech_win_code')}
            </p>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-brand-cyan tracking-widest select-all drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              {code}
            </div>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="w-full py-3 sm:py-4 bg-brand-gold hover:bg-yellow-400 text-slate-900 font-bold uppercase tracking-wider rounded-lg shadow-lg relative z-10 focus:outline-none focus:ring-4 focus:ring-brand-gold/50 transition-all"
          >
            {isFinal ? t('tech_win_btn') : t('tech_reward_btn')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DiscountReward;
