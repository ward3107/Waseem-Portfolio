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
  const LAYERS = 10;
  const DEPTH = 0.32;
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
    const time = state.clock.elapsedTime;
    // Restrained tilt + slow idle breath so the depth catches light without spinning out of frame.
    const ry = x * 0.16 + Math.sin(time * 0.5) * 0.03;
    const rx = -y * 0.1 + Math.cos(time * 0.4) * 0.02;
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
  color?: string;
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
  // Inline WebGL type reads well at headline scale (md+); on phones the box is
  // too small for it to land, so we keep the crisp styled word there instead.
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    setWebglOk(detectWebGL());
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsWide(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const active = webglOk && !prefersReducedMotion && isWide;

  return (
    <span className="relative inline-block align-baseline" style={{ lineHeight: 1 }}>
      {/* Sizing + fallback. Hidden (but still laid out) when the canvas is active. */}
      <span className={fallbackClassName} style={active ? { opacity: 0 } : undefined} aria-hidden={active}>
        {word}
      </span>

      {active && (
        <span className="absolute inset-0" aria-hidden="true" style={{ pointerEvents: 'none' }}>
          <Canvas
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 4], fov: 40 }}
            style={{ overflow: 'visible' }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[2, 3, 4]} intensity={1.2} />
            <DepthWord word={word} font={font} color={color} depthColor={depthColor} still={false} />
            <EffectComposer>
              <Bloom intensity={0.35} luminanceThreshold={0.6} luminanceSmoothing={0.9} mipmapBlur />
            </EffectComposer>
          </Canvas>
        </span>
      )}

      {active && <span className="sr-only">{word}</span>}
    </span>
  );
};

export default Dimensional3DWord;
