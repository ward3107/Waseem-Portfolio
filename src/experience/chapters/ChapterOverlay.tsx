import React from 'react';
import { motion } from 'framer-motion';

interface ChapterOverlayProps {
  /** 0-based chapter index, for the "NN / TT" counter. */
  index: number;
  total: number;
  /** Small uppercase eyebrow label. */
  eyebrow?: string;
  /** Heading content — a node so callers can colour highlighted spans. */
  title: React.ReactNode;
  description?: string;
  /** Non-interactive keyword chips. */
  chips?: string[];
  /** Interactive controls (links/buttons). Must set pointer-events-auto. */
  actions?: React.ReactNode;
  /** Extra content (e.g. project cards) rendered below the description. */
  children?: React.ReactNode;
}

/**
 * Shared presentational shell for a chapter's DOM overlay: eyebrow + counter,
 * an <h2> heading, a description, optional keyword chips, optional actions, and
 * optional extra content. Centred, pointer-events-none (interactive children
 * re-enable pointer events), and reveals on scroll-in. Keeps every chapter
 * visually consistent so the journey reads as one system.
 */
const ChapterOverlay: React.FC<ChapterOverlayProps> = ({
  index,
  total,
  eyebrow,
  title,
  description,
  chips,
  actions,
  children,
}) => {
  const reveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 },
  };

  return (
    <div className="pointer-events-none flex w-full max-w-4xl flex-col items-center text-center">
      <motion.p
        {...reveal}
        transition={{ duration: 0.5 }}
        className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-brand-cyan"
      >
        {String(index + 1).padStart(2, '0')} <span className="text-white/30">/</span>{' '}
        {String(total).padStart(2, '0')}
        {eyebrow && <span className="ms-3 text-white/50">{eyebrow}</span>}
      </motion.p>

      <motion.h2
        {...reveal}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="max-w-3xl font-heading text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
      >
        {title}
      </motion.h2>

      {description && (
        <motion.p
          {...reveal}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-6 max-w-xl text-base font-medium leading-relaxed text-slate-300 sm:text-lg"
        >
          {description}
        </motion.p>
      )}

      {chips && chips.length > 0 && (
        <motion.ul
          {...reveal}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-2.5"
        >
          {chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold text-slate-200 backdrop-blur"
            >
              {chip}
            </li>
          ))}
        </motion.ul>
      )}

      {children && (
        <motion.div {...reveal} transition={{ duration: 0.6, delay: 0.2 }} className="w-full">
          {children}
        </motion.div>
      )}

      {actions && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, delay: 0.26 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
};

export default ChapterOverlay;
