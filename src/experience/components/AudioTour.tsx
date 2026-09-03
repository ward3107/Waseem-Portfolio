import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Headphones, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * The audio tour — a narrated walk-through of the experience. It auto-starts on
 * the visitor's first interaction (a click/tap anywhere — the earliest moment a
 * browser allows sound), and from then on a warm, deep voice reads a short line
 * for each chapter as it scrolls into view. A "Listen" button is the manual
 * fallback, and closing the tour opts out for the rest of the session. Clips are
 * pre-generated static MP3s (see public/audio/<lang>/), so there's no per-visit
 * cost or latency and the page stays fast.
 *
 * Scope: the narration is currently recorded in English and plays for EVERY
 * visitor, whatever the site language — Hebrew/Arabic hear the English voice
 * too. When a language gets its own clip folder (public/audio/<lang>/) plus an
 * entry in CLIPS_BY_LANG, it is picked up here automatically.
 *
 * Which chapter is "active" comes from an IntersectionObserver over the real
 * chapter <section> elements (by their DOM id), so it works the same whether the
 * visitor is scrolling the 3D experience or the classic fallback. Each section
 * narrates once per visit; the Play button replays the current one on demand.
 */
type Clip = { id: string; src: string };

// DOM section ids (from the storyboard anchors) → their narration file.
const CLIPS_BY_LANG: Record<string, Clip[]> = {
  en: [
    { id: 'hero', src: '/audio/en/hero.mp3' },
    { id: 'what-i-do', src: '/audio/en/services.mp3' },
    { id: 'ai-automation', src: '/audio/en/ai.mp3' },
    { id: 'projects', src: '/audio/en/projects.mp3' },
    { id: 'reviews', src: '/audio/en/trust.mp3' },
    { id: 'contact', src: '/audio/en/contact.mp3' },
  ],
};

// The clips are recorded slowly; playing a little under 1× (with pitch
// preserved, so the deep tone stays) makes the delivery slower still without
// regenerating anything.
const PLAYBACK_RATE = 0.82;

// Remembers, for this browser tab, that the visitor closed the tour — so it
// doesn't auto-start again on their next click.
const DISMISS_KEY = 'audioTourDismissed';
const wasDismissed = (): boolean => {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

const AudioTour: React.FC = () => {
  const { language } = useLanguage();
  // English narration plays for everyone; a localized folder wins when present.
  const clips = CLIPS_BY_LANG[language] ?? CLIPS_BY_LANG.en;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  // Refs mirror state so the observer callback (bound once) reads live values.
  const enabledRef = useRef(false);
  const mutedRef = useRef(false);
  const activeRef = useRef<string>(clips?.[0]?.id ?? 'hero');
  const playedRef = useRef<Set<string>>(new Set());

  // One reusable <audio> element. `preload="none"` so nothing downloads until
  // the visitor opts in.
  useEffect(() => {
    if (!clips) return;
    const a = new Audio();
    a.preload = 'none';
    // Slow, deliberate delivery — keep the deep pitch (no chipmunk effect) while
    // playing a touch slower than recorded.
    a.defaultPlaybackRate = PLAYBACK_RATE;
    a.playbackRate = PLAYBACK_RATE;
    (a as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
    audioRef.current = a;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('ended', onEnded);
    return () => {
      a.pause();
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('ended', onEnded);
      audioRef.current = null;
    };
  }, [clips]);

  // Play a section's clip. Auto-triggered plays happen once per section; a
  // forced play (the Listen/Play buttons) always replays the current one.
  const playSection = useCallback(
    (id: string, force = false) => {
      const a = audioRef.current;
      const clip = clips?.find((c) => c.id === id);
      if (!a || !clip) return;
      if (!force && playedRef.current.has(id)) return;
      playedRef.current.add(id);
      if (a.src.indexOf(clip.src) === -1) a.src = clip.src;
      else a.currentTime = 0;
      a.muted = mutedRef.current;
      // A rejected play (no gesture yet, or interrupted) is fine to swallow —
      // the control still reflects the real state via the audio events.
      void a.play().catch(() => {});
    },
    [clips]
  );

  // Track the most-visible chapter and narrate it when the tour is on.
  useEffect(() => {
    if (!clips) return;
    const els = clips
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;

    const ratios = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        }
        let best = '';
        let bestRatio = 0;
        for (const [id, r] of ratios) {
          if (r > bestRatio) {
            bestRatio = r;
            best = id;
          }
        }
        if (best && best !== activeRef.current) {
          activeRef.current = best;
          if (enabledRef.current) playSection(best);
        }
      },
      { threshold: [0.2, 0.4, 0.6, 0.8] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [clips, playSection]);

  const enable = () => {
    setEnabled(true);
    enabledRef.current = true;
    playSection(activeRef.current, true);
  };
  const disable = () => {
    setEnabled(false);
    enabledRef.current = false;
    audioRef.current?.pause();
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* private mode / storage blocked — fine, just won't remember */
    }
  };
  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      if (a.src) void a.play().catch(() => {});
      else playSection(activeRef.current, true);
    } else {
      a.pause();
    }
  };
  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      mutedRef.current = next;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  };

  // Auto-start on the visitor's first interaction. Browsers won't let audio
  // play before a gesture, so the earliest honest moment is the first click /
  // tap / key anywhere on the page — unless they've closed the tour this session.
  useEffect(() => {
    if (!clips || wasDismissed()) return;
    const start = () => {
      if (!enabledRef.current) enable();
    };
    window.addEventListener('pointerdown', start, { once: true, passive: true });
    window.addEventListener('keydown', start, { once: true });
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
    // enable is stable in practice (only touches refs/setters); re-running on
    // every render would re-arm the one-shot listeners needlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips]);

  // No narration for this language (or SSR): render nothing.
  if (!clips) return null;

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={enable}
        aria-label="Listen — play the narrated audio tour"
        className="pointer-events-auto fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/40 backdrop-blur transition hover:border-brand-cyan/50 hover:bg-slate-900/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
      >
        <Headphones className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
        Listen
      </button>
    );
  }

  return (
    <div
      className="pointer-events-auto fixed bottom-5 left-5 z-50 flex items-center gap-1 rounded-full border border-white/15 bg-slate-900/80 p-1.5 shadow-lg shadow-black/40 backdrop-blur"
      role="group"
      aria-label="Audio tour controls"
    >
      <span
        className={`ml-1.5 mr-1 inline-flex items-center gap-2 text-xs font-semibold ${playing ? 'text-brand-gold' : 'text-slate-300'}`}
      >
        <span className="relative flex h-2 w-2">
          {playing && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-gold/70" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${playing ? 'bg-brand-gold' : 'bg-slate-500'}`}
          />
        </span>
        {playing ? 'Speaking…' : 'Audio tour'}
      </span>

      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? 'Pause narration' : 'Play narration'}
        className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
      >
        {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
      </button>
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute narration' : 'Mute narration'}
        aria-pressed={muted}
        className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
      >
        {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
      </button>
      <button
        type="button"
        onClick={disable}
        aria-label="Close the audio tour"
        className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default AudioTour;
