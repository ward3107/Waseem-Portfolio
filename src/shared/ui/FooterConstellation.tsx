import React, { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

/**
 * The story's epilogue: the particles that carried the scroll journey settle in
 * the footer and reassemble the brand W one last time. Sweep a cursor through
 * them and they scatter, then drift back into the letter.
 *
 * Deliberately a 2D canvas rather than WebGL: the footer renders on every page
 * including the classic site, so this has to cost nothing — no three.js, no
 * second WebGL context, a few KB of code. The letterform is sampled from the
 * glyph itself (drawn to an offscreen canvas, then read back), so it needs no
 * font asset and follows the heading typeface.
 *
 * Cheap by construction: the loop only runs while the footer is actually on
 * screen, and reduced-motion visitors get a single static render of the same
 * letter instead of an animation.
 */

const DARK = ['#7965C1', '#A78BFA', '#00E5FF'];
const LIGHT = ['#483AA0', '#6D28D9', '#0E7490'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number; // home
  hy: number;
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
    const pointer = { x: -9999, y: -9999 };

    const palette = () =>
      document.documentElement.classList.contains('dark') ? DARK : LIGHT;

    /** Sample the glyph's own pixels for particle homes. */
    const sampleGlyph = (): { x: number; y: number }[] => {
      const SW = 260;
      const SH = 150;
      const off = document.createElement('canvas');
      off.width = SW;
      off.height = SH;
      const octx = off.getContext('2d');
      if (!octx) return [];
      octx.fillStyle = '#fff';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.font = `900 ${SH * 1.02}px "Space Grotesk", Inter, system-ui, sans-serif`;
      octx.fillText('W', SW / 2, SH / 2);
      const data = octx.getImageData(0, 0, SW, SH).data;

      const pts: { x: number; y: number }[] = [];
      const step = 2;
      for (let y = 0; y < SH; y += step) {
        for (let x = 0; x < SW; x += step) {
          if (data[(y * SW + x) * 4 + 3] > 128) pts.push({ x: x / SW, y: y / SH });
        }
      }
      return pts;
    };

    const build = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (w < 2 || h < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pts = sampleGlyph();
      if (!pts.length) return;

      // Fill the crown band. The letter used to be centred in the whole
      // footer, which on a phone is thousands of pixels tall — the mark landed
      // among the link columns and read as scattered dots.
      const artW = Math.min(w * 0.72, 460);
      const artH = artW * 0.55;
      const ox = (w - artW) / 2;
      const oy = (h - artH) / 2;

      const budget = w < 640 ? 240 : 620;
      const stride = Math.max(1, Math.floor(pts.length / budget));
      const cols = palette();

      particles = [];
      for (let i = 0; i < pts.length; i += stride) {
        const p = pts[i];
        const hx = ox + p.x * artW;
        const hy = oy + p.y * artH;
        particles.push({
          x: hx + (Math.random() - 0.5) * 120,
          y: hy + (Math.random() - 0.5) * 80,
          vx: 0,
          vy: 0,
          hx,
          hy,
          c: cols[Math.floor(p.x * cols.length) % cols.length],
          r: Math.random() * 0.9 + 0.7,
        });
      }
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

        // Cursor pushes them out of the way.
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 12000 && d2 > 0.01) {
          const f = (1 - d2 / 12000) * 2.2;
          const d = Math.sqrt(d2);
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;
      }
      draw(0.55);
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

    const onPointer = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const rebuild = () => {
      build();
      if (prefersReducedMotion) {
        // Static render: the letter, already assembled.
        for (const p of particles) {
          p.x = p.hx;
          p.y = p.hy;
        }
        draw(0.5);
      }
    };

    rebuild();

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

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(rebuild) : null;
    ro?.observe(wrap);

    // Theme flips swap the palette.
    const mo = new MutationObserver(rebuild);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('pointermove', onPointer);
    wrap.addEventListener('pointerleave', onLeave);

    return () => {
      stop();
      io?.disconnect();
      ro?.disconnect();
      mo.disconnect();
      window.removeEventListener('pointermove', onPointer);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, [prefersReducedMotion]);

  return (
    // An in-flow band rather than an overlay on the whole footer: pinned to
    // the footer's top it scrolled out of view before the reader reached the
    // end, and stretched over the full height the letter landed among the link
    // columns. Sitting just above the closing row, it is the last thing the
    // page shows.
    <div
      ref={wrapRef}
      className="pointer-events-none relative my-4 h-40 w-full overflow-hidden sm:h-48"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
};

export default FooterConstellation;
