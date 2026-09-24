import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContact } from '@/features/contact/useContact';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { VIDEO_AD, videoAdsCopy } from '@/features/video-ads/content';
import '@/features/video-ads/video-ads.css';

export default function VideoAdsPage() {
  const { language } = useLanguage();
  const copy = videoAdsCopy[language];
  const contact = useContact();
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const whatsapp = `${contact.whatsappUrl}?text=${encodeURIComponent(copy.prefill)}`;
  useDocumentTitle(copy.title);

  useEffect(() => {
    const url = 'https://waseemp.vercel.app/video-ads';
    const updates: [string, string, string][] = [
      ['meta[name="description"]', 'content', copy.intro],
      ['link[rel="canonical"]', 'href', url],
      ['meta[property="og:url"]', 'content', url],
      ['meta[property="og:title"]', 'content', copy.title],
      ['meta[property="og:description"]', 'content', copy.intro],
    ];
    const restore = updates.map(([selector, attr, value]) => {
      const node = document.querySelector(selector);
      const old = node?.getAttribute(attr);
      node?.setAttribute(attr, value);
      return () => {
        if (old !== null && old !== undefined) node?.setAttribute(attr, old);
      };
    });
    return () => restore.forEach((reset) => reset());
  }, [copy.intro, copy.title]);

  const play = async () => {
    setFailed(false);
    try {
      await video.current?.play();
    } catch {
      setFailed(true);
    }
  };

  return (
    <div className="video-ads-page">
      <div className="va-wrap">
        <Link to="/" className="va-back">{copy.back}</Link>
        <div className="va-hero">
          <div className="va-intro">
            <p className="va-category">{copy.category}</p>
            <h1>{copy.heading}</h1>
            <p className="va-description">{copy.intro}</p>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="va-button">
              <MessageCircle size={19} aria-hidden="true" />{copy.cta}
            </a>
            <div className="va-project-note">
              <span className="va-concept">{copy.concept}</span>
              <h2><bdi>{copy.project}</bdi></h2>
              <p>{copy.summary}</p>
              <p className="va-note">{copy.formatText}</p>
            </div>
          </div>
          <figure className="va-screen">
            <div className="va-player">
              <video ref={video} controls playsInline preload="none" poster={VIDEO_AD.poster}
                src={VIDEO_AD.src} aria-label={copy.watch} aria-describedby="video-sound-hint"
                width={1080} height={1920} onPlay={() => setStarted(true)} onError={() => setFailed(true)}>
                <track kind="subtitles" src="/assets/video-ads/greentouch-en.vtt" srcLang="en" label="English" />
                <track kind="subtitles" src="/assets/video-ads/greentouch-ar.vtt" srcLang="ar" label="العربية" />
                <a href={VIDEO_AD.src}>{copy.direct}</a>
              </video>
              {!started && !failed && <button type="button" onClick={play} className="va-play" aria-label={copy.watch}>
                <Play size={32} fill="currentColor" aria-hidden="true" />
              </button>}
            </div>
            <figcaption id="video-sound-hint">{copy.sound}</figcaption>
            {failed && <p role="alert" className="va-error">{copy.unavailable}</p>}
            <a className="va-direct" href={VIDEO_AD.src} target="_blank" rel="noopener noreferrer">{copy.direct}</a>
          </figure>
        </div>

        <section className="va-story" aria-labelledby="va-story-title">
          <div><h2 id="va-story-title">{copy.brief}</h2><p>{copy.detail}</p></div>
          <div><h2>{copy.craft}</h2><p>{copy.craftText}</p></div>
          <div><h2>{copy.format}</h2><p>{copy.formatText}</p><p>{copy.platforms}</p></div>
        </section>
        <p className="va-disclosure">{copy.disclosure}</p>
        <details className="va-transcript">
          <summary>{copy.transcript}</summary>
          <ol>{copy.lines.map((line) => <li key={line}>{line}</li>)}</ol>
        </details>
        <section className="va-enquiry" aria-labelledby="va-enquiry-title">
          <div><h2 id="va-enquiry-title">{copy.ask}</h2><p>{copy.askText}</p></div>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="va-button">
            <MessageCircle size={19} aria-hidden="true" />{copy.cta}
          </a>
        </section>
      </div>
    </div>
  );
}
