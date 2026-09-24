import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContact } from '@/features/contact/useContact';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { VIDEO_ADS, type VideoAd, videoAdsCopy } from '@/features/video-ads/content';
import '@/features/video-ads/video-ads.css';

type Copy = (typeof videoAdsCopy)[keyof typeof videoAdsCopy];

function VideoCaseStudy({ project, copy }: { project: VideoAd; copy: Copy }) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const projectCopy = copy.projects[project.id];

  const play = async () => {
    setFailed(false);
    try {
      await video.current?.play();
    } catch {
      setFailed(true);
    }
  };

  return (
    <article id={project.id} className={`va-case va-case-${project.id}`}>
      <div className="va-case-copy">
        <header className="va-case-heading">
          <h2><bdi>{projectCopy.project}</bdi></h2>
          <p>{projectCopy.tagline}</p>
        </header>
        <dl className="va-facts">
          <div><dt>{copy.audienceLabel}</dt><dd>{projectCopy.audience}</dd></div>
          <div><dt>{copy.purposeLabel}</dt><dd>{projectCopy.purpose}</dd></div>
          <div><dt>{copy.sourceLabel}</dt><dd>{projectCopy.source}</dd></div>
          <div><dt>{copy.editLabel}</dt><dd>{projectCopy.edit}</dd></div>
          <div><dt>{copy.deliveryLabel}</dt><dd>{projectCopy.format}<br />{projectCopy.platforms}</dd></div>
          <div><dt>{copy.musicLabel}</dt><dd>{projectCopy.music}</dd></div>
        </dl>
        <p className="va-disclosure">{projectCopy.disclosure}</p>
        <details className="va-transcript">
          <summary>{copy.transcript}</summary>
          <ol>{projectCopy.lines.map((line) => <li key={line}>{line}</li>)}</ol>
        </details>
      </div>
      <figure className="va-screen">
        <div className="va-player">
          <video ref={video} controls playsInline preload="metadata" poster={project.poster}
            src={project.src} aria-label={projectCopy.watch} width={1080} height={1920}
            onPlay={() => setStarted(true)} onError={() => setFailed(true)}>
            {project.tracks?.map((track) => (
              <track key={track.srcLang} kind="subtitles" src={track.src} srcLang={track.srcLang} label={track.label} />
            ))}
            <a href={project.src}>{copy.direct}</a>
          </video>
          {!started && !failed && (
            <button type="button" onClick={play} className="va-play" aria-label={projectCopy.watch}>
              <Play size={32} fill="currentColor" aria-hidden="true" />
            </button>
          )}
        </div>
        <figcaption>{copy.sound}</figcaption>
        {failed && <p role="alert" className="va-error">{copy.unavailable}</p>}
        <a className="va-direct" href={project.src} target="_blank" rel="noopener noreferrer">{copy.direct}</a>
      </figure>
    </article>
  );
}

export default function VideoAdsPage() {
  const { language } = useLanguage();
  const copy = videoAdsCopy[language];
  const contact = useContact();
  const whatsapp = `${contact.whatsappUrl}?text=${encodeURIComponent(copy.prefill)}`;
  useDocumentTitle(copy.title);

  useEffect(() => {
    const url = 'https://www.vasia.dev/video-ads';
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

  return (
    <div className="video-ads-page">
      <div className="va-wrap">
        <Link to="/" className="va-back">{copy.back}</Link>
        <header className="va-gallery-intro">
          <p className="va-category">{copy.category}</p>
          <h1>{copy.heading}</h1>
          <p className="va-description">{copy.intro}</p>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="va-button">
            <MessageCircle size={19} aria-hidden="true" />{copy.cta}
          </a>
        </header>

        <nav className="va-project-jump" aria-label={copy.category}>
          {VIDEO_ADS.map((project) => (
            <a key={project.id} href={`#${project.id}`}>
              <img src={project.thumbnail} alt="" width={168} height={168} />
              <span><bdi>{copy.projects[project.id].project}</bdi><small>{project.duration}s</small></span>
            </a>
          ))}
        </nav>

        <section className="va-cases" aria-label={copy.category}>
          {VIDEO_ADS.map((project) => <VideoCaseStudy key={project.id} project={project} copy={copy} />)}
        </section>

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
