import { useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/types';
import { audioTourStore, type AudioTourSnapshot } from '../audioTourStore';

const IDLE: AudioTourSnapshot = {
  active: false,
  conversing: false,
  speaking: false,
  mouth: 0,
  present: false,
  playing: false,
  muted: true,
};
const subscribe = (callback: () => void) => audioTourStore.subscribe(callback);
const getSnapshot = () => audioTourStore.get();
const getServerSnapshot = () => IDLE;
const labels: Record<Language, { play: string; mute: string }> = {
  he: { play: 'הפעל קריינות', mute: 'השתק קריינות' },
  en: { play: 'Play narration', mute: 'Mute narration' },
  ar: { play: 'تشغيل التعليق الصوتي', mute: 'كتم التعليق الصوتي' },
};

/** One direct action: enable/replay the current chapter, or mute its voice. */
export default function AudioHeaderControl() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { language } = useLanguage();
  if (!snapshot.present) return null;
  const audible = snapshot.active && snapshot.playing && !snapshot.muted;
  const label = audible ? labels[language].mute : labels[language].play;
  return (
    <button
      type="button"
      data-audio-tour-control
      onClick={() => (audible ? audioTourStore.toggleMute() : audioTourStore.start())}
      aria-label={label}
      aria-pressed={audible}
      title={label}
      className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple dark:hover:bg-slate-800 ${audible ? 'text-brand-purple dark:text-brand-cyan' : 'text-slate-600 dark:text-slate-300'}`}
    >
      {audible ? (
        <Volume2 size={20} aria-hidden="true" />
      ) : (
        <VolumeX size={20} aria-hidden="true" />
      )}
    </button>
  );
}
