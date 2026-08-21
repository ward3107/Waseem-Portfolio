import React, { useEffect, useRef, useState } from 'react';
import { scrollStore } from '../scrollStore';
import { CHAPTERS } from '../storyboard';

const FILM_MP4 = '/assets/forge-hero.mp4';
const FILM_WEBM = '/assets/forge-hero.webm';
const POSTER_SRC = '/assets/forge-hero-poster.webp';

/** Pick the film source the browser can actually decode. Real Chrome, Safari,
 *  and Edge all decode H.264; open-source Chromium builds ship without it, so
 *  they get the VP9 WebM twin instead. */
function pickFilmSrc(): string {
  const probe = document.createElement('video');
  return probe.canPlayType('video/mp4; codecs="avc1.64002A"') ? FILM_MP4 : FILM_WEBM;
}

// The hero chapter runs from the first chapter section being flush to the
// second one being flush — i.e. the first 1/(N-1) of `journey`. The film
// finishes early inside that window so its resting frame can hand the letter
// over to the live 3D monogram, which in turn dissolves into the particle
// field. Three states of the same W, one continuous beat.
const HERO_SPAN = 1 / (CHAPTERS.length - 1);
const SCRUB_END = HERO_SPAN * 0.6; // film reaches its last frame here
const FADE_START = HERO_SPAN * 0.5; // crossfade to the 3D W begins
const FADE_END = HERO_SPAN * 0.72; // film fully gone

/**
 * The 10k-style scroll-scrubbed hero film ("The Forge"): scrolling down plays
 * the film forward, scrolling up rewinds it. Desktop (high tier) only — phones
 * keep the interactive 3D monogram, which suits a portrait screen better.
 *
 * Engineering per the 10k scrub standard, adapted to this React app:
 *   - The video is fetched as a Blob first, so scrubbing seeks a fully local
 *     file instead of hitting the network per seek. Until the blob is ready
 *     (or if it never loads), the poster image carries the hero, so the page
 *     is complete and beautiful without the film.
 *   - A rAF loop lerps a displayed time toward the scroll-target time and
 *     writes video.currentTime only when the delta is a frame or more AND the
 *     previous seek has finished (seek gating) — overlapping seeks are what
 *     make naive scrub heroes stutter.
 *   - The loop rests when the target is reached and the film is off-screen.
 *   - The film crossfades out exactly as the live 3D W takes over (its
 *     entrance is timed to this window in HeroChapter), so the letter passes
 *     from footage to interactive object in one continuous beat.
 */
const HeroFilm: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Blob fetch, once.
  useEffect(() => {
    let revoke: string | null = null;
    const ctrl = new AbortController();
    fetch(pickFilmSrc(), { signal: ctrl.signal })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => {
        revoke = URL.createObjectURL(b);
        setBlobUrl(revoke);
      })
      .catch(() => {
        /* poster carries the hero; nothing else to do */
      });
    return () => {
      ctrl.abort();
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, []);

  // Scrub loop with seek gating.
  useEffect(() => {
    const video = videoRef.current;
    const wrap = wrapRef.current;
    if (!video || !wrap || !blobUrl) return;

    let raf = 0;
    let displayed = 0;
    let seeking = false;
    let lastOpacity = -1;

    const onSeeked = () => {
      seeking = false;
    };
    video.addEventListener('seeked', onSeeked);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dur = video.duration;
      if (!Number.isFinite(dur) || dur <= 0) return;

      const { journey } = scrollStore.get();

      // Crossfade window (film → 3D W), written to the DOM only on change.
      const fade =
        journey <= FADE_START
          ? 1
          : journey >= FADE_END
            ? 0
            : 1 - (journey - FADE_START) / (FADE_END - FADE_START);
      const opacity = Math.round(fade * 100) / 100;
      if (opacity !== lastOpacity) {
        lastOpacity = opacity;
        wrap.style.opacity = String(opacity);
        wrap.style.visibility = opacity === 0 ? 'hidden' : 'visible';
      }
      if (opacity === 0) return; // off-screen: rest (no seeks)

      // Map scroll to film time and ease toward it.
      const t = Math.min(1, Math.max(0, journey / SCRUB_END)) * (dur - 0.05);
      displayed += (t - displayed) * 0.22;
      if (!seeking && Math.abs(video.currentTime - displayed) > 1 / 60) {
        seeking = true;
        video.currentTime = displayed;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener('seeked', onSeeked);
    };
  }, [blobUrl]);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      {/* Poster carries the hero until the film is scrub-ready (and forever if
          the fetch fails) — the page never depends on the video loading. */}
      <img
        src={POSTER_SRC}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {blobUrl && (
        <video
          ref={videoRef}
          src={blobUrl}
          muted
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

export default HeroFilm;
