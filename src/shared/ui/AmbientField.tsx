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

    let motes: Mote[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;

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

      const cols = document.documentElement.classList.contains('dark') ? DARK : LIGHT;
      // Density by area, capped — a tall page should not mean thousands of dots.
      const count = Math.min(160, Math.round((w * h) / 14000));
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -Math.random() * 0.16 - 0.03,
        r: Math.random() * 1.4 + 0.6,
        c: cols[Math.floor(Math.random() * cols.length)],
        a: Math.random() * 0.35 + 0.15,
      }));
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

    const rebuild = () => {
      build();
      draw();
    };
    rebuild();

    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((e) => (e[0]?.isIntersecting ? start() : stop()), {
            rootMargin: '120px',
          })
        : null;
    if (io) io.observe(wrap);
    else start();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(rebuild) : null;
    ro?.observe(wrap);
    const mo = new MutationObserver(rebuild);
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
