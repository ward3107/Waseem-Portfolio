import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProjects } from '@/features/projects/useProjects';
import { VIDEO_PORTFOLIO } from '@/features/video-ads/portfolio';
import { safeHref } from '@/lib/safe';
import { getWork, mediaUrls } from './repository';
import { labels, projectKey, projectUrl, workUrl, type Work } from './model';
import WorkShelf from './WorkShelf';
import { isStream, streamPlayback } from './stream';

function Share() {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);
  return (
    <div>
      <button
        className="work-action"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(location.href);
            setCopied(true);
          } catch {
            setManual(true);
          }
        }}
      >
        {copied ? labels[language].copied : labels[language].share}
      </button>
      {manual && (
        <input
          readOnly
          aria-label={labels[language].share}
          value={location.href}
          onFocus={(e) => e.target.select()}
        />
      )}
    </div>
  );
}

function Video({
  path,
  poster,
  title,
  workId,
}: {
  path: string;
  poster?: string;
  title: string;
  workId?: string;
}) {
  const { language } = useLanguage();
  const [src, setSrc] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState(false);
  const copy = labels[language];
  async function play() {
    setWaiting(true);
    setError(false);
    try {
      const url =
        isStream(path) && workId
          ? await streamPlayback(workId, path)
          : (await mediaUrls([path]))[path];
      if (!url) throw new Error();
      setSrc(url);
    } catch {
      setError(true);
    } finally {
      setWaiting(false);
    }
  }
  return (
    <div className="work-film">
      {src && isStream(path) ? (
        <iframe
          className="work-stream"
          src={src}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : src ? (
        <video
          controls
          playsInline
          autoPlay
          preload="metadata"
          poster={poster}
          src={src}
          aria-label={title}
          onError={() => {
            setSrc('');
            setError(true);
          }}
        />
      ) : (
        <button disabled={waiting} onClick={play} aria-label={copy.play + ' · ' + title}>
          {poster && <img src={poster} alt="" />}
          <strong>{waiting ? copy.loading : '▶ ' + copy.play}</strong>
        </button>
      )}
      {error && <p role="alert">{copy.unavailable}</p>}
    </div>
  );
}

function PublishedWork({ id }: { id: string }) {
  const { language } = useLanguage();
  const c = labels[language];
  const [work, setWork] = useState<Work | null | undefined>();
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState(false);
  const [attempt, retry] = useState(0);
  useEffect(() => {
    let alive = true;
    setFailed(false);
    getWork(id)
      .then(async (row) => {
        const urls = await mediaUrls(row?.photos ?? []);
        if (alive) {
          setWork(row);
          setPhotos(urls);
        }
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [id, attempt]);
  if (failed)
    return (
      <p role="alert">
        {c.fail} <button onClick={() => retry((n) => n + 1)}>{c.retry}</button>
      </p>
    );
  if (!work) return <p role="status">{work === null ? c.missing : c.loading}</p>;
  const parent = projectKey(work);
  const link = safeHref(work.website_url);
  return (
    <>
      <small>{c[work.kind]}</small>
      <h1>{work.title}</h1>
      {parent && (
        <p>
          <a
            href={
              work.parent_id
                ? workUrl(work.parent_id, language)
                : projectUrl(work.project_slug!, language)
            }
          >
            {c.related}
          </a>
        </p>
      )}
      {link && (
        <p>
          <a className="work-action primary" href={link} target="_blank" rel="noopener noreferrer">
            {c.visit} ↗
          </a>
        </p>
      )}
      {work.video_path && (
        <Video
          workId={work.id}
          path={work.video_path}
          poster={photos[work.photos[0]]}
          title={work.title}
        />
      )}
      <div className="work-photos">
        {(work.video_path ? work.photos.slice(1) : work.photos).map(
          (p, i) =>
            photos[p] && (
              <a key={p} href={photos[p]} target="_blank" rel="noopener noreferrer">
                <img
                  src={photos[p]}
                  loading="lazy"
                  decoding="async"
                  alt={work.title + ' · ' + c.photo + ' ' + (i + 1)}
                />
              </a>
            )
        )}
      </div>
      <Share />
      {work.kind === 'website' && (
        <WorkShelf key={work.id} scope="project" parent={'work/' + work.id} language={language} />
      )}
    </>
  );
}

function LegacyProject({ slug }: { slug: string }) {
  const { language } = useLanguage();
  const { projects, loading } = useProjects();
  const project = projects.find((p) => p.id === slug);
  const c = labels[language];
  if (!project) return <p role="status">{loading ? c.loading : c.missing}</p>;
  const photos = [...new Set([project.image, ...(project.screenshots ?? [])].filter(Boolean))];
  const filmId = (
    { 'ninnyo-flowers': 'ninnyo-friday', souvlaki: 'souvlaki-2' } as Record<string, string>
  )[slug];
  const film = VIDEO_PORTFOLIO.find((v) => v.id === filmId);
  return (
    <>
      <h1>{project.title}</h1>
      <p>{project.description}</p>
      {safeHref(project.link) && (
        <p>
          <a
            className="work-action primary"
            href={safeHref(project.link)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.visit} ↗
          </a>
        </p>
      )}
      {film && <Video path={film.src} poster={film.poster} title={film.title[language]} />}
      <div className="work-photos">
        {photos.map((p) => (
          <img key={p} src={safeHref(p)} alt={project.title} loading="lazy" decoding="async" />
        ))}
      </div>
      <Share />
      <WorkShelf scope="project" parent={'project/' + slug} language={language} />
    </>
  );
}

export default function WorkPage() {
  const { slug, id } = useParams();
  const { language, dir } = useLanguage();
  return (
    <article className="work-page" dir={dir}>
      <link rel="stylesheet" href="/portfolio-work.css" precedence="work" />
      <p>
        <a href={'/projects?lang=' + language}>{labels[language].back}</a>
      </p>
      {slug ? <LegacyProject key={slug} slug={slug} /> : id && <PublishedWork key={id} id={id} />}
    </article>
  );
}
