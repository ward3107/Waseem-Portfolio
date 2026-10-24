import { useCallback, useState } from 'react';
import { Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/types';
import {
  formatVideoDuration,
  VIDEO_PORTFOLIO,
  videoLibraryCopy,
  type PortfolioVideo,
  type VideoCategory,
} from './portfolio';
import PortfolioPlayer from './PortfolioPlayer';

const categories: VideoCategory[] = [
  'social',
  'food',
  'fashion',
  'automotive',
  'motion',
  'education',
  'presenter',
];
const availableCategories = categories.filter((category) =>
  VIDEO_PORTFOLIO.some((video) => video.category === category)
);

export default function VideoPortfolioGallery() {
  const { language } = useLanguage();
  const copy = videoLibraryCopy[language];
  const [category, setCategory] = useState<VideoCategory | 'all'>('all');
  const [videoLanguage, setVideoLanguage] = useState<Language | 'all'>('all');
  const [open, setOpen] = useState<PortfolioVideo | null>(() => {
    const id = new URLSearchParams(window.location.search).get('video');
    return VIDEO_PORTFOLIO.find((video) => video.id === id) ?? null;
  });
  const close = useCallback(() => setOpen(null), []);
  const visible = VIDEO_PORTFOLIO.filter(
    (video) =>
      (category === 'all' || video.category === category) &&
      (videoLanguage === 'all' || video.language === videoLanguage)
  );

  return (
    <section id="video-collection" className="va-collection" aria-labelledby="va-collection-title">
      <header className="va-collection-heading">
        <div>
          <h2 id="va-collection-title">{copy.heading}</h2>
          <p>{copy.intro}</p>
        </div>
        <span className="va-collection-count" role="status">
          {visible.length} {copy.videos}
        </span>
      </header>
      <div className="va-library-controls">
        <div className="va-filters" role="group" aria-label={copy.heading}>
          <button
            type="button"
            aria-pressed={category === 'all'}
            onClick={() => setCategory('all')}
          >
            {copy.all}
          </button>
          {availableCategories.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {copy.categories[item]}
            </button>
          ))}
        </div>
        <label className="va-language-filter">
          {copy.language}
          <select
            value={videoLanguage}
            onChange={(event) => setVideoLanguage(event.target.value as Language | 'all')}
          >
            <option value="all">{copy.allLanguages}</option>
            {(['he', 'ar', 'en'] as const).map((item) => (
              <option key={item} value={item}>
                {copy.languages[item]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ul className="va-video-grid">
        {visible.map((video) => (
          <li key={video.id} id={`film-${video.id}`}>
            <button
              type="button"
              className="va-video-card"
              onClick={() => setOpen(video)}
              aria-label={`${copy.watch}: ${video.title[language]}`}
            >
              <div className="va-video-cover">
                <img
                  src={video.poster}
                  alt=""
                  width={video.width}
                  height={video.height}
                  loading="lazy"
                  decoding="async"
                />
                <span className="va-card-play">
                  <Play size={22} fill="currentColor" aria-hidden="true" />
                </span>
                {video.duration !== undefined && (
                  <span className="va-card-duration" dir="ltr">
                    {formatVideoDuration(video.duration)}
                  </span>
                )}
              </div>
              <div className="va-card-caption">
                <h3>
                  <bdi>{video.title[language]}</bdi>
                </h3>
                <p>
                  {copy.categories[video.category]}
                  {video.language && <> · {copy.languages[video.language]}</>}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
      {!visible.length && (
        <div className="va-library-empty">
          <p>{copy.empty}</p>
          <button
            type="button"
            onClick={() => {
              setCategory('all');
              setVideoLanguage('all');
            }}
          >
            {copy.reset}
          </button>
        </div>
      )}
      <p className="va-library-note">{copy.note}</p>
      {open && <PortfolioPlayer key={open.id} video={open} onClose={close} />}
    </section>
  );
}
