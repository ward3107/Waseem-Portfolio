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
 * Phones and touch devices get the classic single-page journey, not the WebGL
 * experience. The single-page site is the one continuous scroll visitors expect
 * on a phone, and heavy scroll-scrubbed WebGL is awkward there; the experience
 * stays a desktop treat (and is still reachable anywhere via `?experience`).
 * Read once on mount so rotating or resizing never remounts the whole homepage.
 */
function isHandheld(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  const narrow = window.matchMedia('(max-width: 820px)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return narrow || coarse;
}

/**
 * Decides whether to render the WebGL storytelling experience or the classic
 * DOM site. The classic site is the guaranteed fallback and is chosen whenever
 * the 3D path would be inappropriate or unsupported:
 *
 *   - `?classic` query flag → force classic (debugging / opt-out / A-B).
 *   - phone / touch device → classic single-page journey (unless ?experience).
 *   - `prefers-reduced-motion: reduce` → classic (accessibility).
 *   - no usable WebGL context → classic (graceful degradation).
 *   - known search/social crawler → classic (SEO: content stays crawlable).
 *
 * Otherwise the experience runs on desktop. `?experience` / `?3d` forces it on
 * anywhere (phones included). The gate is conservative: any doubt resolves to
 * the classic single-page site.
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
    handheld: false,
  });
  useEffect(() => {
    setFlags({
      forceClassic: readFlag('classic'),
      request3D: readFlag('experience') || readFlag('3d'),
      crawler: isCrawler(),
      handheld: isHandheld(),
    });
  }, []);

  if (flags.forceClassic || flags.crawler) return 'classic';

  // Phones/touch → the classic single-page journey, unless the visitor
  // explicitly asked for the experience with ?experience / ?3d.
  if (flags.handheld && !flags.request3D) return 'classic';

  const capable = hasWebGL && !prefersReducedMotion;
  if (!capable) return 'classic';

  return ENABLED_BY_DEFAULT || flags.request3D ? '3d' : 'classic';
}
