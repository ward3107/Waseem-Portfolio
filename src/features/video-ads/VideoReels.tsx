import { useCallback, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  FEATURED_VIDEOS,
  formatVideoDuration,
  type PortfolioVideo,
  videoLibraryCopy,
} from './portfolio';
import PortfolioPlayer from './PortfolioPlayer';
import './video-ads.css';

/** Only posters load on the homepage; a video mounts after a deliberate click. */
export default function VideoReels({ className = '' }: { className?: string }) {
  const { language, dir } = useLanguage();
  const copy = videoLibraryCopy[language];
  const [open, setOpen] = useState<PortfolioVideo | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const strip = useRef<HTMLUListElement>(null);
  const stripId = useId();
  const move = (direction: number) => {
    const list = strip.current;
    if (!list) return;
    list.scrollBy({
      left: direction * (dir === 'rtl' ? -1 : 1) * list.clientWidth * 0.8,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <>
      <ul
        ref={strip}
        id={stripId}
        aria-label={copy.heading}
        className={`pointer-events-auto -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:gap-4 sm:px-0 [&::-webkit-scrollbar]:hidden ${className}`}
      >
        {FEATURED_VIDEOS.map((video) => (
          <li key={video.id} className="w-[38vw] max-w-[168px] shrink-0 snap-start sm:w-[168px]">
            <button
              type="button"
              onClick={() => setOpen(video)}
              aria-label={`${copy.watch}: ${video.title[language]}`}
              className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-900 text-start ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:ring-brand-cyan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
            >
              <img
                src={video.poster.replace(/\.webp$/, '-thumb.webp')}
                alt=""
                width={video.width}
                height={video.height}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"
                aria-hidden="true"
              />
              <span
                className="absolute left-1/2 top-[42%] grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg transition-transform group-hover:scale-110"
                aria-hidden="true"
              >
                <Play className="h-5 w-5 translate-x-px" fill="currentColor" />
              </span>
              <span className="absolute inset-x-0 bottom-0 p-2.5 text-white sm:p-3">
                <span className="line-clamp-2 text-xs font-bold leading-tight sm:text-sm">
                  <bdi>{video.title[language]}</bdi>
                </span>
                {video.duration !== undefined && (
                  <span className="mt-0.5 block text-[11px] font-medium text-white/70" dir="ltr">
                    {formatVideoDuration(video.duration)}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="pointer-events-auto mt-3 flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
          {FEATURED_VIDEOS.length} {copy.videos}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label={copy.previous}
            aria-controls={stripId}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-400/50 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan dark:text-white"
          >
            {dir === 'rtl' ? (
              <ArrowRight size={18} aria-hidden="true" />
            ) : (
              <ArrowLeft size={18} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label={copy.next}
            aria-controls={stripId}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-400/50 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan dark:text-white"
          >
            {dir === 'rtl' ? (
              <ArrowLeft size={18} aria-hidden="true" />
            ) : (
              <ArrowRight size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      {open && <PortfolioPlayer key={open.id} video={open} onClose={close} />}
    </>
  );
}
