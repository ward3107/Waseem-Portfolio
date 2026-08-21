import React, { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei';
import Scene from './Scene';
import type { QualityTier } from './useQualityTier';

/**
 * The React Three Fiber `<Canvas>` — deliberately the ONLY module that pulls in
 * @react-three/fiber, drei, and three. It is loaded via React.lazy from
 * Experience.tsx, so the entire WebGL bundle is a separate async chunk that
 * reduced-motion / no-WebGL / mobile visitors (who render the classic DOM site)
 * never download.
 *
 * Performance posture (matches the rest of the codebase):
 *   - dpr clamped to [1, 1.5] so retina phones/laptops don't render 4× the pixels.
 *   - <AdaptiveDpr> drops resolution during camera movement and restores it at rest.
 *   - <AdaptiveEvents> pauses raycasting while moving.
 *   - <Preload all> warms GPU uploads during the Suspense boundary, avoiding hitches.
 */

/** Bridges a real WebGL context-loss into a React callback so the parent can
 *  fall back to the classic site instead of showing a dead black canvas. */
const ContextLossBridge: React.FC<{ onLost: () => void }> = ({ onLost }) => {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const handler = (e: Event) => {
      e.preventDefault();
      onLost();
    };
    canvas.addEventListener('webglcontextlost', handler as EventListener);
    return () =>
      canvas.removeEventListener('webglcontextlost', handler as EventListener);
  }, [gl, onLost]);
  return null;
};

interface ExperienceCanvasProps {
  onContextLost: () => void;
  tier: QualityTier;
}

const ExperienceCanvas: React.FC<ExperienceCanvasProps> = ({ onContextLost, tier }) => {
  return (
    <Canvas
      // Cap the pixel ratio harder on the low tier — phones have very high DPRs,
      // and rendering at native resolution is the single biggest mobile cost.
      dpr={tier === 'high' ? [1, 1.5] : [1, 1]}
      camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 100 }}
      gl={{ antialias: tier === 'high', alpha: true, powerPreference: 'high-performance' }}
      // The canvas is a decorative backdrop; the real, focusable content lives
      // in the DOM layer above it. Hide it from assistive tech entirely.
      aria-hidden="true"
    >
      <ContextLossBridge onLost={onContextLost} />
      <Scene tier={tier} />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <Preload all />
    </Canvas>
  );
};

export default ExperienceCanvas;
