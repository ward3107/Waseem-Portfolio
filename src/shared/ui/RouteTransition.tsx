import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useAnimationControls } from 'framer-motion';
import { useLocation, type Location } from 'react-router-dom';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

/**
 * Branded page transitions — the doorways between routes.
 *
 * Without this, every nav click is a hard cut: the homepage is one continuous
 * cinematic arc, but stepping to /projects or /about just swaps the document.
 * This makes the swap a beat of the same world instead — a curtain of the
 * journey's particles rises to cover the viewport, the route is exchanged while
 * it is fully hidden, then the curtain keeps rising to reveal the new page. One
 * upward sweep, echoing the footer W's rising motes.
 *
 * Two things fall out of swapping *under cover* rather than crossfading:
 *   - the heaviest jank is hidden — the home route booting Lenis and the WebGL
 *     canvas, a tall page's images resolving — so no route ever reveals itself
 *     half-built;
 *   - the old page's exit and the new page's entrance never overlap, so there
 *     is never a frame with two ambient fields or two scroll positions.
 *
 * Scroll is left entirely to ScrollToHashOnRouteChange, which keys off the live
 * location and re-asserts across ~0.8s; because the new page mounts a few
 * hundred ms in (under the curtain), those re-asserts land after it exists and
 * settle it before the reveal. Nothing here touches scrollTop.
 *
 * Reduced motion, and any transition touching a standalone route (admin, the
 * feedback page, the GBP redirect), skip the curtain and swap instantly — those
 * have their own chrome and must never be veiled.
 */

// Deep night in dark, a soft brand haze in light — the curtain honors the theme
// toggle the same way the rest of the world does.
const MOTE_COLORS = ['#7965C1', '#A78BFA', '#00E5FF', '#7FD8E8'];

const isStandalone = (pathname: string): boolean =>
  pathname === '/admin' ||
  pathname.startsWith('/admin/') ||
  pathname === '/share-testimonial' ||
  pathname === '/from-gbp';

const RouteTransition: React.FC<{ children: (location: Location) => React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const reduce = usePrefersReducedMotion();
  const controls = useAnimationControls();

  // The location actually rendered. It lags the live one only while a curtain
  // is covering, so the page is exchanged out of sight.
  const [display, setDisplay] = useState<Location>(location);
  const prevPath = useRef(location.pathname);

  // A comet-tail of motes, denser toward the leading (top) edge, so the curtain
  // reads as a wave of the journey's particles rather than a plain slab. Static
  // within the panel — the panel's transform carries them up.
  const motes = useMemo(
    () =>
      Array.from({ length: 44 }, (_, i) => {
        const top = Math.pow(Math.random(), 1.7) * 100; // bias upward
        return {
          key: i,
          left: Math.random() * 100,
          top,
          size: 1 + Math.random() * 2.4,
          color: MOTE_COLORS[i % MOTE_COLORS.length],
          alpha: 0.25 + Math.random() * 0.5,
          blur: Math.random() < 0.3,
        };
      }),
    []
  );

  useEffect(() => {
    // Same page (a hash strip, a query change) — keep the rendered location in
    // sync, but never run the curtain.
    if (location.pathname === prevPath.current) {
      setDisplay(location);
      return;
    }
    const from = prevPath.current;
    const to = location.pathname;
    prevPath.current = to;

    if (reduce || isStandalone(from) || isStandalone(to)) {
      setDisplay(location);
      return;
    }

    let cancelled = false;
    const run = async () => {
      // Rise to cover.
      await controls.start({
        y: '0%',
        transition: { duration: 0.3, ease: [0.7, 0, 0.3, 1] },
      });
      if (cancelled) return;

      // Exchange the page while the curtain hides it, then hold fully covered
      // for a beat. The hold both reads better — a moment of held black instead
      // of an instant flip — and guarantees the new tree has painted (and its
      // heaviest layers, the home WebGL canvas especially, have booted) before
      // any of it is revealed.
      setDisplay(location);
      await new Promise<void>((r) => setTimeout(r, 180));
      if (cancelled) return;

      // Keep rising, off the top — revealing the new page.
      await controls.start({
        y: '-100%',
        transition: { duration: 0.44, ease: [0.7, 0, 0.3, 1] },
      });
      if (cancelled) return;

      // Re-park below the fold for the next crossing.
      controls.set({ y: '100%' });
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [location, reduce, controls]);

  return (
    <>
      {children(display)}

      {/* The curtain is portaled to <body> — a top-level overlay independent of
          the app's stacking contexts (the isolated PageShell, the perspective/3D
          transforms on the project cards), which is the robust place for a
          full-viewport veil. Parked below the fold; decorative and
          non-interactive, so clicks during the ~0.9s crossing pass straight
          through. Occlusion is proven by construction: the swap happens during
          a static hold at full cover (see the sequence above), the one frame
          that must hide the exchange. */}
      {createPortal(
        <motion.div
          aria-hidden="true"
          initial={{ y: '100%' }}
          animate={controls}
          className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
        >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-white to-slate-100 dark:from-[#0b1022] dark:via-[#0e1430] dark:to-[#0a0f1f]" />

        {/* Brand haze. */}
        <div className="absolute -top-32 left-1/4 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand-purple/20 blur-3xl dark:bg-brand-purple/25" />
        <div className="absolute -bottom-24 right-1/4 h-[24rem] w-[24rem] translate-x-1/2 rounded-full bg-brand-cyan/15 blur-3xl dark:bg-brand-cyan/20" />

        {/* Leading-edge glow — the crest of the wave. */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-cyan/25 to-transparent blur-xl dark:from-brand-cyan/30" />

        {/* The motes. */}
        {motes.map((m) => (
          <span
            key={m.key}
            className={`absolute rounded-full ${m.blur ? 'blur-[1px]' : ''}`}
            style={{
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: `${m.size}px`,
              height: `${m.size}px`,
              backgroundColor: m.color,
              opacity: m.alpha,
            }}
          />
        ))}
      </motion.div>,
        document.body
      )}
    </>
  );
};

export default RouteTransition;
