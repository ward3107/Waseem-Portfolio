import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Play, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/types';
import { VIDEO_ADS, type VideoAd, videoAdsCopy } from './content';

const UI: Record<Language, { watch: string; close: string }> = {
  en: { watch: 'Tap to watch', close: 'Close video' },
  he: { watch: 'לחצו לצפייה', close: 'סגירת הסרטון' },
  ar: { watch: 'اضغط للمشاهدة', close: 'إغلاق الفيديو' },
};

/** Full-screen player. Portaled to <body> so a transformed ancestor (the
 *  experience's framer-motion overlays) can't trap `position: fixed`, and
 *  marked data-lenis-prevent so wheel/touch over it never scrolls the page. */
function ReelLightbox({ video, onClose }: { video: VideoAd; onClose: () => void }) {
  const { language, dir } = useLanguage();
  const copy = videoAdsCopy[language].projects[video.id];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.watch}
      dir={dir}
      data-lenis-prevent
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={UI[language].close}
        className="absolute end-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>
      <video
        src={video.src}
        poster={video.poster}
        controls
        autoPlay
        playsInline
        preload="auto"
        aria-label={copy.watch}
        onClick={(e) => e.stopPropagation()}
        className="aspect-[9/16] max-h-[82svh] w-auto max-w-full rounded-2xl bg-black shadow-2xl"
      >
        {video.tracks?.map((track) => (
          <track key={track.srcLang} kind="subtitles" src={track.src} srcLang={track.srcLang} label={track.label} />
        ))}
      </video>
    </div>,
    document.body
  );
}

/**
 * The social-video reels as a compact strip: small cards that open a
 * full-screen player on tap. On phones it's a single swipeable row (about two
 * and a half cards in view, so the row visibly continues); from `sm` up all
 * four sit in a grid. Only the lightweight square thumbnails load with the
 * page — a video file is fetched only once someone opens it.
 */
const VideoReels: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language } = useLanguage();
  const copy = videoAdsCopy[language];
  const [open, setOpen] = useState<VideoAd | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <ul
        className={`pointer-events-auto -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden ${className}`}
      >
        {VIDEO_ADS.map((video) => {
          const project = copy.projects[video.id];
          return (
            <li key={video.id} className="w-[38vw] max-w-[168px] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <button
                type="button"
                onClick={() => setOpen(video)}
                aria-label={project.watch}
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-900 text-start ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:ring-brand-cyan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
              >
                <img
                  src={video.thumbnail}
                  alt=""
                  width={640}
                  height={640}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" aria-hidden="true" />
                <span
                  className="absolute left-1/2 top-[42%] grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg transition-transform group-hover:scale-110"
                  aria-hidden="true"
                >
                  <Play className="h-5 w-5 translate-x-px" fill="currentColor" />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-2.5 text-white sm:p-3">
                  <span className="line-clamp-2 text-xs font-bold leading-tight sm:text-sm">
                    <bdi>{project.project}</bdi>
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium text-white/70" dir="ltr">
                    0:{String(video.duration).padStart(2, '0')}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs font-medium text-slate-400 sm:hidden">{UI[language].watch}</p>
      {open && <ReelLightbox video={open} onClose={close} />}
    </>
  );
};

export default VideoReels;
