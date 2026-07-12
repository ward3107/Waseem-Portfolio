import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const HEBREW_FONT = '/fonts/heebo.ttf';

interface HebrewDepthTextProps {
  children: string;
  /** World-unit font size. */
  fontSize?: number;
  /** Colour of the bright front face. */
  color?: string;
  /** Colour the extruded side fades toward (the "depth"). */
  depthColor?: string;
  /** Number of stacked layers faking the extrusion. More = smoother/deeper, costlier. */
  layers?: number;
  /** Total depth in world units the layers span. */
  depth?: number;
  /** How strongly the block tilts toward the pointer (radians at screen edge). */
  parallax?: number;
  /** Disable pointer/float motion (reduced-motion callers pass true). */
  still?: boolean;
}

/**
 * HebrewDepthText — the answer to "true 3D extrusion can't shape Hebrew".
 *
 * three.js TextGeometry can't do RTL/joining, so instead of extruding a glyph
 * mesh we render the string many times through troika (via drei <Text>, which
 * shapes Hebrew correctly) and stack the copies along -Z, darkening toward the
 * back. The eye reads the stack as a single solid, dimensional word — while the
 * letters stay correctly shaped and legible.
 *
 * The whole group tilts toward the pointer and breathes gently, so the fake
 * extrusion catches "light" from different angles as you move.
 */
const HebrewDepthText: React.FC<HebrewDepthTextProps> = ({
  children,
  fontSize = 1,
  color = '#ece9fb',
  depthColor = '#2e246b',
  layers = 12,
  depth = 0.45,
  parallax = 0.28,
  still = false,
}) => {
  const group = useRef<THREE.Group>(null);

  // Precompute each layer's z offset and interpolated colour once.
  const stack = useMemo(() => {
    const front = new THREE.Color(color);
    const back = new THREE.Color(depthColor);
    return Array.from({ length: layers }, (_, i) => {
      const t = layers === 1 ? 0 : i / (layers - 1); // 0 = back, 1 = front
      const z = -depth + t * depth;
      const c = back.clone().lerp(front, t);
      return { z, color: `#${c.getHexString()}`, key: i };
    });
  }, [color, depthColor, layers, depth]);

  useFrame((state) => {
    if (!group.current || still) return;
    const { x, y } = state.pointer; // -1..1
    const t = state.clock.elapsedTime;
    // Tilt toward pointer, plus a slow idle breath so it lives when the mouse is still.
    const targetRY = x * parallax + Math.sin(t * 0.5) * 0.04;
    const targetRX = -y * parallax * 0.6 + Math.cos(t * 0.4) * 0.03;
    group.current.rotation.y += (targetRY - group.current.rotation.y) * 0.06;
    group.current.rotation.x += (targetRX - group.current.rotation.x) * 0.06;
    group.current.position.y = Math.sin(t * 0.6) * 0.04;
  });

  return (
    <group ref={group}>
      {stack.map((l) => (
        <Text
          key={l.key}
          font={HEBREW_FONT}
          fontSize={fontSize}
          position={[0, 0, l.z]}
          color={l.color}
          anchorX="center"
          anchorY="middle"
          // troika shapes RTL/Hebrew automatically; 'auto' honours the bidi run.
          direction="auto"
        >
          {children}
        </Text>
      ))}
    </group>
  );
};

export default HebrewDepthText;
