import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Database, Globe, Cpu, Cloud } from 'lucide-react';
import type { TechItem } from '../../types';
import { playSound } from './audio';

interface TechCardProps {
  tech: TechItem;
  stage: number;
  onPop: () => void;
  triggerShake: () => void;
}

const PARTICLE_COLORS = ['bg-brand-purple', 'bg-brand-cyan', 'bg-brand-gold', 'bg-white'];

const categoryIcon = (category: string) => {
  switch (category) {
    case 'Frontend':
      return <Globe size={10} />;
    case 'Backend':
      return <Database size={10} />;
    case 'AI':
      return <Cpu size={10} />;
    case 'DevOps':
      return <Cloud size={10} />;
    default:
      return <Code2 size={10} />;
  }
};

const TechCard: React.FC<TechCardProps> = ({ tech, stage, onPop, triggerShake }) => {
  const [isBroken, setIsBroken] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleInteraction = () => {
    if (isBroken) return;

    setIsBroken(true);
    onPop();

    if (stage >= 3) {
      playSound('bomb');
      triggerShake();
    } else if (stage >= 2) {
      playSound('laser');
    } else {
      playSound('pop');
    }

    if (navigator.vibrate) navigator.vibrate(stage * 20);

    const respawnTime = stage >= 2 ? 1000 : 2500;
    setTimeout(() => setIsBroken(false), respawnTime);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleInteraction();
    }
  };

  const handleMouseEnter = () => {
    if (stage >= 2 && !isBroken) handleInteraction();
  };

  return (
    <div className="mx-2 sm:mx-4 relative min-w-[160px] sm:min-w-[200px] h-[80px] sm:h-[90px] perspective-500 group">
      <AnimatePresence>
        {!isBroken ? (
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileFocus={{ scale: 1.05, y: -5 }}
            onClick={handleInteraction}
            onKeyDown={handleKeyDown}
            onMouseEnter={handleMouseEnter}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            tabIndex={0}
            role="button"
            aria-label={`Pop ${tech.name} card`}
            className={`w-full h-full cursor-crosshair relative flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-sm border rounded-lg transition-all duration-200 select-none overflow-hidden outline-none
              ${isFocused ? 'ring-2 ring-brand-cyan ring-offset-2 ring-offset-white dark:ring-offset-slate-950' : ''}
              ${stage >= 3
                ? 'bg-red-900/40 border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                : stage >= 2
                ? 'bg-cyan-900/40 border-brand-cyan/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900/80 border-brand-purple/30 hover:border-brand-cyan'}`}
            style={{ willChange: 'transform, opacity' }}
          >
            {stage >= 2 && (
              <div
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[scan_0.5s_linear_infinite] pointer-events-none"
                style={{ willChange: 'transform' }}
              ></div>
            )}

            <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-800 rounded-md border border-slate-700">
              <span className="text-xl sm:text-2xl">{tech.icon}</span>
            </div>

            <div className="flex flex-col relative z-10">
              <span className="font-bold text-slate-200 text-xs sm:text-sm tracking-wide font-mono">
                {tech.name}
              </span>
              <span className="text-[9px] sm:text-[10px] text-brand-purple font-medium uppercase tracking-wider flex items-center gap-1 mt-1">
                {categoryIcon(tech.category)} {tech.category}
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            {[...Array(stage >= 3 ? 20 : 12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: '50%', y: '50%', opacity: 1, scale: 1 }}
                animate={{
                  x: `${(Math.random() - 0.5) * (stage >= 3 ? 300 : 150)}%`,
                  y: `${(Math.random() - 0.5) * (stage >= 3 ? 300 : 150)}%`,
                  opacity: 0,
                  rotate: Math.random() * 720,
                  scale: 0,
                }}
                transition={{ duration: stage >= 3 ? 0.4 : 0.8, ease: 'easeOut' }}
                className={`absolute w-1.5 h-1.5 sm:w-2 sm:h-3 rounded-full ${PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]}`}
                style={{ left: 0, top: 0, willChange: 'transform, opacity' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechCard;
