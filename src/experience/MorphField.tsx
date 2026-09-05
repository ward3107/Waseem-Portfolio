import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useFont } from '@react-three/drei';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  Mesh,
  Points,
  PointsMaterial,
} from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { Vector3 } from 'three';
import { scrollStore } from './scrollStore';
import type { QualityTier } from './useQualityTier';

/**
 * The journey's connective tissue: ONE cloud of particles that carries every
 * chapter, re-forming into a new shape as the reader scrolls.
 *
 *   01 hero      the brand W, sampled from the real logo typeface
 *   02 services  concentric orbits — offerings circling the brand
 *   03 AI        a clustered neural lattice
 *   04 projects  a fan of screen-shaped panels, echoing the 3D gallery
 *   05 trust     a globe — reach across the north
 *   06 contact   the W again, closing the loop it opened with
 *
 * Why a single cloud rather than six scenes: before this, the 3D world was
 * empty for four of the six chapters, so the story visibly restarted at every
 * section. The same particles persisting — and visibly *becoming* the next
 * shape — is what makes the scroll read as one continuous piece.
 *
 * Morphing is a CPU lerp over typed arrays (a few thousand points costs well
 * under a millisecond) plus a mid-flight swirl so particles swarm to their new
 * places instead of sliding along straight lines.
 */

const SHAPE_COLORS = ['#7965C1', '#8B7BD8', '#00E5FF', '#7FD8E8', '#E3D095', '#A78BFA'];

/** Deterministic pseudo-random so the field looks identical on every load. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Points sampled evenly over the brand "W" letterform. */
function buildW(count: number, font: unknown): Float32Array {
  const out = new Float32Array(count * 3);
  const geo = new TextGeometry('W', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    font: font as any,
    size: 3.2,
    // `depth` replaces the deprecated `height` param in current three.js.
    depth: 0.8,
    curveSegments: 6,
    bevelEnabled: false,
  });
  geo.center();
  const sampler = new MeshSurfaceSampler(new Mesh(geo)).build();
  const p = new Vector3();
  for (let i = 0; i < count; i++) {
    sampler.sample(p);
    out[i * 3] = p.x;
    out[i * 3 + 1] = p.y;
    out[i * 3 + 2] = p.z;
  }
  geo.dispose();
  return out;
}

/** Concentric orbiting rings — the services circling the brand. */
function buildRings(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const r = rng(11);
  for (let i = 0; i < count; i++) {
    const ring = i % 4;
    const radius = 1.4 + ring * 0.72 + (r() - 0.5) * 0.16;
    const a = r() * Math.PI * 2;
    const tilt = (ring - 1.5) * 0.22;
    out[i * 3] = Math.cos(a) * radius;
    out[i * 3 + 1] = Math.sin(a) * radius * 0.62 + tilt;
    out[i * 3 + 2] = Math.sin(a) * radius * 0.4;
  }
  return out;
}

/** A clustered lattice: dense nodes joined by sparse filaments. */
function buildLattice(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const r = rng(23);
  const nodes: number[][] = [];
  for (let n = 0; n < 14; n++) {
    nodes.push([(r() - 0.5) * 6.4, (r() - 0.5) * 3.8, (r() - 0.5) * 4.2]);
  }
  for (let i = 0; i < count; i++) {
    const a = nodes[i % nodes.length];
    if (i % 3 === 0) {
      // filament: sit somewhere along the line to another node
      const b = nodes[(i * 7 + 3) % nodes.length];
      const t = r();
      out[i * 3] = a[0] + (b[0] - a[0]) * t;
      out[i * 3 + 1] = a[1] + (b[1] - a[1]) * t;
      out[i * 3 + 2] = a[2] + (b[2] - a[2]) * t;
    } else {
      // node cloud
      const s = 0.42;
      out[i * 3] = a[0] + (r() - 0.5) * s;
      out[i * 3 + 1] = a[1] + (r() - 0.5) * s;
      out[i * 3 + 2] = a[2] + (r() - 0.5) * s;
    }
  }
  return out;
}

