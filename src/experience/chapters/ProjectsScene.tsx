import React, { useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Group, MathUtils, Mesh, MeshBasicMaterial, SRGBColorSpace } from 'three';
import { scrollStore } from '../scrollStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedProjects } from '@/features/projects/data';

const CARD_W = 2.5;
const CARD_H = 1.56;

// The projects chapter occupies scroll range [3/6, 4/6]; its centre is at 3.5/6.
const PROJECTS_CENTER = 3.5 / 6;
const FOCUS_HALF = 0.14; // fade the gallery in/out over ~0.85 of a chapter width.

/**
 * Chapter 4 showpiece — a 3D gallery of the real projects. Each project is a
 * floating screen textured with its screenshot, arranged in a shallow fan that
 * the camera flies toward. Scroll sweeps the fan; hovering a screen lifts and
 * enlarges it; clicking opens the live site. The gallery fades in only around
 * the projects chapter so it costs nothing elsewhere.
 *
 * Accessibility/crawlability live in the DOM layer (ProjectsOverlay renders the
 * real, focusable project links); the canvas is decorative and aria-hidden, so
 * these screens are a visual enhancement on top of that.
 */
const ProjectsScene: React.FC = () => {
  const { t } = useLanguage();
  const projects = useMemo(() => getLocalizedProjects(t), [t]);
  const images = useMemo(() => projects.map((p) => p.image), [projects]);
  const textures = useTexture(images);
  useMemo(() => {
    textures.forEach((tex) => {
      tex.colorSpace = SRGBColorSpace;
    });
  }, [textures]);

  const group = useRef<Group>(null);
  const items = useRef<(Group | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);

  // Fan layout: centre screen closest, outer screens recede and angle inward.
  const layout = useMemo(
    () =>
      projects.map((_, i) => {
        const c = i - (projects.length - 1) / 2; // -2 … 2
        return {
          x: c * 2.35,
          y: Math.sin(c) * 0.18,
          z: -Math.abs(c) * 0.9 - 1.4,
          ry: c * -0.16,
        };
      }),
    [projects]
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const { progress } = scrollStore.get();
    const focus = MathUtils.clamp(1 - Math.abs(progress - PROJECTS_CENTER) / FOCUS_HALF, 0, 1);
    g.visible = focus > 0.005;
    if (!g.visible) return;

    const eased = 1 - Math.exp(-3 * delta);
    // Sweep the fan as you scroll through the chapter + a touch of mouse parallax.
    g.rotation.y = MathUtils.lerp(
      g.rotation.y,
      (progress - PROJECTS_CENTER) * 3 + state.pointer.x * 0.12,
      eased
    );
    // Sit a little above centre (clear of the CTA row / cookie banner) and
    // rise into place as it gains focus.
    g.position.y = MathUtils.lerp(g.position.y, 0.45 + (1 - focus) * -1.6, eased);

    // Fade every material with focus (bezel capped darker than the screen).
    g.traverse((o) => {
      const mat = (o as Mesh).material as MeshBasicMaterial | undefined;
      if (mat && mat.transparent) {
        const cap = (mat.userData?.cap as number) ?? 1;
        mat.opacity = focus * cap;
      }
    });

    // Which screen is swept to the front right now? After the group's rotation,
    // its origin sits nearest the centre line (world-x ≈ 0). That card enlarges
    // on its own, so scrolling on desktop — or swiping on a touch screen, where
    // there is no hover — brings each project forward and enlarges it in turn.
    // This is the "swipe/hover to enlarge" wow the whole gallery is built around.
    const cos = Math.cos(g.rotation.y);
    const sin = Math.sin(g.rotation.y);
    let active = 0;
    let best = Infinity;
    for (let i = 0; i < layout.length; i++) {
      const worldX = Math.abs(layout[i].x * cos + layout[i].z * sin);
      if (worldX < best) {
        best = worldX;
        active = i;
      }
    }

    // Per-screen idle float + lift for the hovered or front-and-centre screen.
    const hoverEase = 1 - Math.exp(-8 * delta);
    items.current.forEach((it, i) => {
      if (!it) return;
      const L = layout[i];
      const lifted = hovered === i || active === i;
      it.scale.setScalar(MathUtils.lerp(it.scale.x, lifted ? 1.12 : 1, hoverEase));
      it.position.z = MathUtils.lerp(it.position.z, L.z + (lifted ? 0.6 : 0), hoverEase);
      it.position.y = L.y + Math.sin(state.clock.elapsedTime * 0.7 + i) * 0.06;
    });
  });

  const enter = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(i);
    document.body.style.cursor = 'pointer';
  };
  const leave = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered((h) => (h === i ? null : h));
    document.body.style.cursor = 'auto';
  };
  const open = (url: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <group ref={group}>
      {projects.map((p, i) => {
        const L = layout[i];
        return (
          <group
            key={p.id}
            ref={(el) => (items.current[i] = el)}
            position={[L.x, L.y, L.z]}
            rotation={[0, L.ry, 0]}
            onPointerOver={enter(i)}
            onPointerOut={leave(i)}
            onClick={p.link ? open(p.link) : undefined}
          >
            {/* Bezel / drop shadow behind the screen. */}
            <mesh position={[0, 0, -0.03]}>
              <planeGeometry args={[CARD_W + 0.16, CARD_H + 0.16]} />
              <meshBasicMaterial
                color={hovered === i ? '#00E5FF' : '#0b1020'}
                transparent
                userData={{ cap: hovered === i ? 0.9 : 0.85 }}
              />
            </mesh>
            {/* The screenshot. */}
            <mesh>
              <planeGeometry args={[CARD_W, CARD_H]} />
              <meshBasicMaterial map={textures[i]} transparent toneMapped={false} userData={{ cap: 1 }} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default ProjectsScene;
