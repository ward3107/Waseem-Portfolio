import React, { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

/**
 * The story's epilogue: the particles that carried the scroll journey settle in
 * the footer and reassemble the brand W one last time. Sweep a cursor or drag a
 * finger through them and they scatter, then drift back into the letter.
 *
 * Deliberately a 2D canvas rather than WebGL: the footer renders on every page
 * including the classic site, so this has to cost nothing — no three.js, no
 * second WebGL context, a few KB of code. The letterform is sampled from the
 * glyph itself (drawn to an offscreen canvas, then read back), so it needs no
 * font asset and follows the heading typeface.
 *
 * The letter assembles exactly once. Everything that can happen afterwards — a
 * resize, a theme flip — re-targets the existing particles in place, so the W
 * never comes apart and re-forms on its own. That distinction matters: Lenis
 * rewrites the class list on <html> every time a scroll starts and stops, and
 * rebuilding on those made the mark explode and reassemble every few seconds.
 *
 * Cheap by construction: the loop only runs while the footer is actually on
 * screen, and reduced-motion visitors get a single static render of the same
 * letter instead of an animation.
 */

const DARK = ['#7965C1', '#A78BFA', '#00E5FF'];
const LIGHT = ['#483AA0', '#6D28D9', '#0E7490'];

// Offscreen sampling grid, and the pointer's repulsion reach (squared, ≈126px).
const SW = 320;
const SH = 180;
const REPEL_R2 = 16000;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number; // home, in canvas pixels
  hy: number;
  nx: number; // position within the letterform itself, 0..1
  ny: number;
  c: string;
  r: number;
}

