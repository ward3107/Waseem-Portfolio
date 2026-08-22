import React, { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

/**
 * A slow drift of brand-coloured motes behind a page — the same particles that
 * carry the homepage journey, at rest. It is what makes the inner pages read as
 * part of the same world rather than a different site behind the same nav.
 *
 * 2D canvas on purpose: these are ordinary content pages, so the atmosphere has
 * to cost almost nothing — no three.js, no WebGL context. The loop runs only
 * while the field is on screen, and reduced-motion visitors get one static
 * frame of the same dots.
 */

const DARK = ['#7965C1', '#A78BFA', '#00E5FF'];
const LIGHT = ['#483AA0', '#6D28D9', '#0E7490'];

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: string;
  a: number;
}

const AmbientField: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motes: Mote[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let dark = document.documentElement.classList.contains('dark');

    const mote = (): Mote => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -Math.random() * 0.16 - 0.03,
      r: Math.random() * 1.4 + 0.6,
      c: (dark ? DARK : LIGHT)[Math.floor(Math.random() * DARK.length)],
      a: Math.random() * 0.35 + 0.15,
    });

    /**
     * Size the canvas and top the field up to the density the new box wants.
     * Existing motes are carried across and rescaled rather than regenerated —
     * every mote jumping to a fresh random spot reads as a flicker, and this
     * runs on things as ordinary as a mobile address bar sliding away.
     */
    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const sx = w > 0 ? rect.width / w : 1;
      const sy = h > 0 ? rect.height / h : 1;
      w = rect.width;
      h = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (const m of motes) {
        m.x *= sx;
        m.y *= sy;
      }

      // Density by area, capped — a tall page should not mean thousands of dots.
      const count = Math.min(160, Math.round((w * h) / 14000));
      if (motes.length > count) motes.length = count;
      while (motes.length < count) motes.push(mote());
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        ctx.globalAlpha = m.a;
        ctx.fillStyle = m.c;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.y < -4) {
          m.y = h + 4;
          m.x = Math.random() * w;
        }
        if (m.x < -4) m.x = w + 4;
        if (m.x > w + 4) m.x = -4;
      }
      draw();
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

    layout();
    draw();

    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((e) => (e[0]?.isIntersecting ? start() : stop()), {
            rootMargin: '120px',
          })
        : null;
    if (io) io.observe(wrap);
    else start();

    // Real size changes only — this fires as a mobile address bar slides.
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            const rect = wrap.getBoundingClientRect();
            if (Math.abs(rect.width - w) < 1 && Math.abs(rect.height - h) < 1) return;
            layout();
            draw();
          })
        : null;
    ro?.observe(wrap);

    // Theme flips recolour in place. Nothing else on <html> concerns us.
    const mo = new MutationObserver(() => {
      const next = document.documentElement.classList.contains('dark');
      if (next === dark) return;
      dark = next;
      const cols = dark ? DARK : LIGHT;
      for (const m of motes) m.c = cols[Math.floor(Math.random() * cols.length)];
      draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      stop();
      io?.disconnect();
      ro?.disconnect();
      mo.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

export default AmbientField;
