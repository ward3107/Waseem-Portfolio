import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

// Heebo covers Hebrew + Latin; Cairo covers Arabic + Latin. troika needs a font
// whose glyphs actually include the string's script, so callers pick per language.
export const FONT_HE = '/fonts/heebo.ttf';
export const FONT_AR = '/fonts/cairo.ttf';
export const fontForLanguage = (language: string): string =>
  language === 'ar' ? FONT_AR : FONT_HE;

const detectWebGL = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch {
    return false;
  }
};

interface DepthWordProps {
  word: string;
  font: string;
  color: string;
  depthColor: string;
  still: boolean;
}

/** The word as a shallow stack of troika layers → dimensional but refined. */
const DepthWord: React.FC<DepthWordProps> = ({ word, font, color, depthColor, still }) => {
  const outer = useRef<THREE.Group>(null); // holds the fit scale
  const inner = useRef<THREE.Group>(null); // holds the tilt animation
  const { viewport } = useThree();
  const [wordWidth, setWordWidth] = useState(0);
  // 10 stacked troika layers produced visible ghosting on high-DPI displays;
  // 6 keeps the depth cue while sharpening the front-face silhouette.
  const LAYERS = 6;
  const DEPTH = 0.12;
  const FILL = 0.9; // fraction of the canvas width the word should span

  const stack = useMemo(() => {
    const front = new THREE.Color(color);
    const back = new THREE.Color(depthColor);
    return Array.from({ length: LAYERS }, (_, i) => {
      const t = i / (LAYERS - 1);
      return { z: -DEPTH + t * DEPTH, color: `#${back.clone().lerp(front, t).getHexString()}`, key: i };
    });
  }, [color, depthColor]);

  // Scale the whole word so its measured width fills FILL of the viewport width.
  const scale = wordWidth > 0 ? (viewport.width * FILL) / wordWidth : 0.001;

  useFrame((state) => {
    if (!inner.current || still) return;
    const { x, y } = state.pointer;
    // Tilt follows the pointer only — no idle jitter, so the layered stack stays
    // sharp (no ghosting) until the user actually interacts.
    const ry = x * 0.16;
    const rx = -y * 0.1;
    inner.current.rotation.y += (ry - inner.current.rotation.y) * 0.06;
    inner.current.rotation.x += (rx - inner.current.rotation.x) * 0.06;
  });

  return (
    <group ref={outer} scale={scale}>
      <group ref={inner}>
        {stack.map((l, i) => (
          <Text
            key={l.key}
            font={font}
            fontSize={1}
            position={[0, 0, l.z]}
            color={l.color}
            anchorX="center"
            anchorY="middle"
            direction="auto"
            onSync={
              i === LAYERS - 1
                ? (troika: THREE.Mesh) => {
                    troika.geometry.computeBoundingBox();
                    const bb = troika.geometry.boundingBox;
                    if (bb) setWordWidth(bb.max.x - bb.min.x);
                  }
                : undefined
            }
          >
            {word}
          </Text>
        ))}
      </group>
    </group>
  );
};

interface Dimensional3DWordProps {
  /** The word to render dimensionally (also used for the accessible/fallback copy). */
  word: string;
  /** Class names for the styled fallback word (reduced-motion / no-WebGL / SSR / phones). */
  fallbackClassName: string;
  /** Font URL whose glyphs cover the word's script — use fontForLanguage(). */
  font?: string;
  /** Front-face color (dark-mode only — light mode uses the styled fallback). */
  color?: string;
  /** Back-depth color (word extrudes from this to `color`). */
  depthColor?: string;
}

/**
 * Dimensional3DWord — renders one word as dimensional 3D type, inline, at the
 * size of the surrounding text. Introduced for the hero's emphasized word and
 * reused for section headings.
 *
 * The styled fallback word always occupies the box (so line-height and wrapping
 * are unchanged); when WebGL is available, motion is allowed, and the viewport
 * is wide enough, a transparent canvas is overlaid on that exact box and the
 * fallback is hidden. A visually hidden copy keeps the word in the accessibility
 * tree and for SEO.
 */
const Dimensional3DWord: React.FC<Dimensional3DWordProps> = ({
  word,
  fallbackClassName,
  font = FONT_HE,
  color = '#efe4b0',
  depthColor = '#8a6d16',
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [webglOk, setWebglOk] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const [inView, setInView] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setWebglOk(detectWebGL());
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsWide(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Follow the app's `dark` class on <html>, not just the OS preference — the
  // portfolio has a theme toggle. Colors that read on `bg-slate-50` differ from
  // colors that read on `bg-slate-950`.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((e) => e.isIntersecting)),
      { rootMargin: '250px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Only mount the WebGL word in dark mode. On light backgrounds the layered
  // troika stack reads as visible gold slashes instead of depth (the tilt +
  // per-layer color lerp both fight the light bg), and the styled gradient
  // fallback below already looks clean.
  const active = webglOk && !prefersReducedMotion && isWide && inView && isDark;
  const activeColor = color;
  const activeDepthColor = depthColor;

  return (
    <span ref={wrapRef} className="relative inline-block align-baseline" style={{ lineHeight: 1 }}>
      {/* Sizing + fallback. Hidden (but still laid out) when the canvas is active. */}
      <span className={fallbackClassName} style={active ? { opacity: 0 } : undefined} aria-hidden={active}>
        {word}
      </span>

      {active && (
        <span className="absolute inset-0" aria-hidden="true" style={{ pointerEvents: 'none' }}>
          <Canvas
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 4], fov: 40 }}
            style={{ overflow: 'visible' }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[2, 3, 4]} intensity={1.2} />
            <DepthWord word={word} font={font} color={activeColor} depthColor={activeDepthColor} still={false} />
            <EffectComposer>
              <Bloom intensity={0.15} luminanceThreshold={0.85} luminanceSmoothing={0.6} mipmapBlur={false} />
            </EffectComposer>
          </Canvas>
        </span>
      )}

      {active && <span className="sr-only">{word}</span>}
    </span>
  );
};

export default Dimensional3DWord;
