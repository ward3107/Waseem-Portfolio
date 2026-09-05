import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Headphones, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { audioTourStore, type AudioTourSnapshot } from '../audioTourStore';

/**
 * The audio-tour control, docked in the site header instead of floating over
 * the page. AudioTour itself is headless (it owns the audio element and all the
 * narration logic) and publishes its state — plus an imperative controls
 * handle — through audioTourStore; this button reads that state and calls back
 * through the store, so the two stay decoupled.
 *
 * It renders only while the tour is actually mounted (`present`), so on pages
 * without the experience (e.g. the blog) it disappears entirely. When the tour
 * is closed it collapses to a single "Listen" button that restarts it; when
 * it's running, one tap opens a small popover with Play/Pause, Sound and Close.
 */

const IDLE: AudioTourSnapshot = {
  active: false,
  conversing: false,
  speaking: false,
  mouth: 0,
  present: false,
  playing: false,
  muted: true,
};

const subscribe = (cb: () => void) => audioTourStore.subscribe(cb);
const getSnapshot = () => audioTourStore.get();
const getServerSnapshot = () => IDLE;

// Minimal trilingual labels — the header is multilingual and these are the only
// strings this control needs.
type Lang = 'en' | 'he' | 'ar';
const L: Record<Lang, Record<string, string>> = {
  en: { listen: 'Listen to the tour', controls: 'Audio tour', play: 'Play', pause: 'Pause', sound: 'Sound on', mute: 'Mute', close: 'Close tour' },
  he: { listen: 'להאזנה לסיור', controls: 'סיור קולי', play: 'נגן', pause: 'השהה', sound: 'הפעל קול', mute: 'השתק', close: 'סגור סיור' },
  ar: { listen: 'استمع للجولة', controls: 'الجولة الصوتية', play: 'تشغيل', pause: 'إيقاف مؤقت', sound: 'تشغيل الصوت', mute: 'كتم', close: 'إغلاق الجولة' },
};

// Matches the other header icon buttons (theme toggle, share).
const navBtn =
  'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-purpleLight';

const AudioHeaderControl: React.FC = () => {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { language } = useLanguage();
  const t = L[(language as Lang)] ?? L.en;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close the popover on an outside tap or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // The tour isn't on this page — render nothing.
  if (!snap.present) return null;

  // Closed / dismissed → a single "Listen" affordance that restarts it.
  if (!snap.active) {
    return (
      <button type="button" onClick={() => audioTourStore.start()} aria-label={t.listen} title={t.listen} className={navBtn}>
        <Headphones size={20} aria-hidden="true" className="text-brand-cyan" />
      </button>
    );
  }

  const popItem =
    'flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800';

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t.controls}
        title={t.controls}
        className={`${navBtn} ${snap.playing && !snap.muted ? 'text-brand-cyan dark:text-brand-cyan' : ''}`}
      >
        {snap.muted ? (
          <VolumeX size={20} aria-hidden="true" />
        ) : (
          <Volume2 size={20} aria-hidden="true" className={snap.playing ? 'text-brand-cyan' : ''} />
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t.controls}
          className="absolute right-0 top-full z-50 mt-2 flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur rtl:left-0 rtl:right-auto dark:border-slate-700 dark:bg-slate-900/95"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => audioTourStore.togglePlay()}
            className={`${popItem} ${snap.playing ? 'text-brand-purple dark:text-brand-purpleLight' : ''}`}
          >
            {snap.playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            {snap.playing ? t.pause : t.play}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => audioTourStore.toggleMute()}
            aria-pressed={snap.muted}
            className={`${popItem} ${!snap.muted ? 'text-brand-cyan' : ''}`}
          >
            {snap.muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
            {snap.muted ? t.sound : t.mute}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              audioTourStore.close();
              setOpen(false);
            }}
            className={`${popItem} hover:text-red-500`}
          >
            <X size={18} aria-hidden="true" />
            {t.close}
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioHeaderControl;
