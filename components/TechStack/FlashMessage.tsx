import React from 'react';
import { motion } from 'framer-motion';

interface FlashMessageProps {
  text: string;
  subtext: string;
  color: string;
}

const FlashMessage: React.FC<FlashMessageProps> = ({ text, subtext, color }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
    transition={{ duration: 2.5, times: [0, 0.1, 1] }}
    className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none"
    style={{ willChange: 'transform, opacity' }}
  >
    <div
      className={`relative px-8 sm:px-12 py-4 sm:py-6 bg-slate-900/80 border-y-4 ${color} backdrop-blur-xl transform -skew-x-12`}
    >
      <h2 className="text-4xl sm:text-5xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tighter drop-shadow-2xl">
        {text}
      </h2>
      <p className="text-white font-mono font-bold tracking-[0.3em] sm:tracking-[0.5em] text-center mt-2 text-sm sm:text-base">
        {subtext}
      </p>
    </div>
  </motion.div>
);

export default FlashMessage;
