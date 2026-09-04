import React, { useMemo, useRef, useSyncExternalStore } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  Points,
  PointsMaterial,
  type Group,
} from 'three';
import { audioTourStore } from '../audioTourStore';
import type { QualityTier } from '../useQualityTier';
import { getPrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

/**
 * The "assistant" — a face rendered as a blue/cyan particle cloud with flowing
 * streams sweeping around it (the same additive-Points language as the brand
 * "W"), inspired by an AI-face reference. It is deliberately face-shaped —
 * brows, almond eyes with bright pupils, a forward nose ridge, and prominent
 * upper/lower lips that visibly part with the live audio — so a visitor plainly
 * sees it *talking*. Ambient flow-lines drift around it for life.
 *
 * It is docked to the SIDE (bottom-left, above the tour controls), front-facing
 * so the lips stay readable, growing a little while a live call is connected.
 * Always pointer-events-none; skipped under reduced-motion. Mounted only while
 * the tour narrates or a conversation is connected.
 */

// Blue / cyan palette.
const CYAN = '#00E5FF';
const SKY = '#7FD8E8';
const BLUE = '#3B82F6';

const MOUTH_CY = -0.5;
const MOUTH_RX = 0.3;

// Point roles for per-frame animation.
const HEAD = 0;
const EYE = 1;
const LIP_UP = 2;
const LIP_LO = 3;
const NOSE = 4;

type FaceData = {
  geometry: BufferGeometry;
  rest: Float32Array;
  kind: Uint8Array;
  aux: Float32Array; // eyes: dy from centre; lips: 0..1 across width (unused sign)
  phase: Float32Array;
};

// z-bulge so the cloud reads as a 3D relief (centre/nose forward).
const bulge = (x: number, y: number) => 0.28 * Math.max(0, 1 - (x * x) / 0.8 - (y * y) / 1.4);

function buildFace(tier: QualityTier): FaceData {
  const high = tier === 'high';
  const pts: number[] = [];
  const cols: number[] = [];
  const kinds: number[] = [];
  const auxs: number[] = [];
  const phs: number[] = [];

  const cCyan = new Color(CYAN);
  const cSky = new Color(SKY);
  const cBlue = new Color(BLUE);

  const push = (x: number, y: number, z: number, c: Color, k: number, a: number) => {
    pts.push(x, y, z);
    cols.push(c.r, c.g, c.b);
    kinds.push(k);
    auxs.push(a);
    phs.push(Math.random() * Math.PI * 2);
  };

  const N = high ? 1 : 0.55; // density scale

  // Head silhouette — an oval with a chin taper.
  const headN = Math.round(180 * N);
  for (let i = 0; i < headN; i++) {
    const ang = (i / headN) * Math.PI * 2;
    const taper = 1 - Math.max(0, -Math.sin(ang)) * 0.28; // narrow the chin
    const x = Math.cos(ang) * 0.85 * taper;
    const y = Math.sin(ang) * 1.12;
    push(x, y, bulge(x, y) * 0.4, cSky, HEAD, 0);
  }
  // Sparse cheek/face fill (dim blue) so it reads as a surface, not just a ring.
  const fillN = Math.round(160 * N);
  for (let i = 0; i < fillN; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random());
    const taper = 1 - Math.max(0, -Math.sin(a)) * 0.28;
    const x = Math.cos(a) * 0.8 * taper * r;
    const y = Math.sin(a) * 1.05 * r;
    push(x, y, bulge(x, y), cBlue, HEAD, 0);
  }
  // Brows.
  for (const dir of [-1, 1]) {
    const n = Math.round(16 * N);
    for (let i = 0; i < n; i++) {
      const tx = i / (n - 1);
      const x = dir * (0.14 + tx * 0.34);
      const y = 0.44 - tx * 0.05;
      push(x, y, bulge(x, y) + 0.04, cCyan, HEAD, 0);
    }
  }
  // Eyes — almond outline + a bright pupil.
  for (const dir of [-1, 1]) {
    const n = Math.round(26 * N);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2;
      const dx = Math.cos(ang) * 0.17;
      const dy = Math.sin(ang) * 0.09;
      const x = dir * 0.32 + dx;
      const y = 0.24 + dy;
      push(x, y, bulge(x, y) + 0.05, cSky, EYE, dy);
    }
    const pn = Math.round(6 * N);
    for (let i = 0; i < pn; i++) {
      const x = dir * 0.32 + (Math.random() - 0.5) * 0.05;
      const y = 0.24 + (Math.random() - 0.5) * 0.05;
      push(x, y, bulge(x, y) + 0.08, cCyan, EYE, y - 0.24);
    }
  }
  // Nose — a forward ridge + two nostril dots.
  const noseN = Math.round(26 * N);
  for (let i = 0; i < noseN; i++) {
    const ty = i / (noseN - 1);
    const y = 0.18 - ty * 0.32;
    const x = (Math.random() - 0.5) * 0.05;
    const z = 0.1 + ty * 0.28; // grows forward toward the tip
    push(x, y, z, cSky, NOSE, 0);
  }
  for (const dir of [-1, 1]) push(dir * 0.08, -0.16, 0.24, cCyan, NOSE, 0);

  // Lips — upper and lower arcs that part with the audio.
  const lipN = Math.round(34 * N);
  for (let i = 0; i < lipN; i++) {
    const tx = (i / (lipN - 1)) * 2 - 1; // -1..1 across the mouth
    const x = tx * MOUTH_RX;
    const dip = (1 - tx * tx) * 0.05;
    // upper lip (slight cupid bow), lower lip (fuller curve)
    push(x, MOUTH_CY + 0.05 - dip, bulge(x, MOUTH_CY) + 0.03, cCyan, LIP_UP, tx);
    push(x, MOUTH_CY - 0.05 + dip * 1.4, bulge(x, MOUTH_CY) + 0.03, cCyan, LIP_LO, tx);
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(pts), 3));
  geo.setAttribute('color', new BufferAttribute(new Float32Array(cols), 3));
  return {
    geometry: geo,
    rest: new Float32Array(pts),
    kind: new Uint8Array(kinds),
    aux: new Float32Array(auxs),
    phase: new Float32Array(phs),
  };
}

