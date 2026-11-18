import { useEffect, useRef, useState } from 'react';
import type { Language } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import { getPage, mediaUrls } from './repository';
import { labels, PAGE_SIZE, thumbnailPath, workUrl, type Scope, type Work } from './model';

interface Page {
  items: Work[];
  covers: Record<string, string>;
  more: boolean;
}

export default function WorkShelf({
  scope,
  parent = '',
  language,
  defer = false,
}: {
  scope: Scope;
  parent?: string;
  language: Language;
  defer?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(!defer);
  const [offset, setOffset] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState<Page>({ items: [], covers: {}, more: false });
  const [status, setStatus] = useState<'busy' | 'done' | 'error'>('busy');
  const copy = labels[language];
  useEffect(() => {
    if (ready || !box.current) return;
    if (!window.IntersectionObserver) {
      setReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '360px' }
    );
    observer.observe(box.current);
    return () => observer.disconnect();
  }, [ready]);
  useEffect(() => {
    if (!ready || !isSupabaseConfigured) return;
    let alive = true;
    setStatus('busy');
    getPage(scope, offset, parent)
      .then(async (rows) => {
        const batch = rows.slice(0, PAGE_SIZE);
        const covers = await mediaUrls(
          batch.flatMap((row) => row.photos.slice(0, 1).map(thumbnailPath))
        );
        if (!alive) return;
        setPage((old) => ({
          items: offset
            ? [...new Map([...old.items, ...batch].map((item) => [item.id, item])).values()]
            : batch,
          covers: offset ? { ...old.covers, ...covers } : covers,
          more: scope !== 'featured' && rows.length > PAGE_SIZE,
        }));
        setStatus('done');
      })
      .catch(() => {
        if (alive) setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [scope, offset, parent, attempt, ready]);

  return (
    <div
      ref={box}
      className={'work-shelf work-shelf-' + scope}
      dir={language === 'en' ? 'ltr' : 'rtl'}
    >
      {page.items.length > 0 && (
        <section aria-label={copy[scope]}>
          <link rel="stylesheet" href="/portfolio-work.css" precedence="work" />
          <h2>{copy[scope]}</h2>
          <div className="work-grid">
            {page.items.map((item) => (
              <a className="work-card" key={item.id} href={workUrl(item.id, language)}>
                {page.covers[thumbnailPath(item.photos[0])] ? (
                  <img
                    loading="lazy"
                    decoding="async"
                    width="480"
                    height="320"
                    alt=""
                    src={page.covers[thumbnailPath(item.photos[0])]}
                  />
                ) : (
                  <span className="work-placeholder" aria-hidden="true">
                    {item.kind === 'video' ? '▶' : '◇'}
                  </span>
                )}
                <span>
                  <small>{copy[item.kind]}</small>
                  <strong>{item.title}</strong>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
      {page.more && status !== 'error' && (
        <button
          className="work-action"
          disabled={status === 'busy'}
          onClick={() => setOffset((n) => n + PAGE_SIZE)}
        >
          {status === 'busy' ? copy.loading : copy.more}
        </button>
      )}
      {status === 'error' && (scope === 'project' || page.items.length > 0) && (
        <p role="status">
          {copy.fail} <button onClick={() => setAttempt((n) => n + 1)}>{copy.retry}</button>
        </p>
      )}
    </div>
  );
}
