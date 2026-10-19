import { useCallback, useState } from 'react';
import { Play } from 'lucide-react';
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
  const { language } = useLanguage();
  const copy = videoLibraryCopy[language];
  const [open, setOpen] = useState<PortfolioVideo | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <ul
        className={`pointer-events-auto -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden ${className}`}
      >
        {FEATURED_VIDEOS.map((video) => (
          <li
            key={video.id}
            className="w-[38vw] max-w-[168px] shrink-0 snap-start sm:w-auto sm:max-w-none"
          >
            <button
              type="button"
              onClick={() => setOpen(video)}
              aria-label={`${copy.watch}: ${video.title[language]}`}
              className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-900 text-start ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:ring-brand-cyan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
            >
              <img
                src={video.poster}
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
      {open && <PortfolioPlayer key={open.id} video={open} onClose={close} />}
    </>
  );
}
