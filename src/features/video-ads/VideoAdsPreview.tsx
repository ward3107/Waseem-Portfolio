import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { videoAdsCopy } from './content';
import VideoReels from './VideoReels';
import './video-ads.css';

export default function VideoAdsPreview() {
  const { language } = useLanguage();
  const copy = videoAdsCopy[language];
  return (
    <section id="video-ads" aria-labelledby="video-ads-preview-title" className="video-ads-preview max-w-7xl mx-auto px-5 sm:px-10 py-12 sm:py-16">
      <div className="va-preview-layout">
        <div>
          <p className="va-category">{copy.category}</p>
          <h2 id="video-ads-preview-title" className="font-heading text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white">{copy.previewTitle}</h2>
          <p className="va-description">{copy.previewText}</p>
        </div>
        <VideoReels />
        <Link className="va-button" to="/video-ads">{copy.explore}</Link>
      </div>
    </section>
  );
}
