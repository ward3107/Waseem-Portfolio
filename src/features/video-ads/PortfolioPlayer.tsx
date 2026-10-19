import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Link as LinkIcon, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { type PortfolioVideo, videoLibraryCopy } from './portfolio';

export default function PortfolioPlayer({
  video,
  onClose,
}: {
  video: PortfolioVideo;
  onClose: () => void;
}) {
  const { language, dir } = useLanguage();
  const copy = videoLibraryCopy[language];
  const dialog = useRef<HTMLDialogElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const node = dialog.current;
    const media = player.current;
    node?.showModal();
    // Browser autoplay policies may still require a press on the native controls.
    void media?.play()?.catch(() => undefined);
    return () => {
      media?.pause();
      node?.close();
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);

  const share = async () => {
    const url = new URL('/video-ads', window.location.origin);
    url.searchParams.set('lang', language);
    url.searchParams.set('video', video.id);
    try {
      await navigator.clipboard.writeText(url.href);
      setShareStatus(copy.copied);
    } catch {
      window.history.replaceState(window.history.state, '', url.href);
      setShareStatus(copy.copyFailed);
    }
  };

  return createPortal(
    <dialog
      ref={dialog}
      dir={dir}
      className="va-dialog"
      aria-labelledby="va-dialog-title"
      data-lenis-prevent
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="va-dialog-content">
        <header className="va-dialog-header">
          <h2 id="va-dialog-title">
            <bdi>{video.title[language]}</bdi>
          </h2>
          <button type="button" onClick={onClose} aria-label={copy.close} autoFocus>
            <X size={22} aria-hidden="true" />
          </button>
        </header>
        <video
          ref={player}
          src={video.src}
          poster={video.poster}
          controls
          playsInline
          preload="metadata"
          width={video.width}
          height={video.height}
          aria-label={video.title[language]}
          onError={() => setFailed(true)}
        >
          {video.tracks?.map((track) => (
            <track key={track.srcLang} kind="subtitles" {...track} />
          ))}
          <a href={video.src}>{copy.direct}</a>
        </video>
        {failed && (
          <p role="alert" className="va-dialog-error">
            {copy.unavailable}
          </p>
        )}
        <footer className="va-dialog-footer">
          <a href={video.src} target="_blank" rel="noopener noreferrer">
            {copy.direct} ↗
          </a>
          <button type="button" onClick={share}>
            {shareStatus === copy.copied ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <LinkIcon size={16} aria-hidden="true" />
            )}
            {copy.share}
          </button>
          <span role="status">{shareStatus}</span>
        </footer>
      </div>
    </dialog>,
    document.body
  );
}
