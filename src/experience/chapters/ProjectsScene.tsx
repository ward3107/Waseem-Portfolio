import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Group, MathUtils, Mesh, MeshBasicMaterial, SRGBColorSpace } from 'three';
import { scrollStore } from '../scrollStore';
import { CHAPTERS } from '../storyboard';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedProjects } from '@/features/projects/data';

const CARD_W = 2.5;
const CARD_H = 1.56;

// Where the projects chapter sits on the *journey* timeline (the chapter-only
// axis the camera rig is keyed to, ignoring the ~15% footer). Chapter i is
// centred at journey = i / (n - 1), so the gallery peaks exactly when the
// projects section fills the viewport. The old code faded off the raw page
// `progress` centred at 3.5/6 — but the footer stretches `progress`, which
// pushed this peak late, leaving the fan ~90% visible once the reviews chapter
// had already scrolled in. That was the bleed into the next section.
const PROJECTS_CENTER =
  Math.max(0, CHAPTERS.findIndex((c) => c.id === 'projects')) / (CHAPTERS.length - 1);
// Fade the gallery fully out well before the neighbouring chapters (each ±0.2
// away on this axis), so it stays confined to its own section and never bleeds
// over the reviews/certifications beat.
const FOCUS_HALF = 0.12;

const BEZEL_ACTIVE = '#00E5FF';
const BEZEL_IDLE = '#0b1020';

/**
 * Chapter 4 showpiece — a 3D gallery of the real projects. Each project is a
 * floating screen textured with its screenshot, arranged in a shallow fan that
 * the camera flies toward. Scrolling (or swiping) sweeps the fan and the screen
 * swept to the front lifts and enlarges. The gallery fades in only around the
 * projects chapter so it costs nothing elsewhere.
 *
 * It is purely DECORATIVE — no pointer handlers, so it is never a raycast
 * target. That matters: the DOM content layer above the canvas is
 * pointer-events-none, so a click on empty space falls through to the canvas;
 * when these wide planes were clickable they caught those stray clicks and
 * opened a random project's live site. Navigation lives entirely in the DOM
 * layer (ProjectsOverlay renders the real, focusable, crawlable project links),
 * so these screens are a visual enhancement on top of that and safe to make
 * inert.
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
    const { journey } = scrollStore.get();
    const focus = MathUtils.clamp(1 - Math.abs(journey - PROJECTS_CENTER) / FOCUS_HALF, 0, 1);
    g.visible = focus > 0.005;
    if (!g.visible) return;

    const eased = 1 - Math.exp(-3 * delta);
    // Sweep the fan as you scroll through the chapter + a touch of mouse parallax.
    g.rotation.y = MathUtils.lerp(
      g.rotation.y,
      (journey - PROJECTS_CENTER) * 3 + state.pointer.x * 0.12,
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
    // on its own, so scrolling on desktop — or swiping on a touch screen — brings
    // each project forward and enlarges it in turn. This is the "swipe to
    // enlarge" wow the gallery is built around, and it needs no pointer events.
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

    // Per-screen idle float + lift for the front-and-centre screen, whose bezel
    // also warms to the brand cyan so the "current" project reads clearly.
    const hoverEase = 1 - Math.exp(-8 * delta);
    items.current.forEach((it, i) => {
      if (!it) return;
      const L = layout[i];
      const lifted = active === i;
      it.scale.setScalar(MathUtils.lerp(it.scale.x, lifted ? 1.12 : 1, hoverEase));
      it.position.z = MathUtils.lerp(it.position.z, L.z + (lifted ? 0.6 : 0), hoverEase);
      it.position.y = L.y + Math.sin(state.clock.elapsedTime * 0.7 + i) * 0.06;
      const bezel = (it.children[0] as Mesh | undefined)?.material as MeshBasicMaterial | undefined;
      if (bezel) bezel.color.set(lifted ? BEZEL_ACTIVE : BEZEL_IDLE);
    });
  });

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
          >
            {/* Bezel / drop shadow behind the screen (colour set per frame). */}
            <mesh position={[0, 0, -0.03]}>
              <planeGeometry args={[CARD_W + 0.16, CARD_H + 0.16]} />
              <meshBasicMaterial color={BEZEL_IDLE} transparent userData={{ cap: 0.85 }} />
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
