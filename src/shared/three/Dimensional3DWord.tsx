import React from 'react';

/**
 * Plain styled word — the flat gradient span every caller was already
 * passing as `fallbackClassName`. The original component rendered the word
 * in WebGL via Three.js + Troika, but the effect was fragile (worker CSP
 * issues, blob-URL loads, and a garbled render on some devices) and the
 * owner asked to drop it entirely.
 *
 * The API is preserved so existing call sites (Hero, AboutTimeline,
 * Projects, Services, FAQ, Contact) don't need to change:
 *
 *   <Dimensional3DWord
 *     word="חיות"
 *     font={fontForLanguage(language)}
 *     color="#7c5cff"
 *     depthColor="#2b2168"
 *     fallbackClassName="inline-block text-transparent bg-clip-text ..."
 *   />
 *
 * Only `word` and `fallbackClassName` are used now; the others are ignored.
 */

// Kept as an export so existing `import { fontForLanguage } from ...` lines
// keep compiling; the returned value is unused at runtime.
export const FONT_HE = '/fonts/heebo.ttf';
export const FONT_AR = '/fonts/cairo.ttf';
export const fontForLanguage = (language: string): string =>
  language === 'ar' ? FONT_AR : FONT_HE;

interface Dimensional3DWordProps {
  word: string;
  /** Ignored (was the WebGL font URL). */
  font?: string;
  /** Ignored (was the WebGL surface color). */
  color?: string;
  /** Ignored (was the WebGL depth-extrude color). */
  depthColor?: string;
  /** Tailwind classes for the rendered span — this is now the whole design. */
  fallbackClassName?: string;
}

const Dimensional3DWord: React.FC<Dimensional3DWordProps> = ({
  word,
  fallbackClassName,
}) => <span className={fallbackClassName}>{word}</span>;

export default Dimensional3DWord;
