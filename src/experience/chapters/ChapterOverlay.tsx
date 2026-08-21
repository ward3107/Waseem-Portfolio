import React, { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import ChapterDivider from '../components/ChapterDivider';

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

/** Container drives a staggered cascade; every child uses `item`. */
export const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.085, delayChildren: 0.04 } },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Hebrew and Arabic glyphs are taller than Latin ones, so the display leading
 * that suits Space Grotesk crops ascenders and crowds stacked lines in Heebo
 * and Cairo. RTL headings get extra room.
 */
export function useHeadingLeading(): string {
  const { language } = useLanguage();
  return language === 'he' || language === 'ar' ? 'leading-[1.3]' : 'leading-[1.05]';
}

/**
 * Shared presentational shell for a chapter's DOM overlay: eyebrow + counter,
 * an <h2> heading, a description, optional keyword chips, optional actions, and
 * optional extra content.
 *
 * Entrance: the cascade runs whenever this chapter's own content block is in
 * view, and rewinds when it leaves. The previous reveal fired only once, so
 * under fast smooth-scrolling it finished before the reader arrived and the
 * chapter read as though it had simply appeared. Watching each block
 * individually also survives chapters that grow taller than one screen — a
 * single page-wide scroll ratio cannot, because sections are not equal heights
 * once Hebrew copy wraps onto extra lines.
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
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { amount: 0.3 });
  const leading = useHeadingLeading();

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={active ? 'show' : 'hidden'}
      className="pointer-events-none flex w-full max-w-4xl flex-col items-center text-center"
    >
      <ChapterDivider active={active} />

      <motion.p
        variants={itemVariants}
        className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-brand-cyan"
      >
        {String(index + 1).padStart(2, '0')} <span className="text-white/30">/</span>{' '}
        {String(total).padStart(2, '0')}
        {eyebrow && <span className="ms-3 text-white/50">{eyebrow}</span>}
      </motion.p>

      <motion.h2
        variants={itemVariants}
        className={`max-w-3xl font-heading text-4xl font-black tracking-tight sm:text-5xl md:text-6xl ${leading}`}
      >
        {title}
      </motion.h2>

      {description && (
        <motion.p
          variants={itemVariants}
          className="mt-6 max-w-xl text-base font-medium leading-relaxed text-slate-300 sm:text-lg"
        >
          {description}
        </motion.p>
      )}

      {chips && chips.length > 0 && (
        <motion.ul
          variants={containerVariants}
          className="mt-7 flex flex-wrap items-center justify-center gap-2.5"
        >
          {chips.map((chip) => (
            <motion.li
              key={chip}
              variants={itemVariants}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold text-slate-200 backdrop-blur transition-colors hover:border-brand-cyan/40"
            >
              {chip}
            </motion.li>
          ))}
        </motion.ul>
      )}

      {children && (
        <motion.div variants={itemVariants} className="w-full">
          {children}
        </motion.div>
      )}

      {actions && (
        <motion.div
          variants={itemVariants}
          className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          {actions}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChapterOverlay;
