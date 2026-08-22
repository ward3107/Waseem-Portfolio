import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { useWebGLSupport } from './useWebGLSupport';

export type ExperienceMode = 'classic' | '3d';

/**
 * Whether capable visitors get the 3D experience by default.
 *
 * `true`: every chapter renders real content (hero glass monogram, real
 * services / AI / projects / trust / contact copy sourced from the same
 * translations and data as the classic site), so the experience is the default
 * homepage. Desktops get the full-quality tier; phones/tablets get a lighter
 * tier (see useQualityTier) — both run the experience.
 *
 * The classic site remains the guaranteed fallback for everyone else —
 * reduced-motion, no-WebGL, search crawlers (kept on the content-rich classic
 * homepage for SEO), and anyone who appends `?classic`.
 */
const ENABLED_BY_DEFAULT = true;

function readFlag(name: string): boolean {
  if (typeof window === 'undefined') return false;
  const v = new URLSearchParams(window.location.search).get(name);
  return v !== null && v !== '0' && v !== 'false';
}

/**
 * Well-known crawler/bot user agents. Search and social crawlers are kept on
 * the classic, content-rich homepage so indexing/previews never depend on
 * WebGL — a deliberate SEO safeguard now that phones also get the experience.
 */
function isCrawler(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegrambot|discordbot/i.test(
    navigator.userAgent
  );
}

/**
 * Decides whether to render the WebGL storytelling experience or the classic
 * DOM site. The experience is the newest, default design and runs on every
 * capable device — desktop AND phones (a lighter tier on phones, see
 * useQualityTier). It is one continuous scroll, not separate pages. The classic
 * single-page site is the guaranteed fallback, chosen only when the 3D path
 * would be inappropriate or unsupported:
 *
 *   - `?classic` query flag → force classic (debugging / opt-out / A-B).
 *   - `prefers-reduced-motion: reduce` → classic (accessibility).
 *   - no usable WebGL context → classic (graceful degradation).
 *   - known search/social crawler → classic (SEO: content stays crawlable).
 *
 * The gate is conservative: any doubt resolves to the classic single-page site.
 */
export function useExperienceMode(): ExperienceMode {
  const prefersReducedMotion = usePrefersReducedMotion();
  const hasWebGL = useWebGLSupport();

  // URL flags + crawler check are read once on mount — they don't change
  // without a reload. crawler goes in state so the first paint (before effects)
  // never briefly mounts WebGL for a bot.
  const [flags, setFlags] = useState({
    forceClassic: false,
    request3D: false,
    crawler: false,
  });
  useEffect(() => {
    setFlags({
      forceClassic: readFlag('classic'),
      request3D: readFlag('experience') || readFlag('3d'),
      crawler: isCrawler(),
    });
  }, []);

  if (flags.forceClassic || flags.crawler) return 'classic';

  const capable = hasWebGL && !prefersReducedMotion;
  if (!capable) return 'classic';

  return ENABLED_BY_DEFAULT || flags.request3D ? '3d' : 'classic';
}
