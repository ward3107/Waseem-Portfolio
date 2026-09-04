import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Headphones, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { audioTourStore } from '../audioTourStore';

/**
 * The audio tour — a narrated walk-through of the experience, as automatic as a
 * browser allows. It starts playing on load MUTED (muted autoplay needs no
 * gesture), then unmutes on the visitor's very first interaction — a click, key,
 * or the first scroll-touch (on a phone, starting to scroll is enough), so it
 * opens to sound essentially on its own. Sound genuinely cannot play before any
 * interaction — that is a hard browser rule, not a setting. From then on a warm,
 * deep voice reads a short line for each chapter as it scrolls into view. Closing
 * the tour opts out for the session (then a "Listen" button is the way back in).
 * Clips are pre-generated static MP3s (see public/audio/<lang>/), so there's no
 * per-visit cost or latency and the page stays fast.
 *
 * Scope: the narration is recorded per language — English, Hebrew, and Arabic
 * each have their own clip folder (public/audio/<lang>/), all in the same deep
 * "Brian" voice for a consistent brand. A visitor hears their own language; any
 * language without a folder falls back to English. Adding one is a folder of
 * clips plus an entry in CLIPS_BY_LANG.
 *
 * Which chapter is "active" comes from an IntersectionObserver over the real
 * chapter <section> elements (by their DOM id), so it works the same whether the
 * visitor is scrolling the 3D experience or the classic fallback. Each section
 * narrates once per visit; the Play button replays the current one on demand.
 *
 * A glassy 3D "assistant" face (see TalkingHead) lip-syncs to whatever is
 * playing: this component taps the narration through a Web Audio AnalyserNode
 * and publishes the live mouth openness (plus the active/speaking flags) to
 * audioTourStore, which the head reads in its own render loop. That tap is
 * best-effort and fully isolated — if Web Audio is unavailable the narration is
 * unaffected and the head animates with a procedural talking motion instead.
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
  he: [
    { id: 'hero', src: '/audio/he/hero.mp3' },
    { id: 'what-i-do', src: '/audio/he/services.mp3' },
    { id: 'ai-automation', src: '/audio/he/ai.mp3' },
    { id: 'projects', src: '/audio/he/projects.mp3' },
    { id: 'reviews', src: '/audio/he/trust.mp3' },
    { id: 'contact', src: '/audio/he/contact.mp3' },
  ],
  ar: [
    { id: 'hero', src: '/audio/ar/hero.mp3' },
    { id: 'what-i-do', src: '/audio/ar/services.mp3' },
    { id: 'ai-automation', src: '/audio/ar/ai.mp3' },
    { id: 'projects', src: '/audio/ar/projects.mp3' },
    { id: 'reviews', src: '/audio/ar/trust.mp3' },
    { id: 'contact', src: '/audio/ar/contact.mp3' },
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
  // Each supported language narrates in its own voice folder; anything without
  // one falls back to the English clips.
  const clips = CLIPS_BY_LANG[language] ?? CLIPS_BY_LANG.en;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  // Starts muted: browsers allow *muted* autoplay on load, and we unmute on the
  // visitor's first gesture (see the unmute effect) — that first gesture is
  // usually the first scroll-touch, so on phones it opens to sound on its own.
  const [muted, setMuted] = useState(true);

  // Refs mirror state so the observer callback (bound once) reads live values.
  const enabledRef = useRef(false);
  const mutedRef = useRef(true);
  const unmutedRef = useRef(false); // has the first-gesture unmute already run?
  const activeRef = useRef<string>(clips?.[0]?.id ?? 'hero');
  const playedRef = useRef<Set<string>>(new Set());

  // Web Audio graph that feeds the 3D talking head its lip-sync. Built lazily on
  // the first real gesture (an AudioContext can't start before one). Everything
  // is wrapped in try/catch and connected straight through to the speakers, so
  // if any of it is unsupported the narration audio itself is never affected —
  // the head just falls back to a procedural talking motion (see the mouth loop).
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const analyserFailedRef = useRef(false);
  const mouthRef = useRef(0); // smoothed openness the loop eases
  const rafRef = useRef(0);

  // Route the <audio> element through an AnalyserNode → speakers. Idempotent and
  // gesture-safe: a MediaElementSource can only be made once per element, and
  // the context must be resumed inside a user gesture.
  const ensureAnalyser = useCallback(() => {
    if (analyserFailedRef.current || analyserRef.current) {
      void ctxRef.current?.resume().catch(() => {});
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) throw new Error('no AudioContext');
      const ctx = new Ctor();
      const source = ctx.createMediaElementSource(a);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      // source → analyser → speakers. The analyser is a pass-through tap, so
      // connecting it to the destination keeps the audio audible.
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      freqRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      void ctx.resume().catch(() => {});
    } catch {
      // Unsupported / already-tapped element: keep the narration working and let
      // the head animate procedurally instead of from real amplitude.
      analyserFailedRef.current = true;
    }
  }, []);

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
      // Tear down the Web Audio graph so a remount can build a fresh one.
      void ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
      analyserRef.current = null;
      freqRef.current = null;
      analyserFailedRef.current = false;
      audioTourStore.reset();
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

  // Drive the 3D talking head's mouth from the live narration. Runs only while
  // the tour is on: each frame it eases the mouth toward the current speech
  // amplitude (or a procedural talking envelope when Web Audio is unavailable)
  // and publishes it to audioTourStore for the head to read inside its own
  // render loop. Purely cosmetic — it never touches playback.
  useEffect(() => {
    if (!enabled) return;
    let running = true;

    const amplitude = (): number => {
      const analyser = analyserRef.current;
      const buf = freqRef.current;
      if (!analyser || !buf) return -1; // no analyser → caller goes procedural
      analyser.getByteFrequencyData(buf);
      // Speech energy concentrates in the low-mid bands; average the lower half.
      const n = Math.max(1, Math.floor(buf.length * 0.5));
      let sum = 0;
      for (let i = 0; i < n; i++) sum += buf[i];
      return sum / n / 255; // 0..1
    };

    const tick = () => {
      if (!running) return;
      const a = audioRef.current;
      const audible = !!a && !a.paused && !a.muted && !a.ended;
      let target = 0;
      if (audible) {
        const amp = amplitude();
        if (amp >= 0) {
          target = Math.min(1, amp * 1.8); // lift quiet speech into a clear range
        } else {
          // Procedural fallback: a lively mouth cadence around speech rhythm.
          const t = performance.now() / 1000;
          target = Math.min(1, 0.25 + 0.35 * (Math.sin(t * 11) * 0.5 + 0.5) + 0.2 * Math.random());
        }
      }
      // Open quickly, close a little slower — reads as speech, not a strobe.
      const k = target > mouthRef.current ? 0.5 : 0.25;
      mouthRef.current += (target - mouthRef.current) * k;
      if (mouthRef.current < 0.001) mouthRef.current = 0;
      audioTourStore.set({ speaking: audible, mouth: mouthRef.current });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      mouthRef.current = 0;
      audioTourStore.set({ speaking: false, mouth: 0 });
    };
  }, [enabled]);

  const enable = (startMuted: boolean) => {
    setEnabled(true);
    enabledRef.current = true;
    audioTourStore.set({ active: true });
    if (!startMuted) {
      unmutedRef.current = true;
      mutedRef.current = false;
      setMuted(false);
      ensureAnalyser(); // real gesture → safe to start the Web Audio graph
    }
    playSection(activeRef.current, true);
  };

  // Turn sound on. Only works inside a real user gesture (browsers gate audio),
  // so this is called from the first-gesture listeners and the Sound button.
  const unmute = () => {
    if (unmutedRef.current) return;
    unmutedRef.current = true;
    mutedRef.current = false;
    setMuted(false);
    ensureAnalyser(); // real gesture → safe to start the Web Audio graph
    const a = audioRef.current;
    if (a) {
      a.muted = false;
      // Replay the current section from the top so it's heard cleanly, not
      // caught halfway through whatever was playing silently.
      playSection(activeRef.current, true);
    }
  };
  const disable = () => {
    setEnabled(false);
    enabledRef.current = false;
    audioRef.current?.pause();
    audioTourStore.set({ active: false, speaking: false, mouth: 0 });
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
      if (!next) {
        unmutedRef.current = true; // manual unmute counts as the unmute
        ensureAnalyser(); // button click is a gesture → start the graph
      }
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  };

  // Auto-start the moment the page is ready — MUTED, which browsers permit
  // without a gesture. The tour is "playing" from the first paint; it just has
  // no sound yet. Skipped if the visitor closed it earlier this session.
  useEffect(() => {
    if (!clips || wasDismissed()) return;
    // Defer a tick so the section elements exist for the observer to track.
    const t = window.setTimeout(() => {
      if (!enabledRef.current) enable(true);
    }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips]);

  // The visitor's VERY FIRST scroll gesture is spent turning the sound on and
  // (re)starting the narration from the hero — the page does NOT move for it.
  // Only the next gesture scrolls. That way the first swipe never carries them
  // past the intro before they've heard it. Taps and keys just activate (they
  // don't scroll anyway). A gesture that beats the muted auto-start starts it
  // unmuted directly. Skipped entirely if the tour was closed this session.
  //
  // Touch is safe to intercept here: this site runs Lenis with smoothWheel only
  // (no smooth touch), so mobile scrolling is native — preventing the first
  // touchmove cleanly holds the page still without fighting Lenis.
  useEffect(() => {
    if (!clips || wasDismissed()) return;
    let released = false; // has the one-time scroll hold been lifted?

    const activate = () => {
      if (!enabledRef.current) enable(false); // muted auto-start hadn't run yet
      else unmute(); // both restart the current (hero) section from the top
    };
    const release = () => {
      if (released) return;
      released = true;
      window.clearTimeout(wheelTimer);
      window.removeEventListener('touchstart', onTouchStart, cap);
      window.removeEventListener('touchmove', onTouchMove, blockOpts);
      window.removeEventListener('touchend', onTouchEnd, cap);
      window.removeEventListener('wheel', onWheel, blockOpts);
      window.removeEventListener('keydown', onKeyDown, cap);
      window.removeEventListener('pointerdown', onMouseDown, cap);
    };

    const onTouchStart = () => {
      if (!released) activate();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (released) return;
      e.preventDefault(); // hold the page still for the whole first swipe
      activate();
    };
    const onTouchEnd = () => {
      if (released) return;
      activate();
      release(); // first swipe/tap over → the next gesture scrolls normally
    };
    let wheelTimer = 0;
    const onWheel = (e: WheelEvent) => {
      if (released) return;
      e.preventDefault(); // hold still for the first wheel burst (desktop)
      activate();
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(release, 300);
    };
    const onKeyDown = () => {
      if (!released) {
        activate();
        release();
      }
    };
    const onMouseDown = (e: PointerEvent) => {
      if (!released && e.pointerType === 'mouse') {
        activate();
        release();
      }
    };

    const cap = { capture: true } as const;
    const blockOpts = { capture: true, passive: false } as const;
    window.addEventListener('touchstart', onTouchStart, cap);
    window.addEventListener('touchmove', onTouchMove, blockOpts);
    window.addEventListener('touchend', onTouchEnd, cap);
    window.addEventListener('wheel', onWheel, blockOpts);
    window.addEventListener('keydown', onKeyDown, cap);
    window.addEventListener('pointerdown', onMouseDown, cap);
    return release;
    // enable/unmute only touch refs + setters, so binding once on mount is safe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips]);

  // No narration for this language (or SSR): render nothing.
  if (!clips) return null;

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={() => {
          try {
            sessionStorage.removeItem(DISMISS_KEY);
          } catch {
            /* storage blocked — fine */
          }
          enable(false);
        }}
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
        className={`ml-1.5 mr-1 inline-flex items-center gap-2 text-xs font-semibold ${
          muted ? 'text-brand-cyan' : playing ? 'text-brand-gold' : 'text-slate-300'
        }`}
      >
        <span className="relative flex h-2 w-2">
          {(muted || playing) && (
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full ${muted ? 'bg-brand-cyan/70' : 'bg-brand-gold/70'}`}
            />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${muted ? 'bg-brand-cyan' : playing ? 'bg-brand-gold' : 'bg-slate-500'}`}
          />
        </span>
        {muted ? 'Tap for sound' : playing ? 'Speaking…' : 'Audio tour'}
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