/** Five screen-shaped panels in a fan — echoes the projects gallery. */
function buildPanels(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const r = rng(37);
  for (let i = 0; i < count; i++) {
    const panel = i % 5;
    const c = panel - 2;
    out[i * 3] = c * 1.55 + (r() - 0.5) * 1.3;
    out[i * 3 + 1] = (r() - 0.5) * 1.55 + Math.sin(c) * 0.12;
    out[i * 3 + 2] = -Math.abs(c) * 0.6 + (r() - 0.5) * 0.12;
  }
  return out;
}

/** A hollow globe — reach. */
function buildGlobe(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const r = rng(53);
  for (let i = 0; i < count; i++) {
    // even-ish spherical distribution
    const u = r() * 2 - 1;
    const a = r() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const radius = 2.15 + (r() - 0.5) * 0.08;
    out[i * 3] = Math.cos(a) * s * radius;
    out[i * 3 + 1] = u * radius;
    out[i * 3 + 2] = Math.sin(a) * s * radius;
  }
  return out;
}

const MorphField: React.FC<{ tier: QualityTier }> = ({ tier }) => {
  const count = tier === 'high' ? 5000 : 1600;
  const font = useFont('/fonts/logo-font.json');
  const points = useRef<Points>(null);

  const { shapes, geometry, material, swirl } = useMemo(() => {
    const w = buildW(count, font);
    const list = [w, buildRings(count), buildLattice(count), buildPanels(count), buildGlobe(count), w];

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(new Float32Array(w), 3));

    const mat = new PointsMaterial({
      size: tier === 'high' ? 0.032 : 0.045,
      sizeAttenuation: true,
      color: new Color(SHAPE_COLORS[0]),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    // Per-particle swirl direction, used only while a morph is in flight.
    const r = rng(97);
    const sw = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) sw[i] = (r() - 0.5) * 2;

    return { shapes: list, geometry: geo, material: mat, swirl: sw };
  }, [count, font, tier]);

  const colorA = useMemo(() => new Color(), []);
  const colorB = useMemo(() => new Color(), []);

  useFrame((state, delta) => {
    const obj = points.current;
    if (!obj) return;
    const { journey } = scrollStore.get();

    // Which pair of shapes we sit between, and how far along.
    const seg = MathUtils.clamp(journey, 0, 1) * (shapes.length - 1);
    const i = Math.min(shapes.length - 2, Math.floor(seg));
    const raw = MathUtils.clamp(seg - i, 0, 1);
    const t = raw * raw * (3 - 2 * raw); // smoothstep — organic, not linear
    const from = shapes[i];
    const to = shapes[i + 1];

    // Morph, with a mid-flight bulge so particles swarm rather than slide.
    const arr = (obj.geometry.attributes.position as BufferAttribute).array as Float32Array;
    const bulge = Math.sin(Math.PI * t) * 0.9;
    for (let k = 0; k < arr.length; k++) {
      arr[k] = from[k] + (to[k] - from[k]) * t + swirl[k] * bulge;
    }
    (obj.geometry.attributes.position as BufferAttribute).needsUpdate = true;

    // Chapter tint.
    colorA.set(SHAPE_COLORS[i]);
    colorB.set(SHAPE_COLORS[i + 1]);
    (obj.material as PointsMaterial).color.copy(colorA).lerp(colorB, t);

    // The glass W owns the opening frame; the field rises as it warps away, so
    // the letter reads as dissolving into the cloud that carries the story on.
    const target = 0.28 + 0.72 * MathUtils.clamp(journey / 0.25, 0, 1);
    const mat = obj.material as PointsMaterial;
    mat.opacity = MathUtils.lerp(mat.opacity, target, 1 - Math.exp(-3 * delta));

    // Idle life + pointer parallax.
    obj.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.25 + state.pointer.x * 0.22;
    obj.rotation.x = state.pointer.y * 0.14;
  });

  return <points ref={points} geometry={geometry} material={material} />;
};

export default MorphField;