// Flowing streams that sweep around the face — the reference's signature motion.
function buildFlow(tier: QualityTier): { geometry: BufferGeometry; base: Float32Array; meta: Float32Array } {
  const streams = tier === 'high' ? 7 : 4;
  const per = tier === 'high' ? 70 : 40;
  const total = streams * per;
  const pos = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  const meta = new Float32Array(total * 3); // [radius, angle0, speed]
  const c = new Color(SKY);
  let o = 0;
  for (let s = 0; s < streams; s++) {
    const radius = 1.35 + s * 0.16;
    const speed = 0.12 + (s % 3) * 0.05;
    const span = Math.PI * (1.1 + Math.random() * 0.6);
    const start = -span / 2 + (Math.random() - 0.5) * 0.6;
    for (let j = 0; j < per; j++) {
      const a = start + (j / per) * span;
      meta[o * 3] = radius + (Math.random() - 0.5) * 0.1;
      meta[o * 3 + 1] = a;
      meta[o * 3 + 2] = speed;
      col[o * 3] = c.r;
      col[o * 3 + 1] = c.g;
      col[o * 3 + 2] = c.b;
      o++;
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(pos, 3));
  geo.setAttribute('color', new BufferAttribute(col, 3));
  return { geometry: geo, base: pos, meta };
}

const Face: React.FC<{ tier: QualityTier }> = ({ tier }) => {
  const group = useRef<Group>(null);
  const facePts = useRef<Points>(null);
  const flowPts = useRef<Points>(null);
  const blink = useRef({ next: 1.5, until: 0 });
  const openRef = useRef(0);

  const face = useMemo(() => buildFace(tier), [tier]);
  const flow = useMemo(() => buildFlow(tier), [tier]);

  const faceMat = useMemo(
    () =>
      new PointsMaterial({
        size: tier === 'high' ? 0.045 : 0.06,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [tier]
  );
  const flowMat = useMemo(
    () =>
      new PointsMaterial({
        size: tier === 'high' ? 0.03 : 0.045,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [tier]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { mouth: openness, speaking } = audioTourStore.get();
    openRef.current = MathUtils.lerp(openRef.current, openness, 0.4);
    const open = openRef.current;

    const b = blink.current;
    if (t > b.next && t > b.until) {
      b.until = t + 0.12;
      b.next = t + 2.6 + Math.random() * 3.6;
    }
    const blinkScale = t < b.until ? 0.12 : 1;
    const drift = speaking ? 0.04 : 0.025;

    // Face points.
    const fo = facePts.current;
    if (fo) {
      const arr = (fo.geometry.attributes.position as BufferAttribute).array as Float32Array;
      const { rest, kind, aux, phase } = face;
      for (let i = 0; i < kind.length; i++) {
        const ph = phase[i];
        const dx = Math.sin(t * 0.9 + ph) * drift;
        const dy = Math.cos(t * 0.8 + ph * 1.3) * drift;
        const dz = Math.sin(t * 1.1 + ph * 0.7) * drift;
        arr[i * 3] = rest[i * 3] + dx;
        arr[i * 3 + 2] = rest[i * 3 + 2] + dz;
        const k = kind[i];
        if (k === LIP_UP) {
          arr[i * 3 + 1] = rest[i * 3 + 1] + open * 0.1 + dy * 0.5;
        } else if (k === LIP_LO) {
          arr[i * 3 + 1] = rest[i * 3 + 1] - open * 0.32 + dy * 0.5;
        } else if (k === EYE) {
          arr[i * 3 + 1] = 0.24 + aux[i] * blinkScale + dy * 0.4;
        } else {
          arr[i * 3 + 1] = rest[i * 3 + 1] + dy;
        }
      }
      (fo.geometry.attributes.position as BufferAttribute).needsUpdate = true;
    }

    // Flow streams — sweep around, with a gentle vertical wave.
    const wo = flowPts.current;
    if (wo) {
      const arr = (wo.geometry.attributes.position as BufferAttribute).array as Float32Array;
      const meta = flow.meta;
      for (let i = 0; i < meta.length / 3; i++) {
        const radius = meta[i * 3];
        const a = meta[i * 3 + 1] + t * meta[i * 3 + 2];
        arr[i * 3] = Math.cos(a) * radius;
        arr[i * 3 + 1] = Math.sin(a) * radius * 0.9 + Math.sin(t * 0.6 + a * 2) * 0.12;
        arr[i * 3 + 2] = -0.5 + Math.sin(a * 1.5 + t * 0.3) * 0.4;
      }
      (wo.geometry.attributes.position as BufferAttribute).needsUpdate = true;
    }

    // Front-facing sway (keeps the lips readable) + breathing.
    if (group.current) {
      const energy = speaking ? 1 : 0.6;
      group.current.rotation.y = Math.sin(t * 0.4) * 0.22 * energy;
      group.current.rotation.x = Math.sin(t * 0.7 + 1) * 0.07 * energy;
      group.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.015);
    }
  });

  return (
    <group ref={group}>
      <points ref={flowPts} geometry={flow.geometry} material={flowMat} />
      <points ref={facePts} geometry={face.geometry} material={faceMat} />
    </group>
  );
};

type Mode = 'off' | 'guide' | 'call';

const HeadCanvas: React.FC<{ tier: QualityTier; mode: Mode }> = ({ tier, mode }) => {
  // Docked to the side (bottom-left, above the tour controls); a touch bigger on
  // a live call. Portrait box suits a face; a radial mask fades the flow edges.
  const box = mode === 'call' ? 'h-72 w-60 sm:h-80 sm:w-64' : 'h-56 w-48 sm:h-64 sm:w-52';
  return (
    <div
      className={`pointer-events-none fixed bottom-24 left-3 z-40 transition-all duration-500 ease-out sm:bottom-28 ${box}`}
      style={{
        WebkitMaskImage: 'radial-gradient(closest-side, #000 78%, transparent 100%)',
        maskImage: 'radial-gradient(closest-side, #000 78%, transparent 100%)',
      }}
      aria-hidden="true"
    >
      <Canvas
        dpr={tier === 'high' ? [1, 1.5] : [1, 1]}
        camera={{ position: [0, 0, 3.4], fov: 42, near: 0.1, far: 20 }}
        gl={{ antialias: tier === 'high', alpha: true, powerPreference: 'low-power' }}
      >
        <Face tier={tier} />
      </Canvas>
    </div>
  );
};

const subscribe = (cb: () => void) => audioTourStore.subscribe(cb);
const getMode = (): Mode => {
  const s = audioTourStore.get();
  if (!s.active && !s.conversing) return 'off';
  return s.conversing ? 'call' : 'guide';
};

const TalkingHead: React.FC<{ tier: QualityTier }> = ({ tier }) => {
  const mode = useSyncExternalStore(subscribe, getMode, () => 'off' as Mode);
  const reduced = useMemo(() => getPrefersReducedMotion(), []);
  if (mode === 'off' || reduced) return null;
  return <HeadCanvas tier={tier} mode={mode} />;
};

export default TalkingHead;
