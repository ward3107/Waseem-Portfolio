import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import { audioTourStore } from '../audioTourStore';
import { getPrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

/**
 * The "assistant" — a premium particle-face avatar (generated with Higgsfield
 * from the brand's blue/cyan look) that plays as a small looping video while the
 * assistant is active, docked to the SIDE (bottom-left) so a visitor plainly
 * sees it speaking. The video's mouth and flowing particles animate on their own
 * loop; we drive a cyan glow + subtle scale from the live audio amplitude
 * (audioTourStore) so the avatar visibly reacts to what's being said, and dim it
 * a touch when quiet.
 *
 * Assets are pre-optimised and served same-origin: a 512px, ~330KB muted MP4
 * plus a 62KB WebP poster (shown instantly, and used on its own under
 * reduced-motion). Muted + playsInline + autoplay, so it starts with no gesture
 * and works on iOS. Always pointer-events-none; skipped-to-poster under
 * reduced-motion. Mounted only while the tour narrates or a call is connected.
 *
 * Responsive: compact on phones, larger on desktop, a touch bigger on a live
 * call — and always clear of the bottom control bar and the WhatsApp / Talk CTAs
 * (it sits on the free left edge, above the audio controls).
 */

const VIDEO_SRC = '/avatar/assistant.mp4';
const POSTER_SRC = '/avatar/assistant-poster.webp';

// Master on/off switch for the assistant face. OFF by default so live visitors
// don't see it while it's still being refined. To turn it on for everyone,
// either set VITE_ENABLE_ASSISTANT_FACE=true in the host env (Vercel) and
// redeploy, or flip this fallback to 'true'. The whole avatar (video, glow,
// responsive dock) stays wired up regardless — this only controls visibility.
const FACE_ENABLED =
  ((import.meta.env.VITE_ENABLE_ASSISTANT_FACE as string | undefined) ?? 'false') === 'true';

type Mode = 'off' | 'guide' | 'call';

const subscribe = (cb: () => void) => audioTourStore.subscribe(cb);
const getMode = (): Mode => {
  const s = audioTourStore.get();
  if (!s.active && !s.conversing) return 'off';
  return s.conversing ? 'call' : 'guide';
};

const Avatar: React.FC<{ mode: Mode; reduced: boolean }> = ({ mode, reduced }) => {
  const wrap = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Drive the cyan glow + subtle scale from the live audio amplitude so the
  // avatar reacts to speech. Coarse `speaking` state comes from the store; the
  // per-frame `mouth` value gives the intensity.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let lvl = 0;
    const tick = () => {
      const { mouth, speaking } = audioTourStore.get();
      const target = speaking ? 0.35 + mouth * 0.65 : 0.12;
      lvl += (target - lvl) * 0.25;
      const el = wrap.current;
      if (el) {
        el.style.setProperty('--glow', lvl.toFixed(3));
        el.style.setProperty('--ring', (0.35 + lvl * 0.65).toFixed(3));
        el.style.opacity = (0.72 + lvl * 0.28).toFixed(3);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // Best-effort autoplay (muted autoplay is allowed without a gesture).
  useEffect(() => {
    if (reduced) return;
    const v = videoRef.current;
    if (v) void v.play().catch(() => {});
  }, [reduced]);

  // Compact on phones → larger on desktop; a touch bigger on a live call. Uses
  // the free left edge, above the audio controls, clear of the bottom CTAs.
  const size =
    mode === 'call'
      ? 'h-32 w-32 sm:h-44 sm:w-44 lg:h-52 lg:w-52'
      : 'h-24 w-24 sm:h-36 sm:w-36 lg:h-44 lg:w-44';

  return (
    <div
      ref={wrap}
      className={`pointer-events-none fixed bottom-20 left-2 z-40 overflow-hidden rounded-full border border-brand-cyan/30 bg-slate-950/60 transition-all duration-500 ease-out sm:bottom-24 sm:left-3 ${size}`}
      style={{
        // Cyan halo whose strength tracks the voice.
        boxShadow:
          '0 0 calc(14px + var(--glow, 0) * 34px) calc(1px + var(--glow, 0) * 6px) rgba(0, 229, 255, calc(0.25 + var(--ring, 0.35) * 0.5))',
      }}
      aria-hidden="true"
    >
      {reduced ? (
        <img src={POSTER_SRC} alt="" className="h-full w-full object-cover" />
      ) : (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
        />
      )}
    </div>
  );
};

const TalkingHead: React.FC = () => {
  const mode = useSyncExternalStore(subscribe, getMode, () => 'off' as Mode);
  const reduced = getPrefersReducedMotion();
  // Hidden entirely while the master switch is off — nothing renders or loads.
  if (!FACE_ENABLED || mode === 'off') return null;
  return <Avatar mode={mode} reduced={reduced} />;
};

export default TalkingHead;
