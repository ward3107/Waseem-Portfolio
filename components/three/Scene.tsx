import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Props as CanvasProps } from '@react-three/fiber';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface SceneProps extends Omit<CanvasProps, 'children'> {
  children: React.ReactNode;
  /** Static HTML shown instead of WebGL for reduced-motion users and as SSR/no-WebGL fallback. */
  fallback?: React.ReactNode;
  /** Extra classes for the wrapping element. */
  className?: string;
  /** Minimum height so the canvas reserves layout space. */
  minHeight?: string | number;
}

/**
 * Detect WebGL support once. Returns null while unknown, boolean once resolved.
 */
const detectWebGL = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};

/**
 * Scene — the single wrapper every 3D section mounts through.
 *
 * Responsibilities:
 *  - Respect prefers-reduced-motion: render the static `fallback` instead of WebGL.
 *  - Guard against missing WebGL support with the same fallback.
 *  - Lazy-activate: the <Canvas> only mounts once the section scrolls near the viewport
 *    (IntersectionObserver), so off-screen scenes cost nothing.
 *  - Clamp devicePixelRatio to keep high-DPI phones from melting.
 *  - Mark the visual layer aria-hidden; real text lives in the DOM behind it.
 */
const Scene: React.FC<SceneProps> = ({
  children,
  fallback = null,
  className = '',
  minHeight = '100%',
  dpr = [1, 1.5],
  gl,
  camera,
  ...rest
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [inView, setInView] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWebglOk(detectWebGL());
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showCanvas = webglOk === true && !prefersReducedMotion && inView;

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: 'relative', width: '100%', minHeight }}
    >
      {showCanvas ? (
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
          <Canvas
            dpr={dpr}
            gl={
              {
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
                ...(gl as object),
              } as CanvasProps['gl']
            }
            camera={
              { position: [0, 0, 6], fov: 40, ...(camera as object) } as CanvasProps['camera']
            }
            {...rest}
          >
            <Suspense fallback={null}>{children}</Suspense>
          </Canvas>
        </div>
      ) : (
        fallback
      )}
    </div>
  );
};

export default Scene;
