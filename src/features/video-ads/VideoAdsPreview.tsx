import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { VIDEO_AD, videoAdsCopy } from './content';
import './video-ads.css';

export default function VideoAdsPreview() {
  const { language } = useLanguage();
  const copy = videoAdsCopy[language];
  return (
    <section id="video-ads" aria-labelledby="video-ads-preview-title" className="video-ads-preview max-w-7xl mx-auto px-6 sm:px-10 py-16">
      <div className="va-preview-layout">
        <Link to="/video-ads" className="va-preview-image" aria-label={copy.watch}>
          <img src={VIDEO_AD.thumbnail} alt="GreenTouch" width={640} height={640} loading="lazy" decoding="async" />
          <span className="va-play-badge"><Play size={24} fill="currentColor" aria-hidden="true" /> 0:27</span>
        </Link>
        <div>
          <p className="va-category">{copy.category}</p>
          <h2 id="video-ads-preview-title" className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{copy.previewTitle}</h2>
          <p className="va-description">{copy.previewText}</p>
          <Link className="va-button" to="/video-ads">{copy.explore}</Link>
          <p className="va-note">{copy.concept}</p>
        </div>
      </div>
    </section>
  );
}