const FooterConstellation: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let dark = document.documentElement.classList.contains('dark');
    const pointer = { x: -9999, y: -9999 };

    const palette = () => (dark ? DARK : LIGHT);
    const colorAt = (nx: number) => {
      const cols = palette();
      return cols[Math.min(cols.length - 1, Math.floor(nx * cols.length))];
    };

    /**
     * Sample the glyph's own pixels, normalised to the letter's ink box rather
     * than the sampling canvas — the type sets its own side bearings and the W
     * only occupies the cap height, so normalising to the box would bake in a
     * wide empty margin and render the mark much smaller than its slot.
     */
    const sampleGlyph = (): { pts: { x: number; y: number }[]; aspect: number } => {
      const off = document.createElement('canvas');
      off.width = SW;
      off.height = SH;
      const octx = off.getContext('2d');
      if (!octx) return { pts: [], aspect: 1 };
      octx.fillStyle = '#fff';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.font = `900 ${SH * 1.02}px "Space Grotesk", Inter, system-ui, sans-serif`;
      octx.fillText('W', SW / 2, SH / 2);
      const data = octx.getImageData(0, 0, SW, SH).data;

      const raw: { x: number; y: number }[] = [];
      let minX = SW;
      let maxX = 0;
      let minY = SH;
      let maxY = 0;
      const step = 2;
      for (let y = 0; y < SH; y += step) {
        for (let x = 0; x < SW; x += step) {
          if (data[(y * SW + x) * 4 + 3] <= 128) continue;
          raw.push({ x, y });
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      if (!raw.length) return { pts: [], aspect: 1 };

      const iw = Math.max(1, maxX - minX);
      const ih = Math.max(1, maxY - minY);
      return {
        pts: raw.map((p) => ({ x: (p.x - minX) / iw, y: (p.y - minY) / ih })),
        aspect: iw / ih,
      };
    };

    /**
     * Size the canvas and (re)compute where every particle belongs. When the
     * particle count is unchanged this only moves the homes — the letter flies
     * to its new size instead of being thrown apart and rebuilt.
     */
    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      w = rect.width;
      h = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { pts, aspect } = sampleGlyph();
      if (!pts.length) return;

      // Fill the band: as wide as it allows, unless height binds first.
      let artW = Math.min(w * 0.78, 560);
      let artH = artW / aspect;
      const maxH = h * 0.82;
      if (artH > maxH) {
        artH = maxH;
        artW = artH * aspect;
      }
      const ox = (w - artW) / 2;
      const oy = (h - artH) / 2;

      // Density follows the letter's area, so a big desktop W is as solid as a
      // small phone one instead of thinning out into a dotted outline as it
      // grows. Roughly one particle per 88px² of letterform.
      const budget = Math.max(420, Math.min(1250, Math.round((artW * artH) / 88)));
      const stride = Math.max(1, Math.floor(pts.length / budget));
      const scale = Math.max(1, artW / 300);

      const homes: { nx: number; ny: number }[] = [];
      for (let i = 0; i < pts.length; i += stride) homes.push({ nx: pts[i].x, ny: pts[i].y });

      if (particles.length === homes.length) {
        for (let i = 0; i < homes.length; i++) {
          const p = particles[i];
          p.nx = homes[i].nx;
          p.ny = homes[i].ny;
          p.hx = ox + p.nx * artW;
          p.hy = oy + p.ny * artH;
        }
        return;
      }

      particles = homes.map(({ nx, ny }) => {
        const hx = ox + nx * artW;
        const hy = oy + ny * artH;
        return {
          // First build only: scattered, so the letter draws itself together
          // the first time the reader arrives at the bottom of the page.
          x: hx + (Math.random() - 0.5) * artW * 0.5,
          y: hy + (Math.random() - 0.5) * artH * 0.6,
          vx: 0,
          vy: 0,
          hx,
          hy,
          nx,
          ny,
          c: colorAt(nx),
          r: (0.9 + Math.random() * 1.0) * scale,
        };
      });
    };

    const draw = (alpha: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = alpha;
      for (const p of particles) {
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      for (const p of particles) {
        // Spring home.
        p.vx += (p.hx - p.x) * 0.012;
        p.vy += (p.hy - p.y) * 0.012;

        // The pointer pushes them out of the way.
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < REPEL_R2 && d2 > 0.01) {
          const f = (1 - d2 / REPEL_R2) * 2.4;
          const d = Math.sqrt(d2);
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;
      }
      draw(0.65);
    };

    const start = () => {
      if (running || prefersReducedMotion) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /** Reduced motion: the letter, already assembled, one frame, no loop. */
    const settle = () => {
      for (const p of particles) {
        p.x = p.hx;
        p.y = p.hy;
      }
      draw(0.6);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Park it once the pointer is clear of the band. The wrapper is
      // pointer-events-none so it never receives a leave event of its own, and
      // a finger lifted mid-letter would otherwise hold a hole open for good.
      const out = x < -60 || y < -60 || x > rect.width + 60 || y > rect.height + 60;
      pointer.x = out ? -9999 : x;
      pointer.y = out ? -9999 : y;
    };
    const release = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    layout();
    if (prefersReducedMotion) settle();

    // Only animate while the footer is visible — it sits off-screen most of
    // the time, and an idle rAF loop there would be pure waste.
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((entries) => (entries[0]?.isIntersecting ? start() : stop()), {
            rootMargin: '120px',
          })
        : null;
    if (io) io.observe(wrap);
    else start();

    // Real size changes only. Mobile browsers fire this as the address bar
    // slides in and out, and re-laying out on every one of those is churn.
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            const rect = wrap.getBoundingClientRect();
            if (Math.abs(rect.width - w) < 1 && Math.abs(rect.height - h) < 1) return;
            layout();
            if (prefersReducedMotion) settle();
          })
        : null;
    ro?.observe(wrap);

    // Theme flips swap the palette. Nothing else on <html> concerns us — Lenis
    // adds and removes its own classes there on every scroll.
    const mo = new MutationObserver(() => {
      const next = document.documentElement.classList.contains('dark');
      if (next === dark) return;
      dark = next;
      for (const p of particles) p.c = colorAt(p.nx);
      if (prefersReducedMotion) settle();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('pointermove', onPointer);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

    return () => {
      stop();
      io?.disconnect();
      ro?.disconnect();
      mo.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, [prefersReducedMotion]);

  return (
    // An in-flow band rather than an overlay on the whole footer: pinned to
    // the footer's top it scrolled out of view before the reader reached the
    // end, and stretched over the full height the letter landed among the link
    // columns. Sitting just above the closing row, it is the last thing the
    // page shows — so it gets room to be the size of a finale.
    <div
      ref={wrapRef}
      className="pointer-events-none relative my-6 h-72 w-full overflow-hidden sm:h-96"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
};

export default FooterConstellation;
