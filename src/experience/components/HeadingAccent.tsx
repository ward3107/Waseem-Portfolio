import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export type AccentTone = 'purple' | 'gold' | 'cyan';

interface HeadingAccentProps {
  children: React.ReactNode;
  tone: AccentTone;
  /** Latin-only flourish: gradient fill + italic. Ignored for Hebrew/Arabic. */
  fancy?: boolean;
}

const GLOW: Record<AccentTone, string> = {
  purple: 'rgba(121,101,193,0.65)',
  gold: 'rgba(227,208,149,0.5)',
  cyan: 'rgba(0,229,255,0.55)',
};

const SOLID: Record<AccentTone, string> = {
  purple: 'text-brand-purpleLighter',
  gold: 'text-brand-goldLight',
  cyan: 'text-brand-cyan',
};

const GRADIENT: Record<AccentTone, string> = {
  purple: 'text-brand-purpleLighter',
  cyan: 'text-brand-cyan',
  gold: 'bg-gradient-to-r from-brand-goldLight via-yellow-200 to-brand-goldLight bg-clip-text italic text-transparent',
};

/**
 * A highlighted word inside a chapter heading, with the shared breathing glow.
 *
 * Why this exists: the gold accent used `bg-clip-text` + `italic`. Hebrew and
 * Arabic have no true italic, so browsers synthesise an oblique skew — and the
 * skewed glyph edges fall outside the box that `background-clip: text` paints
 * into, which visibly sliced the tops and tails off Hebrew letters. RTL
 * therefore gets a solid brand fill (never clips) while Latin keeps the
 * gradient-and-italic flourish. `inline-block` plus symmetric padding that is
 * cancelled by a negative margin gives every script a roomier paint box
 * without changing the heading's line rhythm.
 */
const HeadingAccent: React.FC<HeadingAccentProps> = ({ children, tone, fancy = false }) => {
  const { language } = useLanguage();
  const isRtl = language === 'he' || language === 'ar';
  const fill = fancy && !isRtl ? GRADIENT[tone] : SOLID[tone];

  return (
    <span
      className={`exp-glow-pulse inline-block px-[0.06em] py-[0.12em] my-[-0.12em] ${fill}`}
      style={{ '--glow': GLOW[tone] } as React.CSSProperties}
    >
      {children}
    </span>
  );
};

export default HeadingAccent;
