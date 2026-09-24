import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { VIDEO_ADS, videoAdsCopy } from './content';
import './video-ads.css';

export default function VideoAdsPreview() {
  const { language } = useLanguage();
  const copy = videoAdsCopy[language];
  return (
    <section id="video-ads" aria-labelledby="video-ads-preview-title" className="video-ads-preview max-w-7xl mx-auto px-6 sm:px-10 py-16">
      <div className="va-preview-layout">
        <Link to="/video-ads" className="va-preview-reels" aria-label={copy.explore}>
          {VIDEO_ADS.map((project) => (
            <figure key={project.id}>
              <img src={project.thumbnail} alt={copy.projects[project.id].project} width={640} height={640} loading="lazy" decoding="async" />
              <figcaption><Play size={18} fill="currentColor" aria-hidden="true" /> 0:{project.duration}</figcaption>
            </figure>
          ))}
        </Link>
        <div>
          <p className="va-category">{copy.category}</p>
          <h2 id="video-ads-preview-title" className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{copy.previewTitle}</h2>
          <p className="va-description">{copy.previewText}</p>
          <Link className="va-button" to="/video-ads">{copy.explore}</Link>
        </div>
      </div>
    </section>
  );
}
