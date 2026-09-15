import React, { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import ColorRail from './ColorRail';
import { JOURNEY_ACTS, hexToRgb, mixRgb, parseRgba, mixRgba } from './journeyConfig';

/**
 * The colour-journey shell. Wraps the classic homepage sections and turns the
 * flat section stack into one continuous scroll journey:
 *
 *  - A fixed ground layer whose colour eases between neighbouring act hues as
 *    the page scrolls (the visible "colour changes as you scroll" effect).
 *  - A soft aura in the current act's accent, behind the content.
 *  - The same drifting motes + grid used on the inner pages, so the whole site
 *    reads as one world.
 *  - A side colour rail that tracks progress and jumps between acts.
 *
 * The section wrappers inside go transparent via the `.journey section` rule in
 * index.css (the same trick PageShell uses), so the ground shows through while
 * cards keep their own fills.
 *
 * Theme-aware: grounds and accents have light + dark values, and the engine
 * recolours in place on a theme flip. Reduced-motion visitors still get the
 * colour (it is scroll-linked, not autonomous motion), but the decorative
 * motes self-disable and the CSS colour transition collapses to instant via the
 * global reduced-motion rule.
 */
const ScrollJourney: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  const prefersReducedMotion = usePrefersReducedMotion();

  // Keep `active` in a ref so the scroll handler only calls setState on a real
  // change, never once per frame.
  const activeRef = useRef(0);
  // Read reduced-motion inside the scroll handler without re-subscribing it.
  const reduceRef = useRef(prefersReducedMotion);
  reduceRef.current = prefersReducedMotion;

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    const aura = auraRef.current;
    if (!wrap || !stage || !aura) return;

    let dark = document.documentElement.classList.contains('dark');
    let grounds = JOURNEY_ACTS.map((a) => hexToRgb(dark ? a.groundDark : a.groundLight));
    let ghosts = JOURNEY_ACTS.map((a) => parseRgba(dark ? a.ghostDark : a.ghostLight));
    let acts = Array.from(wrap.querySelectorAll<HTMLElement>('[data-act]'));
    let centers: number[] = [];

    const refreshPalette = () => {
      grounds = JOURNEY_ACTS.map((a) => hexToRgb(dark ? a.groundDark : a.groundLight));
      ghosts = JOURNEY_ACTS.map((a) => parseRgba(dark ? a.ghostDark : a.ghostLight));
    };

    let ticking = false;
    const update = () => {
      ticking = false;
      if (!centers.length) return;

      const mid = window.scrollY + window.innerHeight * 0.5;

      let lo = 0;
      for (let i = 0; i < centers.length; i++) {
        if (centers[i] <= mid) lo = i;
      }
      const hi = Math.min(lo + 1, centers.length - 1);
      const span = centers[hi] - centers[lo];
      const t = span > 0 ? Math.min(1, Math.max(0, (mid - centers[lo]) / span)) : 0;

      stage.style.backgroundColor = mixRgb(grounds[lo], grounds[hi], t);

      // Settle-beat: the aura's glow is strongest while an act is centred and
      // eases off at the seam between two acts, giving the journey an inhale /
      // exhale rhythm instead of a flat slide. `t` runs 0 (at lo's centre) → 1
      // (at hi's centre), so distance-to-nearest-centre peaks at 0.5 (the seam).
      // Held steady for reduced-motion so nothing pulses.
      const seam = Math.min(t, 1 - t); // 0 at a centre, 0.5 at the seam
      const intensity = reduceRef.current ? 1 : 0.6 + 0.4 * (1 - 2 * seam);

      // The aura colour cross-fades continuously between the two acts (no snap),
      // so the glow morphs from one accent into the next as you scroll.
      const ghost = mixRgba(ghosts[lo], ghosts[hi], t, intensity);
      aura.style.background = `radial-gradient(58% 45% at 50% 32%, ${ghost}, transparent 72%)`;

      // Rail + active state still snap: an act "belongs" to one hue and one
      // rail node even mid-fade.
      const near = t < 0.5 ? lo : hi;
      if (near !== activeRef.current) {
        activeRef.current = near;
        setActive(near);
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    // Act boundaries change only when content is inserted/resized, not on every
    // scroll frame. Cache them and refresh through ResizeObserver so scrolling
    // performs no layout reads and cannot trigger forced reflow warnings.
    let measureRaf = 0;
    const refreshLayout = () => {
      measureRaf = 0;
      acts = Array.from(wrap.querySelectorAll<HTMLElement>('[data-act]'));
      centers = acts.map((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top + window.scrollY + rect.height / 2;
      });
      update();
    };
    const scheduleLayoutRefresh = () => {
      if (measureRaf) return;
      measureRaf = requestAnimationFrame(refreshLayout);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', scheduleLayoutRefresh);

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(scheduleLayoutRefresh);
    acts.forEach((act) => resizeObserver?.observe(act));

    // Recolour in place when the theme toggles.
    const mo = new MutationObserver(() => {
      const next = document.documentElement.classList.contains('dark');
      if (next === dark) return;
      dark = next;
      setIsDark(next);
      refreshPalette();
      update();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    refreshLayout();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', scheduleLayoutRefresh);
      cancelAnimationFrame(measureRaf);
      resizeObserver?.disconnect();
      mo.disconnect();
    };
  }, []);

  const accents = JOURNEY_ACTS.map((a) => (isDark ? a.accentDark : a.accentLight));

  const goToAct = (index: number) => {
    const act = JOURNEY_ACTS[index];
    const el = document.getElementById(act.anchor);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={wrapRef} className="journey relative">
      {/* Fixed atmosphere: a calm colour ground and soft aura. Repeated grid
          lines and animated motes made long-form copy look noisy and reduced
          legibility while scrolling, so the journey now keeps the depth
          without placing texture behind every paragraph. */}
      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden" aria-hidden="true">
        <div
          ref={stageRef}
          className="absolute inset-0 transition-[background-color] duration-200 ease-linear"
          style={{ backgroundColor: isDark ? JOURNEY_ACTS[0].groundDark : JOURNEY_ACTS[0].groundLight }}
        />
        <div ref={auraRef} className="absolute inset-0" />
      </div>

      <ColorRail active={active} accents={accents} onSelect={goToAct} />

      {children}
    </div>
  );
};

export default ScrollJourney;
