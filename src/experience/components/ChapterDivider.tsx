import React from 'react';
import { motion } from 'framer-motion';

/**
 * The experience's signature motif: a thin energy line that draws itself as a
 * chapter arrives — brand purple flowing into cyan, with a diamond node at the
 * centre. Driven by the parent chapter's `active` flag (not an observer) so it
 * redraws every time the chapter is entered, in either direction. Pure SVG, no
 * assets. framer-motion honours the site-wide reduced-motion config.
 */
const ChapterDivider: React.FC<{ active?: boolean }> = ({ active = true }) => (
  <motion.svg
    initial={{ opacity: 0 }}
    animate={{ opacity: active ? 1 : 0 }}
    transition={{ duration: 0.4 }}
    width="220"
    height="12"
    viewBox="0 0 220 12"
    fill="none"
    aria-hidden="true"
    className="mb-6 max-w-full"
  >
    <defs>
      <linearGradient id="exp-divider-grad" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#7965C1" stopOpacity="0" />
        <stop offset="0.35" stopColor="#7965C1" />
        <stop offset="0.65" stopColor="#00E5FF" />
        <stop offset="1" stopColor="#00E5FF" stopOpacity="0" />
      </linearGradient>
    </defs>
    <motion.path
      d="M0 6 H98 M122 6 H220"
      stroke="url(#exp-divider-grad)"
      strokeWidth="1.5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: active ? 1 : 0 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    />
    <motion.rect
      x="106"
      y="2"
      width="8"
      height="8"
      rx="1"
      transform="rotate(45 110 6)"
      fill="#00E5FF"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
      transition={{ delay: active ? 0.5 : 0, duration: 0.35, ease: 'backOut' }}
      style={{ transformOrigin: '110px 6px' }}
    />
  </motion.svg>
);

export default ChapterDivider;
